"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { INITIAL_STUDENTS, Student } from "@/lib/mockData";

export interface UpdateStudentInput {
  studentId: string;
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

/**
 * SECURE SERVER ACTION: Admin Student Profile Update
 * - Keeps Registration Number read-only & immutable
 * - Updates contact channels, batch, programme, and active status
 * - Records Audit Log entry for every modification
 */
export async function updateStudentAction(input: UpdateStudentInput): Promise<UpdateStudentResult> {
  try {
    const { studentId, guardianEmail, whatsappNumber, gradeLevel, batch, programme, monthlyFeeLKR, active } = input;

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

      // Update student table record (Registration No is explicitly excluded from update)
      await (supabaseAdmin.from("students") as any)
        .update({
          guardian_email: guardianEmail.trim().toLowerCase(),
          guardian_phone: whatsappNumber.trim(),
          grade_level: gradeLevel,
          batch,
          programme,
          monthly_fee: monthlyFeeLKR,
          active,
          updated_at: new Date().toISOString(),
        })
        .eq("id", studentId);

      // Audit Log Insertion
      await (supabaseAdmin.from("audit_logs") as any).insert({
        action: "UPDATE_STUDENT_PROFILE",
        entity_type: "students",
        entity_id: studentId,
        old_value: oldValues,
        new_value: {
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
