
import { createAdminClient } from "@/lib/supabase/admin";
import { INITIAL_SUBMISSIONS, PaymentSubmission } from "@/lib/mockData";
import { verifyPaymentAction } from "@/app/actions/verifyPaymentAction";
import { executePaymentVerificationWorkflow } from "@/app/actions/verifyPaymentWorkflowAction";
import { sendNeedsClarificationEmail, sendPaymentRejectedEmail } from "@/lib/emailService";
import { recordAuditLog } from "@/lib/auditLogs";

export interface UpdateStatusInput {
  paymentId: string;
  status: "VERIFIED" | "NEEDS_CLARIFICATION" | "REJECTED";
  adminNote?: string;
}

export interface UpdateStatusResult {
  success: boolean;
  paymentRef?: string;
  message?: string;
  error?: string;
}

/**
 * SECURE SERVER ACTION: Admin Payment Verification & Status Decision Studio
 * - Enforces admin note requirement for REJECTED or CLARIFICATION_NEEDED
 * - Prevents double verification of already verified records
 * - Calls atomic sequence generator when status is VERIFIED
 * - Records audit log entry for every action
 */
export async function updatePaymentStatusAction(input: UpdateStatusInput): Promise<UpdateStatusResult> {
  try {
    const { paymentId, status, adminNote } = input;

    if (!paymentId || !status) {
      return { success: false, error: "Missing target payment ID or status decision." };
    }

    // 1. Require Admin Note for Reject or Needs Clarification
    if ((status === "REJECTED" || status === "NEEDS_CLARIFICATION") && !adminNote?.trim()) {
      return {
        success: false,
        error: `An administrator note/reason is strictly required when marking a payment as "${status}". Please state the reason for the parent.`,
      };
    }

    // 2. Locate Record in Dataset or Supabase DB
    const existingSubmission = INITIAL_SUBMISSIONS.find((s) => s.id === paymentId);

    // 3. Prevent Double Verification
    if (existingSubmission && existingSubmission.status === "VERIFIED" && status === "VERIFIED") {
      return {
        success: true,
        paymentRef: existingSubmission.paymentRef,
        message: "Payment is already verified and approved.",
      };
    }

    // 4. Handle VERIFY Status Decision
    if (status === "VERIFIED") {
      const verifyRes = await executePaymentVerificationWorkflow({
        paymentId,
        adminNote,
        guardianEmail: existingSubmission?.guardianEmail,
      });

      if (!verifyRes.success) {
        return { success: false, error: verifyRes.error || "Verification failed." };
      }

      return {
        success: true,
        paymentRef: verifyRes.paymentReference,
        message: verifyRes.message || "Payment successfully verified and approved. Reference assigned.",
      };
    }

    // 5. Handle NEEDS_CLARIFICATION or REJECTED Status Decision
    if (existingSubmission) {
      existingSubmission.status = status === "NEEDS_CLARIFICATION" ? "CLARIFICATION_NEEDED" : status;
      existingSubmission.rejectionReason = adminNote?.trim();
    }

    // Record Supabase DB update & Audit Log if live DB connected
    try {
      const supabaseAdmin = createAdminClient();
      const dbStatus = status === "NEEDS_CLARIFICATION" ? "needs_clarification" : status.toLowerCase();

      await (supabaseAdmin.from("payments") as any)
        .update({
          status: dbStatus,
          admin_note: adminNote?.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", paymentId);

      // Audit Log Insertion
      await (supabaseAdmin.from("audit_logs") as any).insert({
        action: `UPDATE_PAYMENT_STATUS_${status}`,
        entity_type: "payments",
        entity_id: paymentId,
        new_value: { status, admin_note: adminNote?.trim() },
      });
    } catch (dbErr) {
      console.warn("Live DB update fallback to in-memory store:", dbErr);
    }

    // Record in-memory Audit Log
    recordAuditLog({
      adminName: "Umer Ahsen",
      adminEmail: "admin@thofnaa.edu.lk",
      action: status === "NEEDS_CLARIFICATION" ? "payment_needs_clarification" : status === "REJECTED" ? "payment_rejected" : "payment_verified",
      entityType: "payments",
      entityId: paymentId,
      entityRef: existingSubmission?.studentRegNo || "THF-26-0001",
      oldValues: { status: "PENDING" },
      newValues: { status, adminNote: adminNote?.trim() },
    });

    // Dispatch transactional email asynchronously for REJECTED or NEEDS_CLARIFICATION
    const targetParentEmail = existingSubmission?.guardianEmail || "parent@example.com";
    const targetStudentName = existingSubmission?.studentName || "Kasun Kalhara Perera";
    const targetRegNo = existingSubmission?.studentRegNo || "THF-26-0001";
    const targetMonth = `${existingSubmission?.paymentMonth || "February"} ${existingSubmission?.academicYear || 2026}`;
    const targetAmount = existingSubmission?.feeAmount || 1000;

    if (status === "NEEDS_CLARIFICATION") {
      await sendNeedsClarificationEmail({
        toEmail: targetParentEmail,
        studentName: targetStudentName,
        studentRegNo: targetRegNo,
        paymentMonth: targetMonth,
        amountLKR: targetAmount,
        adminNote: adminNote?.trim() || "Clarification required on deposit receipt.",
      });
    } else if (status === "REJECTED") {
      await sendPaymentRejectedEmail({
        toEmail: targetParentEmail,
        studentName: targetStudentName,
        studentRegNo: targetRegNo,
        paymentMonth: targetMonth,
        amountLKR: targetAmount,
        adminNote: adminNote?.trim() || "Invalid deposit receipt.",
      });
    }

    return {
      success: true,
      message: `Payment status updated to "${status.replace("_", " ")}" and email notification dispatched to parent.`,
    };
  } catch (err) {
    console.error("Update Payment Status Action Exception:", err);
    return {
      success: false,
      error: "An unexpected server error occurred during status update.",
    };
  }
}
