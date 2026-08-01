import { INITIAL_STUDENTS } from "@/lib/mockData";
import { getStoredStudents } from "@/lib/studentStore";
import { clientEnv } from "@/lib/env";

export interface PublicStudentInfo {
  id: string;
  registrationNo: string;
  nameWithInitials: string;
  grade: string;
  programme: string;
  monthlyFeeLKR: number;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
}

export interface LookupResult {
  success: boolean;
  student?: PublicStudentInfo;
  error?: string;
}

/**
 * Secure Action for THOFNAA Student Registration Lookup.
 * - Normalizes input to uppercase and trims spaces
 * - Validates format: THF-YY-NNNN (e.g. THF-26-0001)
 * - Queries Supabase 'students' table first if configured, falling back to local store
 * - Restricts returned dataset to non-sensitive fields only
 */
export async function lookupStudentRegNo(rawRegNo: string): Promise<LookupResult> {
  try {
    if (!rawRegNo || typeof rawRegNo !== "string") {
      return {
        success: false,
        error: "Please enter a Student Registration Number.",
      };
    }

    // 1. Normalize input to uppercase and trim spaces
    const normalizedRegNo = rawRegNo.trim().toUpperCase();

    // 2. Validate THF-YY-NNNN format (e.g. THF-26-0001)
    const regNoRegex = /^THF-\d{2}-\d{4}$/;
    if (!regNoRegex.test(normalizedRegNo)) {
      return {
        success: false,
        error: "Invalid registration format. Registration number must follow format THF-YY-NNNN (e.g., THF-26-0001).",
      };
    }

    let matchedStudent: any = null;

    // 3. Query Supabase Database if Supabase URL is configured and not default demo
    if (clientEnv.supabase.url && !clientEnv.supabase.url.includes("demo-thofnaa")) {
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(clientEnv.supabase.url, clientEnv.supabase.anonKey);
        const { data, error } = await supabase
          .from("students")
          .select("*")
          .ilike("student_reg_no", normalizedRegNo)
          .maybeSingle();

        if (data && !error) {
          matchedStudent = {
            id: data.id,
            studentRegNo: data.student_reg_no,
            fullName: data.full_name,
            gradeLevel: data.grade_level,
            batch: data.batch,
            programme: data.programme,
            guardianName: data.guardian_name,
            guardianEmail: data.guardian_email,
            guardianPhone: data.guardian_phone || data.whatsapp_number,
            whatsappNumber: data.whatsapp_number || data.guardian_phone,
            active: data.active !== false,
          };
        }
      } catch (err) {
        console.warn("Supabase student lookup warning:", err);
      }
    }

    // 4. Fallback to browser localStorage store or INITIAL_STUDENTS if not found in Supabase
    if (!matchedStudent) {
      const allStudents = typeof window !== "undefined" ? getStoredStudents() : INITIAL_STUDENTS;
      matchedStudent = allStudents.find(
        (s) => s.studentRegNo.toUpperCase() === normalizedRegNo
      );
    }

    // 5. Handle Unknown Registration Number
    if (!matchedStudent) {
      return {
        success: false,
        error: `Student Registration Number "${normalizedRegNo}" was not found in THOFNAA records. Please check your student ID card or contact administration on WhatsApp +94 75 460 3008.`,
      };
    }

    // 6. Handle Inactive / Suspended Student
    if (matchedStudent.active === false || ("status" in matchedStudent && matchedStudent.status !== "ACTIVE" && matchedStudent.status !== undefined)) {
      return {
        success: false,
        error: `Student registration "${normalizedRegNo}" is currently inactive or suspended. Please contact THOFNAA administration to reactivate your enrollment.`,
      };
    }

    // 7. Return ONLY Limited Un-sensitive Public Fields
    const publicStudent: PublicStudentInfo = {
      id: matchedStudent.id,
      registrationNo: matchedStudent.studentRegNo,
      nameWithInitials: getInitialsName(matchedStudent.fullName),
      grade: matchedStudent.gradeLevel,
      programme: matchedStudent.batch || matchedStudent.programme || "Foundation Sinhala",
      monthlyFeeLKR: 1000.00,
      status: "ACTIVE",
    };

    return {
      success: true,
      student: publicStudent,
    };
  } catch (err) {
    console.error("Student Lookup Error:", err);
    return {
      success: false,
      error: "An unexpected server error occurred during lookup. Please try again or contact support.",
    };
  }
}

/**
 * Helper to convert full name into limited initials format for student privacy
 * e.g., "Kasun Kalhara Perera" -> "K. K. Perera"
 */
function getInitialsName(fullName: string): string {
  const parts = fullName.replace(/\[DEMO\]\s*/g, "").trim().split(/\s+/);
  if (parts.length <= 1) return fullName;
  
  const last = parts[parts.length - 1];
  const initials = parts.slice(0, parts.length - 1).map((p) => `${p[0]}.`).join(" ");
  return `${initials} ${last}`;
}
