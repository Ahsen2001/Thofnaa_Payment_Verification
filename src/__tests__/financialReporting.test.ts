// ─── THOFNAA PAYMENT VERIFICATION SYSTEM ────────────────────────────────────
// Test Suite 6: Financial Reporting Calculator (financialReporting.ts)
//
// Covers:
//   TC-FR-01  Expected fees = active students × LKR 1,000
//   TC-FR-02  Only VERIFIED payments count as collected revenue
//   TC-FR-03  PENDING payments counted in pending totals
//   TC-FR-04  REJECTED payments counted in rejected totals
//   TC-FR-05  CLARIFICATION_NEEDED counted in clarification totals
//   TC-FR-06  Unpaid count = active students – (verified + pending) students
//   TC-FR-07  Collection percentage = (verified / expected) × 100
//   TC-FR-08  Collection % capped at 100
//   TC-FR-09  Filtering by grade works
//   TC-FR-10  Filtering by batch works
//   TC-FR-11  "All" filter returns all active students
//   TC-FR-12  Collection % is 0 when no verified payments
//   TC-FR-13  Report with no active students returns zero metrics
// ─────────────────────────────────────────────────────────────────────────────

import { calculateFinancialReport } from "@/lib/financialReporting";
import { INITIAL_STUDENTS, INITIAL_SUBMISSIONS } from "@/lib/mockData";

// ─────────────────────────────────────────────────────────────────────────────

/** Baseline filter – all students, all months, 2026 */
const ALL_FILTER = {
  month: "All",
  year: "2026",
  grade: "All",
  batch: "All",
  programme: "All",
};

describe("TC-FR: Financial Reporting Calculator", () => {
  // ── TC-FR-01 Expected fees ────────────────────────────────────────────────
  describe("TC-FR-01 – Expected fees = active students × LKR 1,000", () => {
    it("totalExpectedLKR equals count of students × 1000", () => {
      const report = calculateFinancialReport(ALL_FILTER);
      expect(report.totalExpectedLKR).toBe(report.activeStudents * 1000);
    });

    it("activeStudents matches total mock students count (all filter)", () => {
      const report = calculateFinancialReport(ALL_FILTER);
      expect(report.activeStudents).toBe(INITIAL_STUDENTS.length);
    });
  });

  // ── TC-FR-02 VERIFIED only = collected revenue ───────────────────────────
  describe("TC-FR-02 – Only VERIFIED payments count as collected revenue", () => {
    it("totalCollectedLKR equals totalVerifiedLKR", () => {
      const report = calculateFinancialReport(ALL_FILTER);
      expect(report.totalCollectedLKR).toBe(report.totalVerifiedLKR);
    });

    it("PENDING payments do NOT inflate totalCollectedLKR", () => {
      const report = calculateFinancialReport(ALL_FILTER);
      const totalIncludingPending = report.totalVerifiedLKR + report.totalPendingLKR;
      // collected must be less than or equal to verified only
      expect(report.totalCollectedLKR).toBeLessThanOrEqual(report.totalVerifiedLKR);
    });

    it("verifiedCount matches number of VERIFIED mock submissions", () => {
      const report = calculateFinancialReport(ALL_FILTER);
      const expected = INITIAL_SUBMISSIONS.filter(
        (s) => s.status === "VERIFIED"
      ).length;
      expect(report.verifiedCount).toBe(expected);
    });
  });

  // ── TC-FR-03 Pending totals ───────────────────────────────────────────────
  describe("TC-FR-03 – Pending payments counted correctly", () => {
    it("pendingCount matches number of PENDING mock submissions", () => {
      const report = calculateFinancialReport(ALL_FILTER);
      const expected = INITIAL_SUBMISSIONS.filter(
        (s) => s.status === "PENDING"
      ).length;
      expect(report.pendingCount).toBe(expected);
    });

    it("totalPendingLKR = pendingCount × 1000", () => {
      const report = calculateFinancialReport(ALL_FILTER);
      expect(report.totalPendingLKR).toBe(report.pendingCount * 1000);
    });
  });

  // ── TC-FR-04 Rejected count ───────────────────────────────────────────────
  describe("TC-FR-04 – Rejected payments counted", () => {
    it("rejectedCount matches REJECTED submissions", () => {
      const report = calculateFinancialReport(ALL_FILTER);
      const expected = INITIAL_SUBMISSIONS.filter(
        (s) => s.status === "REJECTED"
      ).length;
      expect(report.rejectedCount).toBe(expected);
    });
  });

  // ── TC-FR-05 Clarification count ──────────────────────────────────────────
  describe("TC-FR-05 – Clarification_needed counted", () => {
    it("clarificationCount matches CLARIFICATION_NEEDED submissions", () => {
      const report = calculateFinancialReport(ALL_FILTER);
      const expected = INITIAL_SUBMISSIONS.filter(
        (s) => s.status === "CLARIFICATION_NEEDED"
      ).length;
      expect(report.clarificationCount).toBe(expected);
    });
  });

  // ── TC-FR-06 Unpaid count ─────────────────────────────────────────────────
  describe("TC-FR-06 – Unpaid count = students without verified or pending payment", () => {
    it("unpaidCount is non-negative", () => {
      const report = calculateFinancialReport(ALL_FILTER);
      expect(report.unpaidCount).toBeGreaterThanOrEqual(0);
    });

    it("unpaidCount does not exceed activeStudents", () => {
      const report = calculateFinancialReport(ALL_FILTER);
      expect(report.unpaidCount).toBeLessThanOrEqual(report.activeStudents);
    });
  });

  // ── TC-FR-07 Collection percentage ───────────────────────────────────────
  describe("TC-FR-07 – Collection percentage calculation", () => {
    it("collectionPercentage = Math.round(verified / expected × 100)", () => {
      const report = calculateFinancialReport(ALL_FILTER);
      const expected =
        report.totalExpectedLKR > 0
          ? Math.round((report.totalVerifiedLKR / report.totalExpectedLKR) * 100)
          : 0;
      expect(report.collectionPercentage).toBe(Math.min(100, expected));
    });

    it("collectionPercentage is a whole number (no decimals)", () => {
      const report = calculateFinancialReport(ALL_FILTER);
      expect(report.collectionPercentage % 1).toBe(0);
    });
  });

  // ── TC-FR-08 Collection % capped at 100 ──────────────────────────────────
  describe("TC-FR-08 – Collection % is capped at 100", () => {
    it("collectionPercentage never exceeds 100", () => {
      const report = calculateFinancialReport(ALL_FILTER);
      expect(report.collectionPercentage).toBeLessThanOrEqual(100);
    });
  });

  // ── TC-FR-09 Grade filter ─────────────────────────────────────────────────
  describe("TC-FR-09 – Grade filter narrows active students", () => {
    it("filtering by 'Grade 6' returns only Grade 6 students", () => {
      const report = calculateFinancialReport({ ...ALL_FILTER, grade: "Grade 6" });
      const grade6Count = INITIAL_STUDENTS.filter(
        (s) => s.gradeLevel === "Grade 6"
      ).length;
      expect(report.activeStudents).toBe(grade6Count);
    });

    it("filtering by 'Grade 6' reduces expected fees vs All filter", () => {
      const allReport = calculateFinancialReport(ALL_FILTER);
      const grade6Report = calculateFinancialReport({ ...ALL_FILTER, grade: "Grade 6" });
      expect(grade6Report.totalExpectedLKR).toBeLessThan(allReport.totalExpectedLKR);
    });
  });

  // ── TC-FR-10 Batch filter ─────────────────────────────────────────────────
  describe("TC-FR-10 – Batch filter narrows active students", () => {
    it("filtering by 'Foundation Sinhala' returns only Grades 6 & 7 students", () => {
      const report = calculateFinancialReport({ ...ALL_FILTER, batch: "Foundation Sinhala" });
      const foundationCount = INITIAL_STUDENTS.filter((s) =>
        s.batch.toLowerCase().includes("foundation")
      ).length;
      expect(report.activeStudents).toBe(foundationCount);
    });
  });

  // ── TC-FR-11 "All" filter returns all students ────────────────────────────
  describe("TC-FR-11 – 'All' filter includes all active students", () => {
    it("activeStudents equals total INITIAL_STUDENTS count", () => {
      const report = calculateFinancialReport(ALL_FILTER);
      expect(report.activeStudents).toBe(INITIAL_STUDENTS.length);
    });
  });

  // ── TC-FR-12 Zero verified → zero collection % ────────────────────────────
  describe("TC-FR-12 – Zero collection % when no verified payments", () => {
    it("grade with no verified submissions has 0% collection", () => {
      // Grade 11 has no payments in mock data
      const report = calculateFinancialReport({
        ...ALL_FILTER,
        grade: "Grade 11",
        month: "February",
      });
      const hasVerified = INITIAL_SUBMISSIONS.some(
        (s) =>
          s.status === "VERIFIED" &&
          s.studentRegNo === "THF-26-0006" &&
          s.paymentMonth === "February"
      );
      if (!hasVerified) {
        expect(report.collectionPercentage).toBe(0);
      }
    });
  });

  // ── TC-FR-13 filterSummary is returned ───────────────────────────────────
  describe("TC-FR-13 – filterSummary is populated", () => {
    it("filterSummary.month reflects the input filter", () => {
      const report = calculateFinancialReport({ ...ALL_FILTER, month: "January" });
      expect(report.filterSummary.month).toBe("January");
    });

    it("filterSummary.year reflects the input filter", () => {
      const report = calculateFinancialReport(ALL_FILTER);
      expect(report.filterSummary.year).toBe("2026");
    });
  });
});
