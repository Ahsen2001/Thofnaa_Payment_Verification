// ─── THOFNAA PAYMENT VERIFICATION SYSTEM ────────────────────────────────────
// Test Suite 2: Payment Submission Action (paymentSubmissionAction.ts)
//
// Covers:
//   TC-PS-01  First valid payment submission succeeds
//   TC-PS-02  Duplicate PENDING payment for same student+month is blocked
//   TC-PS-03  Duplicate VERIFIED payment for same student+month is blocked
//   TC-PS-04  Submission allowed after REJECTED or CLARIFICATION_NEEDED
//   TC-PS-05  Missing required fields are rejected
//   TC-PS-06  Invalid email address is rejected
//   TC-PS-07  WhatsApp number too short is rejected
//   TC-PS-08  Amount ≤ 0 is rejected
//   TC-PS-09  Invalid MIME type is rejected
//   TC-PS-10  PDF (application/pdf) is accepted
//   TC-PS-11  JPEG image is accepted
//   TC-PS-12  PNG image is accepted
//   TC-PS-13  File size > 10 MB is rejected
//   TC-PS-14  Generated payment reference follows THF-PAY-YY-NNNN format
//   TC-PS-15  Submission missing paymentDate is rejected
// ─────────────────────────────────────────────────────────────────────────────

import {
  submitPaymentForm,
  checkPaymentPeriodStatus,
  type SubmitPaymentInput,
} from "@/app/actions/paymentSubmissionAction";
import { INITIAL_STUDENTS, INITIAL_SUBMISSIONS, Student, PaymentSubmission } from "@/lib/mockData";

const TEST_STUDENTS: Student[] = [
  { id: "std-001", studentRegNo: "THF-26-0001", fullName: "Kasun Kalhara Perera", gradeLevel: "Grade 6", batch: "Foundation Sinhala", programme: "Second Language Sinhala", guardianName: "Sunil Perera", guardianEmail: "demo.parent.kasun@example.com", guardianPhone: "+94 77 000 0001", whatsappNumber: "+94 77 000 0001", createdAt: "2026-01-05" },
  { id: "std-002", studentRegNo: "THF-26-0002", fullName: "Dilini Senaratne", gradeLevel: "Grade 7", batch: "Foundation Sinhala", programme: "Second Language Sinhala", guardianName: "Nirosha Senaratne", guardianEmail: "demo.parent.dilini@example.com", guardianPhone: "+94 71 000 0002", whatsappNumber: "+94 71 000 0002", createdAt: "2026-01-10" },
  { id: "std-003", studentRegNo: "THF-26-0003", fullName: "Mohamed Rilwan", gradeLevel: "Grade 8", batch: "Intermediate Sinhala", programme: "Second Language Sinhala", guardianName: "Fathima Rilwan", guardianEmail: "demo.parent.rilwan@example.com", guardianPhone: "+94 75 000 0003", whatsappNumber: "+94 75 000 0003", createdAt: "2026-01-15" },
];

const TEST_SUBMISSIONS: PaymentSubmission[] = [
  { id: "sub-101", paymentRef: "THF-PAY-26-0001", studentId: "std-001", studentRegNo: "THF-26-0001", studentName: "Kasun Kalhara Perera", guardianEmail: "demo.parent.kasun@example.com", guardianPhone: "+94 77 000 0001", paymentMonth: "January", academicYear: 2026, feeAmount: 1000, paymentMethod: "Online Bank Transfer", bankName: "People's Bank", transactionDate: "2026-01-28", depositReferenceNo: "PB-998231", proofFileName: "kasun_jan_receipt.pdf", proofUrl: "https://example.com/proof.pdf", status: "VERIFIED", adminNotes: "Bank transfer reference matches.", verifiedAt: "2026-01-29T10:15:00Z", createdAt: "2026-01-28T14:20:00Z" },
  { id: "sub-102", paymentRef: "THF-PAY-26-0002", studentId: "std-002", studentRegNo: "THF-26-0002", studentName: "Dilini Senaratne", guardianEmail: "demo.parent.dilini@example.com", guardianPhone: "+94 71 000 0002", paymentMonth: "February", academicYear: 2026, feeAmount: 1000, paymentMethod: "Cash Deposit", bankName: "People's Bank", transactionDate: "2026-02-02", depositReferenceNo: "PB-776109", proofFileName: "dilini_feb_slip.jpg", proofUrl: "https://example.com/proof2.jpg", status: "PENDING", createdAt: "2026-02-02T09:10:00Z" },
  { id: "sub-103", paymentRef: "THF-PAY-26-0003", studentId: "std-003", studentRegNo: "THF-26-0003", studentName: "Mohamed Rilwan", guardianEmail: "demo.parent.rilwan@example.com", guardianPhone: "+94 75 000 0003", paymentMonth: "February", academicYear: 2026, feeAmount: 1000, paymentMethod: "Online Bank Transfer", bankName: "People's Bank", transactionDate: "2026-02-03", depositReferenceNo: "PB-332901", proofFileName: "rilwan_feb_transfer.png", proofUrl: "https://example.com/proof3.png", status: "CLARIFICATION_NEEDED", adminNotes: "Receipt image is blurry.", createdAt: "2026-02-03T11:45:00Z" },
];

beforeAll(() => {
  INITIAL_STUDENTS.length = 0;
  INITIAL_STUDENTS.push(...TEST_STUDENTS);
  INITIAL_SUBMISSIONS.length = 0;
  INITIAL_SUBMISSIONS.push(...TEST_SUBMISSIONS);
});

afterAll(() => {
  INITIAL_STUDENTS.length = 0;
  INITIAL_SUBMISSIONS.length = 0;
});

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Builds a fully valid payment payload for testing */
function makeValidPayload(
  overrides: Partial<SubmitPaymentInput> = {}
): SubmitPaymentInput {
  return {
    studentRegNo: "THF-26-0001",
    studentName: "K. K. Perera",
    grade: "Grade 6",
    programme: "Foundation Sinhala",
    paymentMonth: "March", // Use a month not in mock data
    paymentMonthInt: 3,
    paymentYear: 2026,
    amount: 1000,
    paymentDate: "2026-03-05",
    paymentMethod: "Bank Transfer",
    bankReference: "PB-12345",
    parentEmail: "demo.parent.kasun@example.com",
    parentWhatsapp: "+94 77 000 0001",
    proofFileName: "receipt_march.jpg",
    proofFileSizeMB: 1.5,
    proofFileType: "image/jpeg",
    ...overrides,
  };
}

// ─────────────────────────────────────────────────────────────────────────────

describe("TC-PS: Payment Submission Action", () => {
  // ── TC-PS-01 First valid submission ───────────────────────────────────────
  describe("TC-PS-01 – First valid payment submission", () => {
    it("succeeds for a student with no prior submission for the month", async () => {
      const result = await submitPaymentForm(makeValidPayload());
      expect(result.success).toBe(true);
      expect(result.paymentRef).toBeTruthy();
      expect(result.error).toBeUndefined();
    });
  });

  // ── TC-PS-02 Duplicate PENDING ────────────────────────────────────────────
  describe("TC-PS-02 – Duplicate PENDING payment blocked", () => {
    it("returns success=false when a PENDING submission already exists for same student+month", async () => {
      // THF-26-0002 / February 2026 is PENDING in mock data
      const result = await submitPaymentForm(
        makeValidPayload({
          studentRegNo: "THF-26-0002",
          paymentMonth: "February",
          paymentMonthInt: 2,
        })
      );
      expect(result.success).toBe(false);
      expect(result.existingStatus).toBe("PENDING");
    });

    it("error message mentions the existing payment reference", async () => {
      const result = await submitPaymentForm(
        makeValidPayload({
          studentRegNo: "THF-26-0002",
          paymentMonth: "February",
          paymentMonthInt: 2,
        })
      );
      // Should mention the pending ref: THF-PAY-26-0002
      expect(result.error).toMatch(/THF-PAY-26-0002/i);
    });
  });

  // ── TC-PS-03 Duplicate VERIFIED ───────────────────────────────────────────
  describe("TC-PS-03 – Duplicate VERIFIED payment blocked", () => {
    it("returns success=false when a VERIFIED submission already exists for same student+month", async () => {
      // THF-26-0001 / January 2026 is VERIFIED in mock data
      const result = await submitPaymentForm(
        makeValidPayload({
          studentRegNo: "THF-26-0001",
          paymentMonth: "January",
          paymentMonthInt: 1,
        })
      );
      expect(result.success).toBe(false);
      expect(result.existingStatus).toBe("VERIFIED");
    });

    it("error message mentions 'verified' or 'approved'", async () => {
      const result = await submitPaymentForm(
        makeValidPayload({
          studentRegNo: "THF-26-0001",
          paymentMonth: "January",
          paymentMonthInt: 1,
        })
      );
      expect(result.error?.toLowerCase()).toMatch(/verified|approved/);
    });
  });

  // ── TC-PS-04 Allowed after REJECTED / CLARIFICATION_NEEDED ──────────────
  describe("TC-PS-04 – Re-submission after CLARIFICATION_NEEDED or REJECTED", () => {
    it("allows re-submission when existing status is CLARIFICATION_NEEDED", async () => {
      // THF-26-0003 / February 2026 is CLARIFICATION_NEEDED in mock data
      const result = await checkPaymentPeriodStatus(
        "THF-26-0003",
        "February",
        2026
      );
      expect(result.allowed).toBe(true);
      expect(result.status).toBe("CLARIFICATION_NEEDED");
    });

    it("exposes the admin clarification note in the check result", async () => {
      const result = await checkPaymentPeriodStatus(
        "THF-26-0003",
        "February",
        2026
      );
      expect(result.adminNote).toBeTruthy();
    });
  });

  // ── TC-PS-05 Missing required fields ──────────────────────────────────────
  describe("TC-PS-05 – Missing required fields", () => {
    it("rejects submission with empty studentRegNo", async () => {
      const result = await submitPaymentForm(
        makeValidPayload({ studentRegNo: "" })
      );
      expect(result.success).toBe(false);
    });

    it("rejects submission with empty paymentMonth", async () => {
      const result = await submitPaymentForm(
        makeValidPayload({ paymentMonth: "" } as any)
      );
      expect(result.success).toBe(false);
    });
  });

  // ── TC-PS-06 Invalid email ────────────────────────────────────────────────
  describe("TC-PS-06 – Invalid parent email", () => {
    const badEmails = [
      "notanemail",
      "missing@domain",
      "@nodomain.com",
      "spaces in@email.com",
      "",
    ];

    badEmails.forEach((email) => {
      it(`rejects parentEmail "${email}"`, async () => {
        const result = await submitPaymentForm(
          makeValidPayload({ parentEmail: email })
        );
        expect(result.success).toBe(false);
        expect(result.error?.toLowerCase()).toMatch(/email/);
      });
    });
  });

  // ── TC-PS-07 Short WhatsApp number ────────────────────────────────────────
  describe("TC-PS-07 – Invalid WhatsApp number", () => {
    it("rejects parentWhatsapp shorter than 8 characters", async () => {
      const result = await submitPaymentForm(
        makeValidPayload({ parentWhatsapp: "12345" })
      );
      expect(result.success).toBe(false);
      expect(result.error?.toLowerCase()).toMatch(/whatsapp/);
    });
  });

  // ── TC-PS-08 Amount ≤ 0 ───────────────────────────────────────────────────
  describe("TC-PS-08 – Amount validation", () => {
    it("rejects amount of 0", async () => {
      const result = await submitPaymentForm(makeValidPayload({ amount: 0 }));
      expect(result.success).toBe(false);
      expect(result.error?.toLowerCase()).toMatch(/amount/);
    });

    it("rejects negative amount", async () => {
      const result = await submitPaymentForm(makeValidPayload({ amount: -100 }));
      expect(result.success).toBe(false);
    });
  });

  // ── TC-PS-09 Invalid MIME type ────────────────────────────────────────────
  describe("TC-PS-09 – Invalid file MIME type", () => {
    const invalidTypes = [
      "text/plain",
      "application/exe",
      "video/mp4",
      "image/gif",
      "image/webp",
      "application/javascript",
    ];

    invalidTypes.forEach((mime) => {
      it(`rejects MIME type "${mime}"`, async () => {
        const result = await submitPaymentForm(
          makeValidPayload({ proofFileType: mime })
        );
        expect(result.success).toBe(false);
        expect(result.error?.toLowerCase()).toMatch(/file type|mime|invalid/);
      });
    });
  });

  // ── TC-PS-10 PDF accepted ─────────────────────────────────────────────────
  describe("TC-PS-10 – PDF file accepted", () => {
    it("accepts application/pdf proof files", async () => {
      const result = await submitPaymentForm(
        makeValidPayload({
          proofFileType: "application/pdf",
          proofFileName: "receipt_march.pdf",
          paymentMonth: "April",
          paymentMonthInt: 4,
        })
      );
      expect(result.success).toBe(true);
    });
  });

  // ── TC-PS-11 JPEG accepted ────────────────────────────────────────────────
  describe("TC-PS-11 – JPEG image accepted", () => {
    it("accepts image/jpeg proof files", async () => {
      const result = await submitPaymentForm(
        makeValidPayload({
          proofFileType: "image/jpeg",
          paymentMonth: "May",
          paymentMonthInt: 5,
        })
      );
      expect(result.success).toBe(true);
    });

    it("accepts image/jpg proof files (alias)", async () => {
      const result = await submitPaymentForm(
        makeValidPayload({
          proofFileType: "image/jpg",
          paymentMonth: "June",
          paymentMonthInt: 6,
        })
      );
      expect(result.success).toBe(true);
    });
  });

  // ── TC-PS-12 PNG accepted ─────────────────────────────────────────────────
  describe("TC-PS-12 – PNG image accepted", () => {
    it("accepts image/png proof files", async () => {
      const result = await submitPaymentForm(
        makeValidPayload({
          proofFileType: "image/png",
          proofFileName: "receipt_may.png",
          paymentMonth: "July",
          paymentMonthInt: 7,
        })
      );
      expect(result.success).toBe(true);
    });
  });

  // ── TC-PS-13 Oversized file ───────────────────────────────────────────────
  describe("TC-PS-13 – Oversized file rejected", () => {
    it("rejects file size exactly at 10.01 MB", async () => {
      const result = await submitPaymentForm(
        makeValidPayload({ proofFileSizeMB: 10.01 })
      );
      expect(result.success).toBe(false);
      expect(result.error?.toLowerCase()).toMatch(/size|10 mb|limit/);
    });

    it("rejects file size of 50 MB", async () => {
      const result = await submitPaymentForm(
        makeValidPayload({ proofFileSizeMB: 50 })
      );
      expect(result.success).toBe(false);
    });

    it("accepts file exactly at the 10 MB limit", async () => {
      const result = await submitPaymentForm(
        makeValidPayload({
          proofFileSizeMB: 10,
          paymentMonth: "August",
          paymentMonthInt: 8,
        })
      );
      expect(result.success).toBe(true);
    });
  });

  // ── TC-PS-14 Payment reference format ────────────────────────────────────
  describe("TC-PS-14 – Generated payment reference format", () => {
    it("generated paymentRef matches THF-PAY-YY-NNNN pattern", async () => {
      const result = await submitPaymentForm(
        makeValidPayload({
          paymentMonth: "September",
          paymentMonthInt: 9,
        })
      );
      expect(result.success).toBe(true);
      expect(result.paymentRef).toMatch(/^THF-PAY-\d{2}-\d+$/);
    });
  });

  // ── TC-PS-15 Missing payment date ────────────────────────────────────────
  describe("TC-PS-15 – Missing payment date", () => {
    it("rejects submission with empty paymentDate", async () => {
      const result = await submitPaymentForm(
        makeValidPayload({ paymentDate: "" })
      );
      expect(result.success).toBe(false);
      expect(result.error?.toLowerCase()).toMatch(/date/);
    });
  });
});
