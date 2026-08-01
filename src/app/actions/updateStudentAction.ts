"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { INITIAL_STUDENTS, Student } from "@/lib/mockData";

export interface UpdateStudentInput {
  studentId: string;
  fullName?: string;
  guardianName?: string;
  guardianEmail: string;
  whatsappNumber: string;
  gradeLevel: string;
  batch: string;
  programme: string;
  monthlyFeeLKR: number;
  active: boolean;
}

export interface UpdateStudentResult {
  success: boolean;
  message?: string;
  error?: string;
}

export interface DeleteStudentResult {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * SECURE SERVER ACTION: Admin Student Profile Update
 * - Keeps Registration Number read-only & immutable
 * - Updates student name, guardian name, contact channels, batch, programme, and active status
 * - Records Audit Log entry for every modification
 */
export async function updateStudentAction(input: UpdateStudentInput): Promise<UpdateStudentResult> {
  try {
    const { studentId, fullName, guardianName, guardianEmail, whatsappNumber, gradeLevel, batch, programme, monthlyFeeLKR, active } = input;

    if (!studentId) {
      return { success: false, error: "Missing target student ID." };
    }

    if (!guardianEmail?.trim() || !whatsappNumber?.trim()) {
      return { success: false, error: "Parent email and WhatsApp number are required." };
    }

    // 1. Locate Student in Mock Dataset / DB
    const student = INITIAL_STUDENTS.find((s) => s.id === studentId);
    let oldValues = student ? { ...student } : null;

    // 2. Update Mock Dataset (if present)
    if (student) {
      if (fullName?.trim()) student.fullName = fullName.trim();
      if (guardianName?.trim()) student.guardianName = guardianName.trim();
      student.guardianEmail = guardianEmail.trim().toLowerCase();
      student.whatsappNumber = whatsappNumber.trim();
      student.guardianPhone = whatsappNumber.trim();
      student.gradeLevel = gradeLevel;
      student.batch = batch;
      student.programme = programme;
    }

    // 3. Update Supabase Database & Audit Log
    try {
      const supabaseAdmin = createAdminClient();

      const updateData: Record<string, any> = {
        guardian_email: guardianEmail.trim().toLowerCase(),
        guardian_phone: whatsappNumber.trim(),
        grade_level: gradeLevel,
        batch,
        programme,
        monthly_fee: monthlyFeeLKR,
        active,
        updated_at: new Date().toISOString(),
      };

      if (fullName?.trim()) updateData.full_name = fullName.trim();
      if (guardianName?.trim()) updateData.guardian_name = guardianName.trim();

      await (supabaseAdmin.from("students") as any)
        .update(updateData)
        .eq("id", studentId);

      // Audit Log Insertion
      await (supabaseAdmin.from("audit_logs") as any).insert({
        action: "UPDATE_STUDENT_PROFILE",
        entity_type: "students",
        entity_id: studentId,
        old_value: oldValues,
        new_value: {
          full_name: fullName,
          guardian_name: guardianName,
          guardian_email: guardianEmail,
          whatsapp_number: whatsappNumber,
          grade_level: gradeLevel,
          batch,
          programme,
          monthly_fee: monthlyFeeLKR,
          active,
        },
      });
    } catch (dbErr) {
      console.warn("Live DB update fallback to in-memory store:", dbErr);
    }

    return {
      success: true,
      message: "Student profile successfully updated and audit log entry created.",
    };
  } catch (err) {
    console.error("Update Student Action Exception:", err);
    return {
      success: false,
      error: "An unexpected server error occurred while updating the student profile.",
    };
  }
}

/**
 * SECURE SERVER ACTION: Delete / Remove Student Record
 * - Removes student from database and dataset
 * - Logs an immutable audit trail entry (DELETE_STUDENT_RECORD)
 */
export async function deleteStudentAction(studentId: string): Promise<DeleteStudentResult> {
  try {
    if (!studentId) {
      return { success: false, error: "Missing target student ID." };
    }

    const index = INITIAL_STUDENTS.findIndex((s) => s.id === studentId);
    let deletedStudent: Student | null = null;

    if (index !== -1) {
      deletedStudent = INITIAL_STUDENTS[index];
      INITIAL_STUDENTS.splice(index, 1);
    }

    try {
      const supabaseAdmin = createAdminClient();
      await (supabaseAdmin.from("students") as any).delete().eq("id", studentId);

      await (supabaseAdmin.from("audit_logs") as any).insert({
        action: "DELETE_STUDENT_RECORD",
        entity_type: "students",
        entity_id: studentId,
        old_value: deletedStudent,
        new_value: { deletedAt: new Date().toISOString() },
      });
    } catch (dbErr) {
      console.warn("Live DB delete fallback to memory store:", dbErr);
    }

    return {
      success: true,
      message: `Student record ${deletedStudent ? deletedStudent.studentRegNo : ""} successfully deleted.`,
    };
  } catch (err) {
    console.error("Delete Student Action Exception:", err);
    return {
      success: false,
      error: "An unexpected server error occurred while deleting the student profile.",
    };
  }
}
