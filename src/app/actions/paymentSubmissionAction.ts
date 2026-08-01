import { INITIAL_SUBMISSIONS, PaymentSubmission } from "@/lib/mockData";
import { getStoredSubmissions, addStoredSubmission } from "@/lib/studentStore";
import { clientEnv } from "@/lib/env";

export interface SubmitPaymentInput {
  studentRegNo: string;
  studentName: string;
  grade: string;
  programme: string;
  paymentMonth: string; // e.g. "February"
  paymentMonthInt: number; // 1 - 12
  paymentYear: number; // e.g. 2026
  amount: number; // e.g. 1000
  paymentDate: string; // YYYY-MM-DD
  paymentMethod: "Bank Transfer" | "Cash Deposit" | "Online Transfer" | "Other";
  bankReference?: string;
  parentEmail: string;
  parentWhatsapp: string;
  proofFileName: string;
  proofFileSizeMB: number;
  proofFileType: string;
  proofDataUrl?: string;
}

export interface CheckPeriodResult {
  allowed: boolean;
  status?: "VERIFIED" | "PENDING" | "REJECTED" | "CLARIFICATION_NEEDED";
  message?: string;
  adminNote?: string;
}

export interface SubmitPaymentResult {
  success: boolean;
  paymentRef?: string;
  error?: string;
  existingStatus?: string;
}

/**
 * Check if a payment already exists for student + month + year
 */
export async function checkPaymentPeriodStatus(
  studentRegNo: string,
  month: string,
  year: number
): Promise<CheckPeriodResult> {
  const normalizedRegNo = studentRegNo.trim().toUpperCase();
  let existing: any = null;

  // 1. Try Supabase lookup if configured
  if (clientEnv.supabase.url && !clientEnv.supabase.url.includes("demo-thofnaa")) {
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(clientEnv.supabase.url, clientEnv.supabase.anonKey);
      const { data, error } = await supabase
        .from("payment_submissions")
        .select("*")
        .ilike("student_reg_no", normalizedRegNo)
        .ilike("payment_month", month)
        .eq("academic_year", year)
        .maybeSingle();

      if (data && !error) {
        existing = {
          studentRegNo: data.student_reg_no,
          paymentMonth: data.payment_month,
          academicYear: data.academic_year,
          status: data.status,
          paymentRef: data.payment_ref,
          rejectionReason: data.rejection_reason,
          adminNotes: data.admin_notes,
        };
      }
    } catch (err) {
      console.warn("Supabase period check warning:", err);
    }
  }

  // 2. Fallback to localStorage / INITIAL_SUBMISSIONS
  if (!existing) {
    const allSubmissions = typeof window !== "undefined" ? getStoredSubmissions() : INITIAL_SUBMISSIONS;
    existing = allSubmissions.find(
      (sub) =>
        sub.studentRegNo.toUpperCase() === normalizedRegNo &&
        sub.paymentMonth.toLowerCase() === month.toLowerCase() &&
        sub.academicYear === year
    );
  }

  if (!existing) {
    return { allowed: true };
  }

  if (existing.status === "VERIFIED") {
    return {
      allowed: false,
      status: "VERIFIED",
      message: `Payment for ${month} ${year} has already been verified and approved. Another submission is not allowed for this period.`,
    };
  }

  if (existing.status === "PENDING") {
    return {
      allowed: false,
      status: "PENDING",
      message: `A payment submission for ${month} ${year} (Ref: ${existing.paymentRef}) is currently waiting for administrative verification. Please wait for review.`,
    };
  }

  if (existing.status === "CLARIFICATION_NEEDED") {
    return {
      allowed: true,
      status: "CLARIFICATION_NEEDED",
      message: `Previous submission for ${month} ${year} requires clarification: "${existing.rejectionReason || "Please re-upload a clear receipt."}". You may submit a new proof.`,
      adminNote: existing.adminNotes || existing.rejectionReason,
    };
  }

  if (existing.status === "REJECTED") {
    return {
      allowed: true,
      status: "REJECTED",
      message: `Previous submission for ${month} ${year} was rejected: "${existing.rejectionReason || "Invalid receipt."}". You may submit a new payment proof.`,
      adminNote: existing.rejectionReason,
    };
  }

  return { allowed: true };
}

/**
 * Process payment submission with server validation and Supabase DB sync
 */
export async function submitPaymentForm(input: SubmitPaymentInput): Promise<SubmitPaymentResult> {
  try {
    // 1. Validate Required Fields
    if (!input.studentRegNo || !input.paymentMonth || !input.paymentYear) {
      return { success: false, error: "Missing student registration or tuition period." };
    }

    if (!input.amount || input.amount <= 0) {
      return { success: false, error: "Amount paid must be greater than LKR 0." };
    }

    if (!input.paymentDate) {
      return { success: false, error: "Payment transfer date is required." };
    }

    // 2. Validate Parent Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!input.parentEmail || !emailRegex.test(input.parentEmail.trim())) {
      return { success: false, error: "Please provide a valid parent email address for receipt delivery." };
    }

    // 3. Validate WhatsApp Number
    if (!input.parentWhatsapp || input.parentWhatsapp.trim().length < 8) {
      return { success: false, error: "Please provide a valid parent WhatsApp contact number." };
    }

    // 4. Validate File Upload
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
    if (!input.proofFileType || !allowedTypes.includes(input.proofFileType.toLowerCase())) {
      return {
        success: false,
        error: "Invalid file type. Payment proof must be a JPG, JPEG, PNG image or PDF document.",
      };
    }

    if (input.proofFileSizeMB > 10) {
      return {
        success: false,
        error: "File size exceeds the 10 MB limit. Please upload a smaller receipt file.",
      };
    }

    // 5. Check Duplicate Period Status
    const periodCheck = await checkPaymentPeriodStatus(
      input.studentRegNo,
      input.paymentMonth,
      input.paymentYear
    );

    if (!periodCheck.allowed) {
      return {
        success: false,
        error: periodCheck.message,
        existingStatus: periodCheck.status,
      };
    }

    // 6. Generate Unique Payment Reference Code: THF-PAY-26-XXXX
    const generatedRef = `THF-PAY-26-${Math.floor(1000 + Math.random() * 9000)}`;

    const newSubmission: PaymentSubmission = {
      id: `sub-${Date.now()}`,
      paymentRef: generatedRef,
      studentId: `std-${input.studentRegNo}`,
      studentRegNo: input.studentRegNo.toUpperCase(),
      studentName: input.studentName,
      guardianEmail: input.parentEmail,
      guardianPhone: input.parentWhatsapp,
      paymentMonth: input.paymentMonth,
      academicYear: input.paymentYear,
      feeAmount: input.amount,
      paymentMethod: input.paymentMethod,
      bankName: "People's Bank",
      transactionDate: input.paymentDate,
      depositReferenceNo: input.bankReference || "N/A",
      proofFileName: input.proofFileName,
      proofUrl: input.proofDataUrl || "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80",
      status: "PENDING",
      createdAt: new Date().toISOString(),
    };

    INITIAL_SUBMISSIONS.unshift(newSubmission);

    if (typeof window !== "undefined") {
      addStoredSubmission(newSubmission);
    }

    // 7. Sync to Supabase Database if configured
    if (clientEnv.supabase.url && !clientEnv.supabase.url.includes("demo-thofnaa")) {
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(clientEnv.supabase.url, clientEnv.supabase.anonKey);
        await supabase.from("payment_submissions").insert({
          id: newSubmission.id,
          payment_ref: newSubmission.paymentRef,
          student_id: newSubmission.studentId,
          student_reg_no: newSubmission.studentRegNo,
          student_name: newSubmission.studentName,
          guardian_email: newSubmission.guardianEmail,
          guardian_phone: newSubmission.guardianPhone,
          payment_month: newSubmission.paymentMonth,
          academic_year: newSubmission.academicYear,
          fee_amount: newSubmission.feeAmount,
          payment_method: newSubmission.paymentMethod,
          bank_name: newSubmission.bankName,
          transaction_date: newSubmission.transactionDate,
          deposit_reference_no: newSubmission.depositReferenceNo,
          proof_file_name: newSubmission.proofFileName,
          proof_url: newSubmission.proofUrl,
          status: newSubmission.status,
          created_at: newSubmission.createdAt,
        } as any);
      } catch (err) {
        console.warn("Supabase payment submission insert warning:", err);
      }
    }

    return {
      success: true,
      paymentRef: generatedRef,
    };
  } catch (err) {
    console.error("Payment Submission Error:", err);
    return {
      success: false,
      error: "An unexpected server error occurred during submission. Please try again.",
    };
  }
}
