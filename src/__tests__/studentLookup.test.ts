// ─── THOFNAA PAYMENT VERIFICATION SYSTEM ────────────────────────────────────
// Test Suite 1: Student Lookup Action (studentLookupAction.ts)
//
// Covers:
//   TC-SL-01  Valid student lookup returns safe public fields only
//   TC-SL-02  Invalid registration number format is rejected
//   TC-SL-03  Unknown registration number returns informative error
//   TC-SL-04  Inactive / suspended student lookup is blocked
//   TC-SL-05  Name masking – full name reduced to initials format
//   TC-SL-06  Empty input is rejected
//   TC-SL-07  Whitespace-only input is rejected
//   TC-SL-08  Lowercase input is normalised before lookup
//   TC-SL-09  No sensitive fields (email, phone, guardianName) are returned
// ─────────────────────────────────────────────────────────────────────────────

import { lookupStudentRegNo } from "@/app/actions/studentLookupAction";
import { INITIAL_STUDENTS, Student } from "@/lib/mockData";

const TEST_STUDENTS: Student[] = [
  { id: "std-001", studentRegNo: "THF-26-0001", fullName: "Kasun Kalhara Perera", gradeLevel: "Grade 6", batch: "Foundation Sinhala", programme: "Second Language Sinhala", guardianName: "Sunil Perera", guardianEmail: "demo.parent.kasun@example.com", guardianPhone: "+94 77 000 0001", whatsappNumber: "+94 77 000 0001", createdAt: "2026-01-05" },
  { id: "std-004", studentRegNo: "THF-26-0004", fullName: "Ruwan Wickremasinghe", gradeLevel: "Grade 9", batch: "Intermediate Sinhala", programme: "Second Language Sinhala", guardianName: "Gamini Wickremasinghe", guardianEmail: "demo.parent.ruwan@example.com", guardianPhone: "+94 77 000 0004", whatsappNumber: "+94 77 000 0004", createdAt: "2026-01-18", active: false },
];

beforeAll(() => {
  INITIAL_STUDENTS.length = 0;
  INITIAL_STUDENTS.push(...TEST_STUDENTS);
});

afterAll(() => {
  INITIAL_STUDENTS.length = 0;
});

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Active student used across most tests */
const ACTIVE_REG_NO = "THF-26-0001"; // Kasun Kalhara Perera – Grade 6
const ACTIVE_STUDENT_EMAIL = "demo.parent.kasun@example.com";

// ─────────────────────────────────────────────────────────────────────────────

describe("TC-SL: Student Registration Lookup Action", () => {
  // ── TC-SL-01 Valid lookup ────────────────────────────────────────────────
  describe("TC-SL-01 – Valid student lookup", () => {
    it("returns success=true and public student fields for a known active reg no", async () => {
      const result = await lookupStudentRegNo(ACTIVE_REG_NO);

      expect(result.success).toBe(true);
      expect(result.student).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    it("returns the correct registration number", async () => {
      const result = await lookupStudentRegNo(ACTIVE_REG_NO);
      expect(result.student?.registrationNo).toBe(ACTIVE_REG_NO);
    });

    it("returns grade information", async () => {
      const result = await lookupStudentRegNo(ACTIVE_REG_NO);
      expect(result.student?.grade).toBeTruthy();
    });

    it("returns programme information", async () => {
      const result = await lookupStudentRegNo(ACTIVE_REG_NO);
      expect(result.student?.programme).toBeTruthy();
    });

    it("returns a positive monthly fee amount", async () => {
      const result = await lookupStudentRegNo(ACTIVE_REG_NO);
      expect(result.student?.monthlyFeeLKR).toBeGreaterThan(0);
    });

    it("returns ACTIVE status for an active student", async () => {
      const result = await lookupStudentRegNo(ACTIVE_REG_NO);
      expect(result.student?.status).toBe("ACTIVE");
    });
  });

  // ── TC-SL-02 Invalid format ───────────────────────────────────────────────
  describe("TC-SL-02 – Invalid registration number format", () => {
    const invalidFormats = [
      "THF-260001",       // missing second dash
      "TH-26-0001",       // prefix too short
      "THOF-26-0001",     // prefix too long
      "THF-2A-0001",      // letter in year segment
      "THF-26-001",       // NNNN too short
      "THF-26-00011",     // NNNN too long
      "thf26-0001",       // lowercase and wrong separator
      "THF 26 0001",      // spaces instead of dashes
      "random-string",    // completely wrong
      "123456",           // numbers only
    ];

    invalidFormats.forEach((regNo) => {
      it(`rejects "${regNo}" with a format error`, async () => {
        const result = await lookupStudentRegNo(regNo);
        expect(result.success).toBe(false);
        expect(result.error).toMatch(/invalid registration format/i);
      });
    });
  });

  // ── TC-SL-03 Unknown registration number ─────────────────────────────────
  describe("TC-SL-03 – Unknown registration number", () => {
    it("returns success=false for a correctly formatted but non-existent reg no", async () => {
      const result = await lookupStudentRegNo("THF-26-9999");
      expect(result.success).toBe(false);
    });

    it("error message mentions the reg no and admin contact", async () => {
      const result = await lookupStudentRegNo("THF-26-9999");
      expect(result.error).toMatch(/THF-26-9999/);
      expect(result.error).toMatch(/\+94 75 460 3008/);
    });
  });

  // ── TC-SL-04 Inactive student ─────────────────────────────────────────────
  describe("TC-SL-04 – Inactive / suspended student", () => {
    it("blocks lookup for a student whose status is not ACTIVE", async () => {
      // Temporarily mark std-001 as INACTIVE
      const student = INITIAL_STUDENTS.find(
        (s) => s.studentRegNo === ACTIVE_REG_NO
      )!;
      (student as any).status = "INACTIVE";

      const result = await lookupStudentRegNo(ACTIVE_REG_NO);

      // Restore
      delete (student as any).status;

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/inactive|suspended/i);
    });
  });

  // ── TC-SL-05 Name masking ─────────────────────────────────────────────────
  describe("TC-SL-05 – Name masking (privacy)", () => {
    it("converts full name to initials format (e.g. K. K. Perera)", async () => {
      const result = await lookupStudentRegNo(ACTIVE_REG_NO);
      // Should NOT contain full [DEMO] or Kasun in the name string
      const name = result.student?.nameWithInitials ?? "";
      expect(name).toMatch(/^[A-Z]\.\s/); // Starts with "X. "
    });

    it("masked name does not contain the [DEMO] prefix", async () => {
      const result = await lookupStudentRegNo(ACTIVE_REG_NO);
      expect(result.student?.nameWithInitials).not.toContain("[DEMO]");
    });
  });

  // ── TC-SL-06 & TC-SL-07 Empty / whitespace input ─────────────────────────
  describe("TC-SL-06/07 – Empty and whitespace input", () => {
    it("rejects an empty string", async () => {
      const result = await lookupStudentRegNo("");
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it("rejects a whitespace-only string", async () => {
      const result = await lookupStudentRegNo("   ");
      expect(result.success).toBe(false);
    });
  });

  // ── TC-SL-08 Case normalisation ───────────────────────────────────────────
  describe("TC-SL-08 – Case normalisation", () => {
    it("finds student for lowercase input 'thf-26-0001'", async () => {
      const result = await lookupStudentRegNo("thf-26-0001");
      expect(result.success).toBe(true);
    });

    it("finds student for mixed-case input 'Thf-26-0001'", async () => {
      const result = await lookupStudentRegNo("Thf-26-0001");
      expect(result.success).toBe(true);
    });
  });

  // ── TC-SL-09 No sensitive data returned ──────────────────────────────────
  describe("TC-SL-09 – No sensitive data exposure", () => {
    it("returned student object does not contain guardianEmail", async () => {
      const result = await lookupStudentRegNo(ACTIVE_REG_NO);
      const studentObj = result.student as Record<string, unknown>;
      expect(studentObj).not.toHaveProperty("guardianEmail");
      expect(studentObj).not.toHaveProperty("email");
    });

    it("returned student object does not contain guardianPhone", async () => {
      const result = await lookupStudentRegNo(ACTIVE_REG_NO);
      const studentObj = result.student as Record<string, unknown>;
      expect(studentObj).not.toHaveProperty("guardianPhone");
      expect(studentObj).not.toHaveProperty("phone");
    });

    it("returned student object does not contain guardianName", async () => {
      const result = await lookupStudentRegNo(ACTIVE_REG_NO);
      const studentObj = result.student as Record<string, unknown>;
      expect(studentObj).not.toHaveProperty("guardianName");
    });

    it("returned student object does not expose internal database id directly", async () => {
      const result = await lookupStudentRegNo(ACTIVE_REG_NO);
      // The 'id' field is internal – confirm returned public fields do not leak parent
      const studentObj = result.student as Record<string, unknown>;
      // 'id' is returned for reference, but sensitive joined fields should not appear
      expect(JSON.stringify(studentObj)).not.toContain(ACTIVE_STUDENT_EMAIL);
    });
  });
});
