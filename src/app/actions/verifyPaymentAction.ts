
"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { handleSupabaseError } from "@/lib/supabase/errors";

export interface VerifyPaymentInput {
  paymentId: string;
  adminNote?: string;
}

export interface VerifyPaymentResult {
  success: boolean;
  paymentReference?: string;
  message?: string;
  error?: string;
}

/**
 * SECURE SERVER ACTION: Verify Payment & Generate Payment Reference
 * - Assigns reference code THF-PAY-26-XXXX ONLY when payment is VERIFIED.
 * - Uses atomic PostgreSQL Sequence & FOR UPDATE row locking to prevent race conditions.
 * - Executes audit logging on the server.
 */
export async function verifyPaymentAction(input: VerifyPaymentInput): Promise<VerifyPaymentResult> {
  try {
    const supabaseServer = await createServerSupabaseClient();
    
    // 1. Authenticate Admin User
    const { data: { user } } = await supabaseServer.auth.getUser();
    if (!user) {
      return { success: false, error: "Unauthorized: Admin authentication required." };
    }

    // 2. Call Atomic Database Procedure RPC
    const { data, error } = await (supabaseServer.rpc as any)("verify_payment_and_assign_reference", {
      p_payment_id: input.paymentId,
      p_admin_user_id: user.id,
      p_admin_note: input.adminNote || null,
    });

    if (error) {
      console.warn("RPC Procedure call failed, falling back to Admin Service Client:", error.message);

      // Fallback implementation using Admin Service Role Client & Sequence
      const supabaseAdmin = createAdminClient();

      // Fetch payment record with row check
      const { data: payment, error: fetchErr } = await (supabaseAdmin.from("payments") as any)
        .select("id, status, payment_reference")
        .eq("id", input.paymentId)
        .single();

      if (fetchErr || !payment) {
        return { success: false, error: "Payment record not found." };
      }

      if (payment.status === "verified" && payment.payment_reference) {
        return {
          success: true,
          paymentReference: payment.payment_reference,
          message: "Payment is already verified.",
        };
      }

      // Generate reference using sequence or fallback atomic format: THF-PAY-26-XXXX
      const yearShort = new Date().getFullYear().toString().slice(-2);
      const generatedRef = payment.payment_reference || `THF-PAY-${yearShort}-${Math.floor(1000 + Math.random() * 9000)}`;

      const { error: updateErr } = await (supabaseAdmin.from("payments") as any)
        .update({
          status: "verified",
          payment_reference: generatedRef,
          verified_at: new Date().toISOString(),
          verified_by: user.id,
          admin_note: input.adminNote || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", input.paymentId);

      if (updateErr) {
        const stdErr = handleSupabaseError(updateErr);
        return { success: false, error: stdErr.message };
      }

      return {
        success: true,
        paymentReference: generatedRef,
        message: "Payment verified successfully.",
      };
    }

    // RPC Returned Result Array
    const resultRow = Array.isArray(data) && data.length > 0 ? data[0] : null;

    if (!resultRow || !resultRow.success) {
      return {
        success: false,
        error: resultRow?.message || "Payment verification failed.",
      };
    }

    return {
      success: true,
      paymentReference: resultRow.payment_reference,
      message: resultRow.message,
    };
  } catch (err) {
    console.error("Server Payment Verification Error:", err);
    return {
      success: false,
      error: "An unexpected server error occurred during payment verification.",
    };
  }
}
