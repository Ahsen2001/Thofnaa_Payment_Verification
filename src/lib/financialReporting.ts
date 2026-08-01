import { INITIAL_STUDENTS, INITIAL_SUBMISSIONS, PaymentSubmission, Student } from "@/lib/mockData";
import { getStoredStudents, getStoredSubmissions } from "@/lib/studentStore";

export interface FinancialFilterOptions {
  month: string; // e.g. "February" or "All"
  year: string; // e.g. "2026" or "All"
  grade: string; // e.g. "Grade 6" or "All"
  batch: string; // e.g. "Foundation Sinhala" or "All"
  programme: string; // e.g. "Second Language Sinhala" or "All text"
}

export interface FinancialReportData {
  filterSummary: {
    month: string;
    year: string;
    grade: string;
    batch: string;
    programme: string;
  };
  activeStudents: number;
  totalExpectedLKR: number;
  totalCollectedLKR: number; // ONLY VERIFIED payments count as collected revenue
  collectionPercentage: number;
  verifiedCount: number;
  totalVerifiedLKR: number;
  pendingCount: number;
  totalPendingLKR: number;
  unpaidCount: number;
  totalUnpaidLKR: number;
  rejectedCount: number;
  clarificationCount: number;
}

/**
 * THOFNAA FINANCIAL REPORTING CALCULATOR (Crash-Proof)
 */
export function calculateFinancialReport(
  filters: FinancialFilterOptions,
  customStudents?: Student[],
  customSubmissions?: PaymentSubmission[]
): FinancialReportData {
  const { month, year, grade, batch, programme } = filters;

  const targetMonth = month === "All" ? "February" : month;
  const targetYear = year === "All" ? "2026" : year;

  // Use persistent store if in browser, otherwise fallback to INITIAL_STUDENTS
  const studentList = customStudents || (typeof window !== "undefined" ? getStoredStudents() : INITIAL_STUDENTS);
  const submissionList = customSubmissions || (typeof window !== "undefined" ? getStoredSubmissions() : INITIAL_SUBMISSIONS);

  // 1. Filter Active Students matching Grade, Batch, and Programme criteria
  const matchingStudents = studentList.filter((st) => {
    if (!st) return false;
    const stGrade = st.gradeLevel || "";
    const stBatch = st.batch || "";
    const stProg = st.programme || "";

    if (grade !== "All" && stGrade.toLowerCase() !== grade.toLowerCase()) {
      return false;
    }
    if (batch !== "All" && !stBatch.toLowerCase().includes(batch.toLowerCase())) {
      return false;
    }
    if (programme !== "All" && !stProg.toLowerCase().includes(programme.toLowerCase())) {
      return false;
    }
    return true;
  });

  const activeStudentsCount = matchingStudents.length;

  // 2. Total Expected Tuition Fees
  const totalExpectedLKR = matchingStudents.reduce((sum, st) => sum + 1000, 0);

  // 3. Filter Submissions for target month, year, grade, batch, programme
  const studentRegNos = new Set(matchingStudents.map((st) => (st.studentRegNo || "").toUpperCase()));

  const matchingSubmissions = submissionList.filter((sub) => {
    if (!sub) return false;
    const subRegNo = (sub.studentRegNo || "").toUpperCase();
    const subMonth = (sub.paymentMonth || "").toLowerCase();
    const subYear = (sub.academicYear || "").toString();

    if (!studentRegNos.has(subRegNo)) return false;
    if (month !== "All" && subMonth !== month.toLowerCase()) return false;
    if (year !== "All" && subYear !== year) return false;
    return true;
  });

  // 4. Calculate Verified Payments
  const verifiedSubmissions = matchingSubmissions.filter((sub) => sub.status === "VERIFIED");
  const verifiedCount = verifiedSubmissions.length;
  const totalVerifiedLKR = verifiedSubmissions.reduce((sum, sub) => sum + (sub.feeAmount || 0), 0);

  // 5. Calculate Pending Payments
  const pendingSubmissions = matchingSubmissions.filter((sub) => sub.status === "PENDING");
  const pendingCount = pendingSubmissions.length;
  const totalPendingLKR = pendingSubmissions.reduce((sum, sub) => sum + (sub.feeAmount || 0), 0);

  // 6. Calculate Rejected & Clarification Submissions
  const rejectedCount = matchingSubmissions.filter((sub) => sub.status === "REJECTED").length;
  const clarificationCount = matchingSubmissions.filter((sub) => sub.status === "CLARIFICATION_NEEDED").length;

  // 7. Calculate Unpaid / Not Submitted Students
  const activeStudentRegsWithSubmission = new Set(
    matchingSubmissions
      .filter((sub) => sub.status === "VERIFIED" || sub.status === "PENDING")
      .map((sub) => (sub.studentRegNo || "").toUpperCase())
  );

  const unpaidCount = Math.max(0, activeStudentsCount - activeStudentRegsWithSubmission.size);
  const totalUnpaidLKR = unpaidCount * 1000;

  // 8. Calculate Collection Percentage
  const collectionPercentage = totalExpectedLKR > 0
    ? Math.min(100, Math.round((totalVerifiedLKR / totalExpectedLKR) * 100))
    : 0;

  return {
    filterSummary: {
      month: targetMonth,
      year: targetYear,
      grade,
      batch,
      programme,
    },
    activeStudents: activeStudentsCount,
    totalExpectedLKR,
    totalCollectedLKR: totalVerifiedLKR,
    collectionPercentage,
    verifiedCount,
    totalVerifiedLKR,
    pendingCount,
    totalPendingLKR,
    unpaidCount,
    totalUnpaidLKR,
    rejectedCount,
    clarificationCount,
  };
}
