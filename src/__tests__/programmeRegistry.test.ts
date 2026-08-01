// ─── THOFNAA PAYMENT VERIFICATION SYSTEM ────────────────────────────────────
// Test Suite 5: Programme Registry & Grade-to-Batch Engine (programmes.ts)
//
// Covers:
//   TC-PR-01  Grade 6 maps to Foundation Sinhala
//   TC-PR-02  Grade 7 maps to Foundation Sinhala
//   TC-PR-03  Grade 8 maps to Intermediate Sinhala
//   TC-PR-04  Grade 9 maps to Intermediate Sinhala
//   TC-PR-05  Grade 10 maps to Senior / O/L Sinhala
//   TC-PR-06  Grade 11 maps to Senior / O/L Sinhala
//   TC-PR-07  Foundation Sinhala schedules are correct
//   TC-PR-08  Intermediate Sinhala schedules are correct
//   TC-PR-09  Senior / O/L Sinhala schedules are correct
//   TC-PR-10  Unknown grade falls back to first batch (Foundation)
//   TC-PR-11  Case-insensitive grade matching
//   TC-PR-12  New programme can be registered dynamically
//   TC-PR-13  getAllProgrammes() returns all registered programmes
//   TC-PR-14  Monthly fee for Sinhala programme is LKR 1,000
// ─────────────────────────────────────────────────────────────────────────────

import {
  programmeRegistry,
  getBatchForGrade,
  getSchedulesForGrade,
  getProgrammeDetails,
  type ProgrammeConfig,
} from "@/lib/programmes";

// ─────────────────────────────────────────────────────────────────────────────

describe("TC-PR: Programme Registry & Grade-to-Batch Engine", () => {
  // ── TC-PR-01 to TC-PR-06: Grade Mapping ──────────────────────────────────
  describe("Grade → Batch Mapping", () => {
    const gradeMap: [string, string][] = [
      ["Grade 6",  "Foundation Sinhala"],
      ["Grade 7",  "Foundation Sinhala"],
      ["Grade 8",  "Intermediate Sinhala"],
      ["Grade 9",  "Intermediate Sinhala"],
      ["Grade 10", "Senior / O/L Sinhala"],
      ["Grade 11", "Senior / O/L Sinhala"],
    ];

    gradeMap.forEach(([grade, expectedBatch]) => {
      it(`maps "${grade}" → "${expectedBatch}"`, () => {
        const batch = getBatchForGrade(grade);
        expect(batch).not.toBeNull();
        expect(batch?.name).toBe(expectedBatch);
      });
    });
  });

  // ── TC-PR-07 Foundation Sinhala schedules ────────────────────────────────
  describe("TC-PR-07 – Foundation Sinhala class schedules", () => {
    it("has Saturday 3:00 PM – 4:00 PM", () => {
      const schedules = getSchedulesForGrade("Grade 6");
      const sat = schedules.find((s) => s.day === "Saturday");
      expect(sat).toBeDefined();
      expect(sat?.time).toBe("3:00 PM – 4:00 PM");
    });

    it("has Sunday 11:00 AM – 12:00 PM", () => {
      const schedules = getSchedulesForGrade("Grade 6");
      const sun = schedules.find((s) => s.day === "Sunday");
      expect(sun).toBeDefined();
      expect(sun?.time).toBe("11:00 AM – 12:00 PM");
    });

    it("has exactly 2 session days per week", () => {
      const schedules = getSchedulesForGrade("Grade 7");
      expect(schedules).toHaveLength(2);
    });
  });

  // ── TC-PR-08 Intermediate Sinhala schedules ───────────────────────────────
  describe("TC-PR-08 – Intermediate Sinhala class schedules", () => {
    it("has Saturday 1:00 PM – 2:00 PM", () => {
      const schedules = getSchedulesForGrade("Grade 8");
      const sat = schedules.find((s) => s.day === "Saturday");
      expect(sat?.time).toBe("1:00 PM – 2:00 PM");
    });

    it("has Sunday 1:00 PM – 2:00 PM", () => {
      const schedules = getSchedulesForGrade("Grade 9");
      const sun = schedules.find((s) => s.day === "Sunday");
      expect(sun?.time).toBe("1:00 PM – 2:00 PM");
    });
  });

  // ── TC-PR-09 Senior / O/L Sinhala schedules ──────────────────────────────
  describe("TC-PR-09 – Senior / O/L Sinhala class schedules", () => {
    it("has Saturday 7:00 PM – 8:00 PM", () => {
      const schedules = getSchedulesForGrade("Grade 10");
      const sat = schedules.find((s) => s.day === "Saturday");
      expect(sat?.time).toBe("7:00 PM – 8:00 PM");
    });

    it("has Sunday 7:00 PM – 8:00 PM", () => {
      const schedules = getSchedulesForGrade("Grade 11");
      const sun = schedules.find((s) => s.day === "Sunday");
      expect(sun?.time).toBe("7:00 PM – 8:00 PM");
    });
  });

  // ── TC-PR-10 Unknown grade falls back ─────────────────────────────────────
  describe("TC-PR-10 – Unknown grade falls back to first batch", () => {
    it("returns Foundation Sinhala for unknown grade 'Grade 5'", () => {
      const batch = getBatchForGrade("Grade 5");
      // Should fall back to first batch
      expect(batch).not.toBeNull();
      expect(batch?.name).toBe("Foundation Sinhala");
    });

    it("does not throw for completely unknown grade strings", () => {
      expect(() => getBatchForGrade("University Year 1")).not.toThrow();
    });
  });

  // ── TC-PR-11 Case-insensitive grade matching ──────────────────────────────
  describe("TC-PR-11 – Case-insensitive grade matching", () => {
    it("matches 'grade 6' (all lowercase)", () => {
      const batch = getBatchForGrade("grade 6");
      expect(batch?.name).toBe("Foundation Sinhala");
    });

    it("matches 'GRADE 10' (all uppercase)", () => {
      const batch = getBatchForGrade("GRADE 10");
      expect(batch?.name).toBe("Senior / O/L Sinhala");
    });
  });

  // ── TC-PR-12 Dynamic programme registration ───────────────────────────────
  describe("TC-PR-12 – Dynamic programme registration", () => {
    it("can register a new programme at runtime", () => {
      const newProgramme: ProgrammeConfig = {
        id: "test-mathematics",
        name: "Mathematics",
        code: "MATH",
        subject: "Mathematics",
        monthlyFeeLKR: 1500,
        batches: [
          {
            id: "math-grade-6-7",
            name: "Junior Maths",
            grades: ["Grade 6", "Grade 7"],
            schedules: [{ day: "Saturday", time: "10:00 AM – 11:00 AM" }],
          },
        ],
      };

      programmeRegistry.registerProgramme(newProgramme);
      const retrieved = programmeRegistry.getProgramme("test-mathematics");
      expect(retrieved?.name).toBe("Mathematics");
    });

    it("new programme grades resolve correctly", () => {
      const batch = programmeRegistry.getBatchForGrade("Grade 6", "test-mathematics");
      expect(batch?.name).toBe("Junior Maths");
    });
  });

  // ── TC-PR-13 getAllProgrammes() ───────────────────────────────────────────
  describe("TC-PR-13 – getAllProgrammes()", () => {
    it("returns at least one programme", () => {
      const all = programmeRegistry.getAllProgrammes();
      expect(all.length).toBeGreaterThanOrEqual(1);
    });

    it("includes the default Sinhala programme", () => {
      const all = programmeRegistry.getAllProgrammes();
      const sinhala = all.find((p) => p.id === "sinhala-second-language");
      expect(sinhala).toBeDefined();
    });
  });

  // ── TC-PR-14 Monthly fee ──────────────────────────────────────────────────
  describe("TC-PR-14 – Monthly fee for Sinhala programme", () => {
    it("Sinhala programme fee is LKR 1,000", () => {
      const details = getProgrammeDetails("sinhala-second-language");
      expect(details.monthlyFeeLKR).toBe(1000);
    });
  });
});
