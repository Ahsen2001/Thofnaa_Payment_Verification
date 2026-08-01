"use server";

import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { handleSupabaseError } from "@/lib/supabase/errors";

export interface UploadProofInput {
  studentRegNo: string;
  studentId: string;
  paymentMonthInt: number; // 1 - 12
  paymentYear: number;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  bankReference?: string;
  parentEmail: string;
  parentWhatsapp: string;
  // File payload passed as FormData or Buffer
  fileBuffer: ArrayBuffer;
  fileName: string;
  fileMimeType: string;
  fileSizeBytes: number;
}

export interface UploadProofResult {
  success: boolean;
  paymentRef?: string;
  proofPath?: string;
  error?: string;
}

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "application/pdf",
]);

const BLOCKED_EXTENSIONS = new Set([
  "exe", "sh", "bat", "cmd", "js", "mjs", "php", "html", "htm", 
  "svg", "dll", "vbs", "ps1", "jar", "cgi", "pl", "py", "asp", "aspx"
]);

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB Limit

/**
 * SECURE SERVER ACTION: Payment Proof Upload & Database Registration
 * - Validates MIME type & file extension server-side
 * - Randomizes file name using crypto.randomUUID()
 * - Blocks executable and dangerous script extensions
 * - Uploads to private bucket 'payment-proofs'
 * - Transactional Rollback: Cleans up storage if DB insert fails
 */
export async function secureUploadPaymentProof(input: UploadProofInput): Promise<UploadProofResult> {
  let uploadedStoragePath: string | null = null;
  let supabaseAdmin;

  try {
    // 1. Server-Side MIME Type Validation
    const normalizedMime = input.fileMimeType.toLowerCase().trim();
    if (!ALLOWED_MIME_TYPES.has(normalizedMime)) {
      return {
        success: false,
        error: `Security Violation: File type "${input.fileMimeType}" is strictly prohibited. Allowed types: JPG, PNG, PDF.`,
      };
    }

    // 2. Server-Side File Extension Security Check
    const rawExtension = input.fileName.split(".").pop()?.toLowerCase() || "";
    if (BLOCKED_EXTENSIONS.has(rawExtension)) {
      return {
        success: false,
        error: `Security Violation: Executable or script extension ".${rawExtension}" is blocked.`,
      };
    }

    // Determine safe extension based on validated MIME
    let safeExtension = "jpg";
    if (normalizedMime === "image/png") safeExtension = "png";
    if (normalizedMime === "application/pdf") safeExtension = "pdf";

    // 3. Server-Side File Size Validation (<= 10 MB)
    if (input.fileSizeBytes > MAX_FILE_SIZE_BYTES) {
      return {
        success: false,
        error: `File size (${(input.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB) exceeds the maximum 10 MB limit.`,
      };
    }

    // 4. Construct Randomized & Sanitized Private Storage Path
    // Path Structure: {studentRegNo}/{year}/{month_padded}/{random_uuid}.{ext}
    const monthPadded = String(input.paymentMonthInt).padStart(2, "0");
    const uniqueFileId = crypto.randomUUID();
    const sanitizedRegNo = input.studentRegNo.replace(/[^A-Z0-9-]/gi, "");

    uploadedStoragePath = `${sanitizedRegNo}/${input.paymentYear}/${monthPadded}/${uniqueFileId}.${safeExtension}`;

    // Initialize Supabase Admin Service Role Client (Server-Only)
    supabaseAdmin = createAdminClient();

    // 5. Upload File to Private Supabase Storage Bucket ('payment-proofs')
    const buffer = Buffer.from(input.fileBuffer);
    const { error: storageError } = await supabaseAdmin.storage
      .from("payment-proofs")
      .upload(uploadedStoragePath, buffer, {
        contentType: normalizedMime,
        upsert: false,
      });

    if (storageError) {
      console.error("Supabase Storage Upload Error:", storageError);
      return {
        success: false,
        error: `Storage Upload Failed: ${storageError.message}. Database record was NOT created.`,
      };
    }

    // 6. Generate Reference Number & Insert into 'payments' Table
    const paymentRefCode = `THF-PAY-26-${crypto.randomInt(1000, 9999)}`;

    const { error: dbError } = await (supabaseAdmin.from("payments") as any).insert({
      payment_reference: paymentRefCode,
      student_id: input.studentId,
      payment_month: input.paymentMonthInt,
      payment_year: input.paymentYear,
      amount: input.amount,
      payment_date: input.paymentDate,
      payment_method: input.paymentMethod,
      bank_reference: input.bankReference || null,
      proof_path: uploadedStoragePath, // Private path stored in DB
      status: "pending",
    });

    // 7. TRANSACTIONAL ROLLBACK: Clean up orphaned file if DB insertion fails
    if (dbError) {
      console.error("Database Insert Error - Executing Storage Rollback:", dbError);
      
      // Remove orphaned file from private bucket
      await supabaseAdmin.storage.from("payment-proofs").remove([uploadedStoragePath]);

      const stdErr = handleSupabaseError(dbError);
      return {
        success: false,
        error: `Database registration failed: ${stdErr.message}. Uploaded file was automatically cleaned up.`,
      };
    }

    return {
      success: true,
      paymentRef: paymentRefCode,
      proofPath: uploadedStoragePath,
    };
  } catch (err) {
    console.error("Critical Payment Proof Action Exception:", err);

    // Rollback storage if uploaded before exception
    if (uploadedStoragePath && supabaseAdmin) {
      try {
        await supabaseAdmin.storage.from("payment-proofs").remove([uploadedStoragePath]);
      } catch (rollbackErr) {
        console.error("Storage Rollback Cleanup Failed:", rollbackErr);
      }
    }

    return {
      success: false,
      error: "A critical server error occurred during proof upload. Transaction rolled back safely.",
    };
  }
}

/**
 * SECURE ADMIN SIGNED URL GENERATOR
 * Generates a short-lived temporary Signed URL (15 minutes) for viewing proof.
 * Accessible ONLY to authenticated active admins.
 */
export async function getSecureProofSignedUrl(proofPath: string, expiresInSeconds = 900): Promise<{ url?: string; error?: string }> {
  try {
    const supabaseServer = await createServerSupabaseClient();
    
    // Check if caller is authenticated admin
    const { data: { user } } = await supabaseServer.auth.getUser();
    if (!user) {
      return { error: "Unauthorized: Admin authentication required to access payment proof." };
    }

    // Verify admin_profiles active status
    const { data: adminProfile } = await (supabaseServer
      .from("admin_profiles") as any)
      .select("active")
      .eq("user_id", user.id)
      .single();

    if (!adminProfile || !adminProfile.active) {
      return { error: "Access Denied: Inactive or unauthorized admin account." };
    }

    // Generate short-lived signed URL
    const { data, error } = await supabaseServer.storage
      .from("payment-proofs")
      .createSignedUrl(proofPath, expiresInSeconds);

    if (error || !data?.signedUrl) {
      return { error: `Failed to generate signed URL: ${error?.message}` };
    }

    return { url: data.signedUrl };
  } catch (err) {
    return { error: "Server error generating temporary signed URL." };
  }
}
