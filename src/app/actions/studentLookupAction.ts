"use server";

import { INITIAL_STUDENTS } from "@/lib/mockData";
import { getStoredStudents } from "@/lib/studentStore";

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
 * Secure Server Action for THOFNAA Student Registration Lookup.
 * - Normalizes input to uppercase and trims spaces
 * - Validates format: THF-YY-NNNN (e.g. THF-26-0001)
 * - Restricts returned dataset to non-sensitive fields only
 * - Prevents database leakage to browser client
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

    // 3. Perform Lookup (queries browser localStorage store or fallback mock roster in test/server)
    const allStudents = typeof window !== "undefined" ? getStoredStudents() : INITIAL_STUDENTS;
    const matchedStudent = allStudents.find(
      (s) => s.studentRegNo.toUpperCase() === normalizedRegNo
    );

    // 4. Handle Unknown Registration Number
    if (!matchedStudent) {
      return {
        success: false,
        error: `Student Registration Number "${normalizedRegNo}" was not found in THOFNAA records. Please check your student ID card or contact administration on WhatsApp +94 75 460 3008.`,
      };
    }

    // 5. Handle Inactive / Suspended Student
    if ("status" in matchedStudent && matchedStudent.status !== "ACTIVE") {
      return {
        success: false,
        error: `Student registration "${normalizedRegNo}" is currently inactive or suspended. Please contact THOFNAA administration to reactivate your enrollment.`,
      };
    }

    // 6. Return ONLY Limited Un-sensitive Public Fields
    // EXCLUDES: full parent name, email, WhatsApp, address, or sensitive profile information
    const publicStudent: PublicStudentInfo = {
      id: matchedStudent.id,
      registrationNo: matchedStudent.studentRegNo,
      nameWithInitials: getInitialsName(matchedStudent.fullName),
      grade: matchedStudent.gradeLevel,
      programme: matchedStudent.batch || "Foundation Sinhala",
      monthlyFeeLKR: 1000.00,
      status: "ACTIVE",
    };

    return {
      success: true,
      student: publicStudent,
    };
  } catch (err) {
    console.error("Server Student Lookup Error:", err);
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
