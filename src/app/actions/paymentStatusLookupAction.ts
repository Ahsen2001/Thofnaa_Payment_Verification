import { INITIAL_SUBMISSIONS, INITIAL_STUDENTS } from "@/lib/mockData";
import { getStoredStudents, getStoredSubmissions } from "@/lib/studentStore";
import { formatNameWithInitials } from "@/lib/utils";
import { clientEnv } from "@/lib/env";

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
 * Two-Factor Student Payment History Lookup
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

    let matchingStudent: any = null;

    // 2. Query Supabase Database if configured
    if (clientEnv.supabase.url && !clientEnv.supabase.url.includes("demo-thofnaa")) {
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(clientEnv.supabase.url, clientEnv.supabase.anonKey);
        const { data, error } = await supabase
          .from("students")
          .select("*")
          .ilike("student_reg_no", normalizedRegNo)
          .ilike("guardian_email", normalizedEmail)
          .maybeSingle();

        if (data && !error) {
          matchingStudent = {
            registrationNo: data.student_reg_no,
            fullName: data.full_name,
            grade: data.grade_level,
            programme: data.programme || data.batch || "Second Language Sinhala",
            email: data.guardian_email,
          };
        }
      } catch (err) {
        console.warn("Supabase status lookup student query warning:", err);
      }
    }

    // Fallback to localStorage / INITIAL_STUDENTS
    if (!matchingStudent) {
      const localStore = typeof window !== "undefined" ? getStoredStudents() : [];
      const allStudents = [...localStore, ...INITIAL_STUDENTS];
      const mockStudent = allStudents.find(
        (s) =>
          s.studentRegNo.toUpperCase() === normalizedRegNo &&
          s.guardianEmail.toLowerCase() === normalizedEmail
      );

      if (mockStudent) {
        matchingStudent = {
          registrationNo: mockStudent.studentRegNo,
          fullName: mockStudent.fullName,
          grade: mockStudent.gradeLevel,
          programme: mockStudent.programme || mockStudent.batch || "Second Language Sinhala",
          email: mockStudent.guardianEmail,
        };
      }
    }

    // 3. Dual-Factor Validation Guard: Must match BOTH fields
    if (!matchingStudent) {
      return {
        success: false,
        error: "No student record matching this Registration Number and Parent Email combination was found. Please check your details.",
      };
    }

    // 4. Fetch Payment Submissions for this Student
    let studentSubmissions: any[] = [];

    if (clientEnv.supabase.url && !clientEnv.supabase.url.includes("demo-thofnaa")) {
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(clientEnv.supabase.url, clientEnv.supabase.anonKey);
        const { data, error } = await supabase
          .from("payment_submissions")
          .select("*")
          .ilike("student_reg_no", normalizedRegNo);

        if (data && !error && data.length > 0) {
          studentSubmissions = data.map((d) => ({
            paymentMonth: d.payment_month,
            academicYear: d.academic_year,
            feeAmount: d.fee_amount,
            status: d.status,
            paymentRef: d.payment_ref,
            createdAt: d.created_at,
          }));
        }
      } catch (err) {
        console.warn("Supabase status lookup submissions query warning:", err);
      }
    }

    if (studentSubmissions.length === 0) {
      const allSubmissions = typeof window !== "undefined" ? getStoredSubmissions() : INITIAL_SUBMISSIONS;
      studentSubmissions = allSubmissions.filter(
        (s) => s.studentRegNo.toUpperCase() === normalizedRegNo
      );
    }

    // Build 12-Month Academic History Roster for 2026
    const monthsList = [
      "January", "February", "March", "April", 
      "May", "June", "July", "August", 
      "September", "October", "November", "December"
    ];

    const history: PaymentHistoryItem[] = monthsList.map((monthName) => {
      const match = studentSubmissions.find(
        (sub) => sub && (sub.paymentMonth || "").toLowerCase() === monthName.toLowerCase()
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

      const createdDate = match.createdAt ? new Date(match.createdAt) : new Date();
      const isValidDate = !isNaN(createdDate.getTime());

      return {
        monthYear: `${match.paymentMonth || monthName} ${match.academicYear || 2026}`,
        amountLKR: match.feeAmount || 1000,
        status: (match.status as PaymentHistoryItem["status"]) || "NOT_SUBMITTED",
        paymentReference: match.paymentRef || null,
        submittedDate: isValidDate ? createdDate.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }) : null,
      };
    });

    // 5. Mask Student Full Name for Privacy
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
