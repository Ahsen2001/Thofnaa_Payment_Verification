import { INITIAL_STUDENTS, INITIAL_SUBMISSIONS, PaymentSubmission, Student } from "@/lib/mockData";
import { formatLKR } from "@/lib/utils";

export interface FinancialFilterOptions {
  month: string; // e.g. "February" or "All"
  year: string; // e.g. "2026" or "All"
  grade: string; // e.g. "Grade 6" or "All"
  batch: string; // e.g. "Foundation Sinhala" or "All"
  programme: string; // e.g. "Second Language Sinhala" or "All"
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
 * THOFNAA FINANCIAL REPORTING CALCULATOR
 * 
 * Rules:
 * 1. Expected Fees = Active Enrolled Students matching filters × LKR 1,000 (or individual monthly fee).
 * 2. Only VERIFIED payments count as collected revenue.
 * 3. Collection Percentage = (Total Verified Revenue / Total Expected Revenue) × 100.
 */
export function calculateFinancialReport(
  filters: FinancialFilterOptions
): FinancialReportData {
  const { month, year, grade, batch, programme } = filters;

  const targetMonth = month === "All" ? "February" : month;
  const targetYear = year === "All" ? "2026" : year;

  // 1. Filter Active Students matching Grade, Batch, and Programme criteria
  const matchingStudents = INITIAL_STUDENTS.filter((st) => {
    // Grade Filter
    if (grade !== "All" && st.gradeLevel.toLowerCase() !== grade.toLowerCase()) {
      return false;
    }
    // Batch Filter
    if (batch !== "All" && !st.batch.toLowerCase().includes(batch.toLowerCase())) {
      return false;
    }
    // Programme Filter
    if (programme !== "All" && !st.programme.toLowerCase().includes(programme.toLowerCase())) {
      return false;
    }
    return true;
  });

  const activeStudentsCount = matchingStudents.length;

  // 2. Total Expected Tuition Fees
  const totalExpectedLKR = matchingStudents.reduce((sum, st) => sum + 1000, 0);

  // 3. Filter Submissions for target month, year, grade, batch, programme
  const studentRegNos = new Set(matchingStudents.map((st) => st.studentRegNo.toUpperCase()));

  const matchingSubmissions = INITIAL_SUBMISSIONS.filter((sub) => {
    if (!studentRegNos.has(sub.studentRegNo.toUpperCase())) return false;
    if (month !== "All" && sub.paymentMonth.toLowerCase() !== month.toLowerCase()) return false;
    if (year !== "All" && sub.academicYear.toString() !== year) return false;
    return true;
  });

  // 4. Calculate Verified Payments (Only VERIFIED count as collected revenue)
  const verifiedSubmissions = matchingSubmissions.filter((sub) => sub.status === "VERIFIED");
  const verifiedCount = verifiedSubmissions.length;
  const totalVerifiedLKR = verifiedSubmissions.reduce((sum, sub) => sum + sub.feeAmount, 0);

  // 5. Calculate Pending Payments
  const pendingSubmissions = matchingSubmissions.filter((sub) => sub.status === "PENDING");
  const pendingCount = pendingSubmissions.length;
  const totalPendingLKR = pendingSubmissions.reduce((sum, sub) => sum + sub.feeAmount, 0);

  // 6. Calculate Rejected & Clarification Submissions
  const rejectedCount = matchingSubmissions.filter((sub) => sub.status === "REJECTED").length;
  const clarificationCount = matchingSubmissions.filter((sub) => sub.status === "CLARIFICATION_NEEDED").length;

  // 7. Calculate Unpaid / Not Submitted Students
  // A student is considered unpaid for this period if they have no VERIFIED or PENDING payment
  const activeStudentRegsWithSubmission = new Set(
    matchingSubmissions
      .filter((sub) => sub.status === "VERIFIED" || sub.status === "PENDING")
      .map((sub) => sub.studentRegNo.toUpperCase())
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
    totalCollectedLKR: totalVerifiedLKR, // Strictly VERIFIED
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
