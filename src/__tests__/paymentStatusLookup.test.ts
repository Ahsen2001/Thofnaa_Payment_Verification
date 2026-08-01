// ─── THOFNAA PAYMENT VERIFICATION SYSTEM ────────────────────────────────────
// Test Suite 3: Payment Status Lookup Action (paymentStatusLookupAction.ts)
//
// Covers:
//   TC-PL-01  Correct reg no + correct parent email returns history
//   TC-PL-02  Correct reg no + WRONG parent email is blocked (2FA guard)
//   TC-PL-03  Unknown reg no (but valid format) returns not-found error
//   TC-PL-04  Invalid format reg no is rejected
//   TC-PL-05  Empty inputs are rejected
//   TC-PL-06  History contains 12 months (full academic year)
//   TC-PL-07  VERIFIED months show the payment reference
//   TC-PL-08  NOT_SUBMITTED months show null paymentReference
//   TC-PL-09  Private fields (proof path, admin notes) are NOT returned
//   TC-PL-10  Student name is returned in masked initials format
// ─────────────────────────────────────────────────────────────────────────────

import { lookupPaymentStatusAction } from "@/app/actions/paymentStatusLookupAction";

// ── Test constants from mock data ─────────────────────────────────────────────
const VALID_REG_NO = "THF-26-0001"; // Kasun – has VERIFIED Jan submission
const VALID_EMAIL = "demo.parent.kasun@example.com";
const WRONG_EMAIL = "wrong.email@example.com";

// ─────────────────────────────────────────────────────────────────────────────

describe("TC-PL: Payment Status Lookup Action (Two-Factor Guard)", () => {
  // ── TC-PL-01 Valid lookup ─────────────────────────────────────────────────
  describe("TC-PL-01 – Correct reg no + correct email returns payment history", () => {
    it("returns success=true", async () => {
      const result = await lookupPaymentStatusAction({
        studentRegNo: VALID_REG_NO,
        parentEmail: VALID_EMAIL,
      });
      expect(result.success).toBe(true);
    });

    it("returns studentInfo object", async () => {
      const result = await lookupPaymentStatusAction({
        studentRegNo: VALID_REG_NO,
        parentEmail: VALID_EMAIL,
      });
      expect(result.studentInfo).toBeDefined();
    });

    it("returns history array", async () => {
      const result = await lookupPaymentStatusAction({
        studentRegNo: VALID_REG_NO,
        parentEmail: VALID_EMAIL,
      });
      expect(Array.isArray(result.history)).toBe(true);
    });

    it("studentInfo registrationNo matches input", async () => {
      const result = await lookupPaymentStatusAction({
        studentRegNo: VALID_REG_NO,
        parentEmail: VALID_EMAIL,
      });
      expect(result.studentInfo?.registrationNo).toBe(VALID_REG_NO);
    });
  });

  // ── TC-PL-02 Wrong parent email (2FA guard) ───────────────────────────────
  describe("TC-PL-02 – Correct reg no + WRONG parent email is blocked", () => {
    it("returns success=false when email does not match", async () => {
      const result = await lookupPaymentStatusAction({
        studentRegNo: VALID_REG_NO,
        parentEmail: WRONG_EMAIL,
      });
      expect(result.success).toBe(false);
    });

    it("error message does NOT reveal whether reg no or email was wrong", async () => {
      const result = await lookupPaymentStatusAction({
        studentRegNo: VALID_REG_NO,
        parentEmail: WRONG_EMAIL,
      });
      // Should say "combination not found" rather than which field was wrong
      expect(result.error?.toLowerCase()).toMatch(/combination|not found/);
      // Should not leak the actual stored email address
      expect(result.error).not.toContain(VALID_EMAIL);
    });

    it("does not return studentInfo on failure", async () => {
      const result = await lookupPaymentStatusAction({
        studentRegNo: VALID_REG_NO,
        parentEmail: WRONG_EMAIL,
      });
      expect(result.studentInfo).toBeUndefined();
    });

    it("does not return history on failure", async () => {
      const result = await lookupPaymentStatusAction({
        studentRegNo: VALID_REG_NO,
        parentEmail: WRONG_EMAIL,
      });
      expect(result.history).toBeUndefined();
    });
  });

  // ── TC-PL-03 Unknown reg no ───────────────────────────────────────────────
  describe("TC-PL-03 – Unknown registration number", () => {
    it("returns success=false for non-existent THF-26-9999", async () => {
      const result = await lookupPaymentStatusAction({
        studentRegNo: "THF-26-9999",
        parentEmail: VALID_EMAIL,
      });
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });

  // ── TC-PL-04 Invalid format ───────────────────────────────────────────────
  describe("TC-PL-04 – Invalid registration number format", () => {
    it("rejects 'STUDENT-001' as invalid format", async () => {
      const result = await lookupPaymentStatusAction({
        studentRegNo: "STUDENT-001",
        parentEmail: VALID_EMAIL,
      });
      expect(result.success).toBe(false);
      expect(result.error?.toLowerCase()).toMatch(/format|invalid/);
    });
  });

  // ── TC-PL-05 Empty inputs ─────────────────────────────────────────────────
  describe("TC-PL-05 – Empty inputs rejected", () => {
    it("rejects empty studentRegNo", async () => {
      const result = await lookupPaymentStatusAction({
        studentRegNo: "",
        parentEmail: VALID_EMAIL,
      });
      expect(result.success).toBe(false);
    });

    it("rejects empty parentEmail", async () => {
      const result = await lookupPaymentStatusAction({
        studentRegNo: VALID_REG_NO,
        parentEmail: "",
      });
      expect(result.success).toBe(false);
    });

    it("rejects both fields empty", async () => {
      const result = await lookupPaymentStatusAction({
        studentRegNo: "",
        parentEmail: "",
      });
      expect(result.success).toBe(false);
    });
  });

  // ── TC-PL-06 Full 12-month history ───────────────────────────────────────
  describe("TC-PL-06 – History contains 12 months", () => {
    it("returns exactly 12 history entries for the academic year", async () => {
      const result = await lookupPaymentStatusAction({
        studentRegNo: VALID_REG_NO,
        parentEmail: VALID_EMAIL,
      });
      expect(result.history?.length).toBe(12);
    });
  });

  // ── TC-PL-07 VERIFIED month shows payment reference ───────────────────────
  describe("TC-PL-07 – VERIFIED month shows payment reference", () => {
    it("January 2026 has VERIFIED status for THF-26-0001", async () => {
      const result = await lookupPaymentStatusAction({
        studentRegNo: VALID_REG_NO,
        parentEmail: VALID_EMAIL,
      });
      const jan = result.history?.find((h) =>
        h.monthYear.toLowerCase().includes("january")
      );
      expect(jan?.status).toBe("VERIFIED");
    });

    it("VERIFIED month has a non-null paymentReference", async () => {
      const result = await lookupPaymentStatusAction({
        studentRegNo: VALID_REG_NO,
        parentEmail: VALID_EMAIL,
      });
      const jan = result.history?.find((h) =>
        h.monthYear.toLowerCase().includes("january")
      );
      expect(jan?.paymentReference).toBeTruthy();
    });
  });

  // ── TC-PL-08 NOT_SUBMITTED months ────────────────────────────────────────
  describe("TC-PL-08 – NOT_SUBMITTED months show null reference", () => {
    it("months with no submission have NOT_SUBMITTED status", async () => {
      const result = await lookupPaymentStatusAction({
        studentRegNo: VALID_REG_NO,
        parentEmail: VALID_EMAIL,
      });
      const notSubmitted = result.history?.filter(
        (h) => h.status === "NOT_SUBMITTED"
      );
      // Should have at least several months not submitted
      expect((notSubmitted?.length ?? 0)).toBeGreaterThan(0);
    });

    it("NOT_SUBMITTED months have null paymentReference", async () => {
      const result = await lookupPaymentStatusAction({
        studentRegNo: VALID_REG_NO,
        parentEmail: VALID_EMAIL,
      });
      const notSubmitted = result.history?.find(
        (h) => h.status === "NOT_SUBMITTED"
      );
      expect(notSubmitted?.paymentReference).toBeNull();
    });
  });

  // ── TC-PL-09 No private fields exposed ───────────────────────────────────
  describe("TC-PL-09 – Private fields not returned", () => {
    it("history items do not contain proofUrl or proofPath", async () => {
      const result = await lookupPaymentStatusAction({
        studentRegNo: VALID_REG_NO,
        parentEmail: VALID_EMAIL,
      });
      const json = JSON.stringify(result.history ?? []);
      expect(json).not.toMatch(/proofUrl|proofPath|proof_url|proof_path/i);
    });

    it("history items do not contain adminNotes or rejectionReason details", async () => {
      const result = await lookupPaymentStatusAction({
        studentRegNo: VALID_REG_NO,
        parentEmail: VALID_EMAIL,
      });
      const json = JSON.stringify(result.history ?? []);
      expect(json).not.toMatch(/adminNotes|adminNote|admin_note/i);
    });
  });

  // ── TC-PL-10 Masked name ─────────────────────────────────────────────────
  describe("TC-PL-10 – Student name returned in masked initials format", () => {
    it("nameWithInitials follows X. X. Lastname pattern", async () => {
      const result = await lookupPaymentStatusAction({
        studentRegNo: VALID_REG_NO,
        parentEmail: VALID_EMAIL,
      });
      const name = result.studentInfo?.nameWithInitials ?? "";
      // Pattern: one or more "X. " prefixes then a full last name
      expect(name).toMatch(/^([A-Z]\. )+\S+$/);
    });

    it("masked name does not contain the [DEMO] tag from mock data", async () => {
      const result = await lookupPaymentStatusAction({
        studentRegNo: VALID_REG_NO,
        parentEmail: VALID_EMAIL,
      });
      expect(result.studentInfo?.nameWithInitials).not.toContain("[DEMO]");
    });
  });
});
