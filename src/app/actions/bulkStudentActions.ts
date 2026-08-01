"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { INITIAL_STUDENTS, Student } from "@/lib/mockData";
import { getBatchForGrade } from "@/lib/programmes";

export interface BulkStudentRowInput {
  studentRegNo?: string;
  fullName: string;
  gradeLevel: string;
  guardianName: string;
  guardianEmail: string;
  whatsappNumber: string;
}

export interface BulkImportResult {
  success: boolean;
  importedCount: number;
  skippedCount: number;
  errors: string[];
  importedStudents?: Student[];
  message?: string;
}

export interface BulkEditInput {
  studentIds: string[];
  gradeLevel?: string;
  batch?: string;
  programme?: string;
  active?: boolean;
}

export interface BulkEditResult {
  success: boolean;
  updatedCount: number;
  message?: string;
  error?: string;
}

/**
 * SECURE SERVER ACTION: Bulk Import Students
 * - Auto-generates Registration Number if omitted (THF-26-XXXX)
 * - Resolves Grade Level to Batch automatically via programme configuration engine
 * - Deduplicates against existing registration numbers
 * - Inserts records into dataset/Supabase and logs Audit Trail
 */
export async function bulkImportStudentsAction(
  studentsInput: BulkStudentRowInput[],
  existingRegNosInput?: string[]
): Promise<BulkImportResult> {
  const errors: string[] = [];
  let importedCount = 0;
  let skippedCount = 0;

  try {
    if (!studentsInput || studentsInput.length === 0) {
      return {
        success: false,
        importedCount: 0,
        skippedCount: 0,
        errors: ["No student records were provided for import."],
      };
    }

    const existingRegNos = new Set<string>();
    if (existingRegNosInput && existingRegNosInput.length > 0) {
      existingRegNosInput.forEach((reg) => existingRegNos.add(reg.toUpperCase()));
    } else {
      INITIAL_STUDENTS.forEach((s) => existingRegNos.add(s.studentRegNo.toUpperCase()));
    }

    const newRecords: Student[] = [];

    for (let i = 0; i < studentsInput.length; i++) {
      const row = studentsInput[i];
      const rowNum = i + 1;

      // Validation: Required Full Name, Grade, Email, WhatsApp
      if (!row.fullName || row.fullName.trim() === "") {
        errors.push(`Row ${rowNum}: Full name is required.`);
        skippedCount++;
        continue;
      }

      if (!row.guardianEmail || !row.guardianEmail.includes("@")) {
        errors.push(`Row ${rowNum}: Invalid parent email address "${row.guardianEmail}".`);
        skippedCount++;
        continue;
      }

      if (!row.whatsappNumber || row.whatsappNumber.trim().length < 8) {
        errors.push(`Row ${rowNum}: Invalid WhatsApp contact number "${row.whatsappNumber}".`);
        skippedCount++;
        continue;
      }

      // Generate or normalize Registration Number
      let regNo = row.studentRegNo?.trim().toUpperCase();
      if (!regNo) {
        const nextIndex = existingRegNos.size + newRecords.length + 1;
        regNo = `THF-26-${String(nextIndex).padStart(4, "0")}`;
      }

      if (existingRegNos.has(regNo)) {
        errors.push(`Row ${rowNum}: Registration number "${regNo}" already exists. Skipped.`);
        skippedCount++;
        continue;
      }

      // Resolve grade and batch automatically
      const gradeLevel = row.gradeLevel || "Grade 6";
      const resolvedBatch = getBatchForGrade(gradeLevel)?.name || "Foundation Sinhala";

      const newStudent: Student = {
        id: `std-${Date.now()}-${i}`,
        studentRegNo: regNo,
        fullName: row.fullName.trim(),
        gradeLevel: gradeLevel,
        batch: resolvedBatch,
        programme: "Second Language Sinhala",
        guardianName: row.guardianName?.trim() || "Guardian",
        guardianEmail: row.guardianEmail.trim().toLowerCase(),
        guardianPhone: row.whatsappNumber.trim(),
        whatsappNumber: row.whatsappNumber.trim(),
        createdAt: new Date().toISOString(),
      };

      existingRegNos.add(regNo);
      newRecords.push(newStudent);
      importedCount++;
    }

    // Add to in-memory dataset
    newRecords.forEach((st) => INITIAL_STUDENTS.unshift(st));

    // Persist to Supabase DB & Audit Log
    try {
      const supabaseAdmin = createAdminClient();
      if (newRecords.length > 0) {
        const dbRecords = newRecords.map((st) => ({
          registration_no: st.studentRegNo,
          full_name: st.fullName,
          grade_level: st.gradeLevel,
          batch: st.batch,
          programme: st.programme,
          guardian_name: st.guardianName,
          guardian_email: st.guardianEmail,
          guardian_phone: st.guardianPhone,
          active: true,
        }));

        await (supabaseAdmin.from("students") as any).insert(dbRecords);

        // Record Audit Log entry
        await (supabaseAdmin.from("audit_logs") as any).insert({
          action: "BULK_IMPORT_STUDENTS",
          entity_type: "students",
          entity_id: `bulk-${Date.now()}`,
          new_value: { count: newRecords.length, regNos: newRecords.map((r) => r.studentRegNo) },
        });
      }
    } catch (dbErr) {
      console.warn("Live DB bulk import fallback to memory store:", dbErr);
    }

    return {
      success: importedCount > 0,
      importedCount,
      skippedCount,
      errors,
      importedStudents: newRecords,
      message: `Successfully imported ${importedCount} student(s). ${skippedCount > 0 ? `${skippedCount} skipped.` : ""}`,
    };
  } catch (err) {
    console.error("Bulk Import Action Exception:", err);
    return {
      success: false,
      importedCount: 0,
      skippedCount: studentsInput.length,
      errors: ["An unexpected server error occurred during bulk import."],
    };
  }
}

/**
 * SECURE SERVER ACTION: Bulk Edit Selected Students
 * - Allows mass-updating Grade, Batch, Programme, or Active status for multiple students
 * - Generates audit log tracking all modified student IDs
 */
export async function bulkEditStudentsAction(input: BulkEditInput): Promise<BulkEditResult> {
  try {
    const { studentIds, gradeLevel, batch, programme, active } = input;

    if (!studentIds || studentIds.length === 0) {
      return { success: false, updatedCount: 0, error: "No students were selected for bulk editing." };
    }

    let updatedCount = 0;

    studentIds.forEach((id) => {
      const student = INITIAL_STUDENTS.find((s) => s.id === id);
      if (student) {
        if (gradeLevel && gradeLevel !== "Keep Same") {
          student.gradeLevel = gradeLevel;
          const resolved = getBatchForGrade(gradeLevel);
          if (resolved) student.batch = resolved.name;
        }
        if (batch && batch !== "Keep Same") student.batch = batch;
        if (programme && programme !== "Keep Same") student.programme = programme;
        updatedCount++;
      }
    });

    // DB Sync & Audit Log
    try {
      const supabaseAdmin = createAdminClient();
      const updates: Record<string, any> = {};
      if (gradeLevel && gradeLevel !== "Keep Same") updates.grade_level = gradeLevel;
      if (batch && batch !== "Keep Same") updates.batch = batch;
      if (programme && programme !== "Keep Same") updates.programme = programme;
      if (typeof active === "boolean") updates.active = active;

      if (Object.keys(updates).length > 0) {
        await (supabaseAdmin.from("students") as any)
          .update(updates)
          .in("id", studentIds);

        await (supabaseAdmin.from("audit_logs") as any).insert({
          action: "BULK_EDIT_STUDENTS",
          entity_type: "students",
          entity_id: `bulk-edit-${Date.now()}`,
          new_value: { studentIds, updates },
        });
      }
    } catch (dbErr) {
      console.warn("DB Bulk Edit fallback to memory store:", dbErr);
    }

    return {
      success: true,
      updatedCount,
      message: `Successfully bulk-updated ${updatedCount} student profile(s).`,
    };
  } catch (err) {
    console.error("Bulk Edit Action Error:", err);
    return {
      success: false,
      updatedCount: 0,
      error: "An unexpected error occurred during bulk edit.",
    };
  }
}
