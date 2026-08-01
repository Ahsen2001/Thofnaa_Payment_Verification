import { INITIAL_STUDENTS, INITIAL_SUBMISSIONS, Student, PaymentSubmission } from "@/lib/mockData";

const STUDENTS_KEY = "thofnaa_students_roster_v2";
const SUBMISSIONS_KEY = "thofnaa_payment_submissions_v2";

// ── STUDENT STORE ─────────────────────────────────────────────────────────────

export function getStoredStudents(): Student[] {
  if (typeof window === "undefined") {
    return INITIAL_STUDENTS;
  }

  try {
    const raw = localStorage.getItem(STUDENTS_KEY);
    if (!raw) {
      localStorage.setItem(STUDENTS_KEY, JSON.stringify([]));
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn("Failed to load students from localStorage:", err);
    return [];
  }
}

export function saveStoredStudents(students: Student[]): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
      window.dispatchEvent(new Event("thofnaa_students_updated"));
      window.dispatchEvent(new Event("thofnaa_submissions_updated"));
    } catch (err) {
      console.warn("Failed to save students to localStorage:", err);
    }
  }

  INITIAL_STUDENTS.length = 0;
  INITIAL_STUDENTS.push(...students);
}

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

export function deleteStoredStudent(studentId: string): void {
  const current = getStoredStudents();
  const target = current.find((s) => s.id === studentId);
  const filtered = current.filter((s) => s.id !== studentId);
  saveStoredStudents(filtered);

  if (target) {
    deleteSubmissionsForStudent(target.studentRegNo);
  }
}

export function addStoredStudents(newStudents: Student[]): void {
  const current = getStoredStudents();
  const existingRegNos = new Set(current.map((s) => s.studentRegNo.toUpperCase()));
  const toAdd = newStudents.filter((s) => !existingRegNos.has(s.studentRegNo.toUpperCase()));
  saveStoredStudents([...toAdd, ...current]);
}

// ── SUBMISSION STORE ──────────────────────────────────────────────────────────

export function getStoredSubmissions(): PaymentSubmission[] {
  if (typeof window === "undefined") {
    return INITIAL_SUBMISSIONS;
  }

  const activeStudents = getStoredStudents();
  const activeRegNos = new Set(activeStudents.map((s) => s.studentRegNo.toUpperCase()));

  try {
    const raw = localStorage.getItem(SUBMISSIONS_KEY);
    let list: PaymentSubmission[] = [];
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) list = parsed;
    }
    return list.filter((sub) => activeRegNos.has(sub.studentRegNo.toUpperCase()));
  } catch (err) {
    console.warn("Failed to load submissions from localStorage:", err);
    return [];
  }
}

export function saveStoredSubmissions(submissions: PaymentSubmission[]): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(submissions));
      window.dispatchEvent(new Event("thofnaa_submissions_updated"));
    } catch (err) {
      console.warn("Failed to save submissions to localStorage:", err);
    }
  }

  INITIAL_SUBMISSIONS.length = 0;
  INITIAL_SUBMISSIONS.push(...submissions);
}

export function addStoredSubmission(newSub: PaymentSubmission): void {
  const current = getStoredSubmissions();
  saveStoredSubmissions([newSub, ...current]);
}

export function updateStoredSubmission(
  submissionId: string,
  status: "VERIFIED" | "REJECTED" | "CLARIFICATION_NEEDED",
  paymentRef?: string | null,
  adminNotes?: string | null,
  rejectionReason?: string | null
): void {
  const current = getStoredSubmissions();
  const sub = current.find((s) => s.id === submissionId);
  if (sub) {
    sub.status = status;
    if (paymentRef) sub.paymentRef = paymentRef;
    if (adminNotes) sub.adminNotes = adminNotes;
    if (rejectionReason) sub.rejectionReason = rejectionReason;
    if (status === "VERIFIED") sub.verifiedAt = new Date().toISOString();
    saveStoredSubmissions(current);
  }
}

export function deleteSubmissionsForStudent(studentRegNo: string): void {
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(SUBMISSIONS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter(
            (sub: PaymentSubmission) => sub.studentRegNo.toUpperCase() !== studentRegNo.toUpperCase()
          );
          localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(filtered));
          window.dispatchEvent(new Event("thofnaa_submissions_updated"));
        }
      }
    } catch (err) {
      console.warn("Failed to delete student submissions from localStorage:", err);
    }
  }

  const idx = INITIAL_SUBMISSIONS.findIndex(
    (sub) => sub.studentRegNo.toUpperCase() === studentRegNo.toUpperCase()
  );
  if (idx !== -1) {
    INITIAL_SUBMISSIONS.splice(idx, 1);
  }
}
