
import { INITIAL_SUBMISSIONS, PaymentSubmission } from "@/lib/mockData";
import { getStoredSubmissions, addStoredSubmission } from "@/lib/studentStore";

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
 * Server Action: Check if a payment already exists for student + month + year
 */
export async function checkPaymentPeriodStatus(
  studentRegNo: string,
  month: string,
  year: number
): Promise<CheckPeriodResult> {
  const normalizedRegNo = studentRegNo.trim().toUpperCase();
  
  const allSubmissions = typeof window !== "undefined" ? getStoredSubmissions() : INITIAL_SUBMISSIONS;
  const existing = allSubmissions.find(
    (sub) =>
      sub.studentRegNo.toUpperCase() === normalizedRegNo &&
      sub.paymentMonth.toLowerCase() === month.toLowerCase() &&
      sub.academicYear === year
  );

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
 * Server Action: Process payment submission with full server validation
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

    // 5. Check Duplicate Period Status on Server
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

    // 6. Generate Unique Payment Reference Code: THF-PAY-YY-XXXX
    const generatedRef = `THF-PAY-26-000${INITIAL_SUBMISSIONS.length + 1}`;

    // 7. Log Record into Dataset
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
      proofUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80",
      status: "PENDING",
      createdAt: new Date().toISOString(),
    };

    INITIAL_SUBMISSIONS.unshift(newSubmission);

    if (typeof window !== "undefined") {
      addStoredSubmission(newSubmission);
    }

    return {
      success: true,
      paymentRef: generatedRef,
    };
  } catch (err) {
    console.error("Server Payment Submission Error:", err);
    return {
      success: false,
      error: "An unexpected server error occurred during submission. Please try again.",
    };
  }
}
