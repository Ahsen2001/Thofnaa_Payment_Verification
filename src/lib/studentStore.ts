import { INITIAL_STUDENTS, Student } from "@/lib/mockData";

const STORAGE_KEY = "thofnaa_students_roster_v1";

/**
 * Reads student roster from browser localStorage (with fallback to INITIAL_STUDENTS).
 * Ensures edits, imports, and deletions persist across page refreshes (F5).
 */
export function getStoredStudents(): Student[] {
  if (typeof window === "undefined") {
    return INITIAL_STUDENTS;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Initialize storage with INITIAL_STUDENTS on first run
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_STUDENTS));
      return INITIAL_STUDENTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_STUDENTS;
  } catch (err) {
    console.warn("Failed to load students from localStorage:", err);
    return INITIAL_STUDENTS;
  }
}

/**
 * Saves full student roster array to localStorage and syncs in-memory array.
 */
export function saveStoredStudents(students: Student[]): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
      // Dispatch custom browser event so open tabs/components re-render instantly
      window.dispatchEvent(new Event("thofnaa_students_updated"));
    } catch (err) {
      console.warn("Failed to save students to localStorage:", err);
    }
  }

  // Sync memory reference
  INITIAL_STUDENTS.length = 0;
  INITIAL_STUDENTS.push(...students);
}

/**
 * Updates a single student record persistently.
 */
export function updateStoredStudent(updatedStudent: Student): void {
  const current = getStoredStudents();
  const index = current.findIndex((s) => s.id === updatedStudent.id);
  if (index !== -1) {
    current[index] = { ...current[index], ...updatedStudent };
  } else {
    current.unshift(updatedStudent);
  }
  saveStoredStudents(current);
}

/**
 * Deletes a student record persistently.
 */
export function deleteStoredStudent(studentId: string): void {
  const current = getStoredStudents();
  const filtered = current.filter((s) => s.id !== studentId);
  saveStoredStudents(filtered);
}

/**
 * Bulk adds or updates student records persistently.
 */
export function addStoredStudents(newStudents: Student[]): void {
  const current = getStoredStudents();
  const existingRegNos = new Set(current.map((s) => s.studentRegNo.toUpperCase()));
  
  const toAdd = newStudents.filter((s) => !existingRegNos.has(s.studentRegNo.toUpperCase()));
  const merged = [...toAdd, ...current];
  saveStoredStudents(merged);
}
