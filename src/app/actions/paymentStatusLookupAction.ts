import { INITIAL_SUBMISSIONS, INITIAL_STUDENTS } from "@/lib/mockData";
import { getStoredStudents, getStoredSubmissions } from "@/lib/studentStore";
import { formatNameWithInitials } from "@/lib/utils";
import { THOFNAA_CONFIG } from "@/lib/constants";

export interface StatusLookupInput {
  studentRegNo: string;
  parentEmail: string;
}

export interface PaymentHistoryItem {
  monthYear: string;
  amountLKR: number;
  status: "VERIFIED" | "PENDING" | "CLARIFICATION_NEEDED" | "REJECTED" | "NOT_SUBMITTED";
  paymentReference?: string | null;
  submittedDate?: string | null;
}

export interface StatusLookupResult {
  success: boolean;
  studentInfo?: {
    registrationNo: string;
    nameWithInitials: string;
    grade: string;
    programme: string;
  };
  history?: PaymentHistoryItem[];
  error?: string;
}

/**
 * SECURE SERVER ACTION: Two-Factor Student Payment History Lookup
 * 
 * Privacy Safeguards:
 * 1. Requires BOTH Registration Number AND Parent Email.
 * 2. Does NOT allow lookup using Registration Number alone.
 * 3. Returns masked initials format (e.g., K. K. Perera).
 * 4. Strips proof storage paths, admin notes, and database internal IDs.
 */
export async function lookupPaymentStatusAction(
  input: StatusLookupInput
): Promise<StatusLookupResult> {
  try {
    const { studentRegNo, parentEmail } = input;

    if (!studentRegNo?.trim() || !parentEmail?.trim()) {
      return {
        success: false,
        error: "Please enter both Student Registration Number and Parent Email Address.",
      };
    }

    const normalizedRegNo = studentRegNo.trim().toUpperCase();
    const normalizedEmail = parentEmail.trim().toLowerCase();

    // 1. Validate Registration Number Regex (THF-YY-NNNN)
    const regNoRegex = /^THF-\d{2}-\d{4}$/;
    if (!regNoRegex.test(normalizedRegNo)) {
      return {
        success: false,
        error: "Invalid Registration Number format. Expected format: THF-26-0001.",
      };
    }

    // 2. Validate Matching Student in Database / Mock Dataset / Local Store
    const allStudents = typeof window !== "undefined" ? getStoredStudents() : INITIAL_STUDENTS;
    const mockStudent = allStudents.find(
      (s) =>
        s.studentRegNo.toUpperCase() === normalizedRegNo &&
        s.guardianEmail.toLowerCase() === normalizedEmail
    );

    let matchingStudent = mockStudent
      ? {
          registrationNo: mockStudent.studentRegNo,
          fullName: mockStudent.fullName,
          grade: mockStudent.gradeLevel,
          programme: mockStudent.programme || "Second Language Sinhala",
          email: mockStudent.guardianEmail,
        }
      : null;



    // 3. Dual-Factor Validation Guard: Must match BOTH fields
    if (!matchingStudent) {
      return {
        success: false,
        error: "No student record matching this Registration Number and Parent Email combination was found. Please check your details.",
      };
    }

    // 4. Fetch Payment Submissions for this Student
    const allSubmissions = typeof window !== "undefined" ? getStoredSubmissions() : INITIAL_SUBMISSIONS;
    const studentSubmissions = allSubmissions.filter(
      (s) => s.studentRegNo.toUpperCase() === normalizedRegNo
    );

    // Build 12-Month Academic History Roster for 2026
    const monthsList = [
      "January", "February", "March", "April", 
      "May", "June", "July", "August", 
      "September", "October", "November", "December"
    ];

    const history: PaymentHistoryItem[] = monthsList.map((monthName) => {
      const match = studentSubmissions.find(
        (sub) => sub.paymentMonth.toLowerCase() === monthName.toLowerCase()
      );

      if (!match) {
        return {
          monthYear: `${monthName} 2026`,
          amountLKR: 1000,
          status: "NOT_SUBMITTED",
          paymentReference: null,
          submittedDate: null,
        };
      }

      return {
        monthYear: `${match.paymentMonth} ${match.academicYear}`,
        amountLKR: match.feeAmount,
        status: match.status as PaymentHistoryItem["status"],
        paymentReference: match.paymentRef || null,
        submittedDate: new Date(match.createdAt).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
      };
    });

    // 5. Mask Student Full Name for Privacy (e.g., Kasun Kalhara Perera -> K. K. Perera)
    //    Strip any [DEMO] or [DEMO PARENT] tags that exist only in mock data.
    const cleanedFullName = matchingStudent.fullName
      .replace(/\[.*?\]\s*/g, "")
      .trim();
    const maskedName = formatNameWithInitials(cleanedFullName);

    return {
      success: true,
      studentInfo: {
        registrationNo: matchingStudent.registrationNo,
        nameWithInitials: maskedName,
        grade: matchingStudent.grade,
        programme: matchingStudent.programme,
      },
      history,
    };
  } catch (err) {
    console.error("Payment Status Lookup Exception:", err);
    return {
      success: false,
      error: "An unexpected error occurred while looking up payment status.",
    };
  }
}
