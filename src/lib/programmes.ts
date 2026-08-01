/**
 * THOFNAA INSTITUTE - PROGRAMME & GRADE-TO-BATCH CONFIGURATION ENGINE
 * 
 * Scalable architecture supporting dynamic grade-to-batch mapping, class schedules,
 * and multi-subject expansion without altering core payment verification logic.
 */

export interface ClassSchedule {
  day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
  time: string; // e.g. "3:00 PM – 4:00 PM"
}

export interface BatchConfig {
  id: string;
  name: string; // e.g. "Foundation Sinhala"
  grades: string[]; // e.g. ["Grade 6", "Grade 7"]
  schedules: ClassSchedule[];
}

export interface ProgrammeConfig {
  id: string; // e.g. "sinhala-second-language"
  name: string; // e.g. "Second Language Sinhala"
  code: string; // e.g. "SLS"
  subject: string; // e.g. "Sinhala Language"
  monthlyFeeLKR: number;
  batches: BatchConfig[];
}

/**
 * DEFAULT PROGRAMME DEFINITIONS: Second Language Sinhala
 */
export const DEFAULT_PROGRAMMES: Record<string, ProgrammeConfig> = {
  "sinhala-second-language": {
    id: "sinhala-second-language",
    name: "Second Language Sinhala",
    code: "SLS",
    subject: "Sinhala Language",
    monthlyFeeLKR: 1000,
    batches: [
      {
        id: "foundation-sinhala",
        name: "Foundation Sinhala",
        grades: ["Grade 6", "Grade 7"],
        schedules: [
          { day: "Saturday", time: "3:00 PM – 4:00 PM" },
          { day: "Sunday", time: "11:00 AM – 12:00 PM" },
        ],
      },
      {
        id: "intermediate-sinhala",
        name: "Intermediate Sinhala",
        grades: ["Grade 8", "Grade 9"],
        schedules: [
          { day: "Saturday", time: "1:00 PM – 2:00 PM" },
          { day: "Sunday", time: "1:00 PM – 2:00 PM" },
        ],
      },
      {
        id: "senior-ol-sinhala",
        name: "Senior / O/L Sinhala",
        grades: ["Grade 10", "Grade 11"],
        schedules: [
          { day: "Saturday", time: "7:00 PM – 8:00 PM" },
          { day: "Sunday", time: "7:00 PM – 8:00 PM" },
        ],
      },
    ],
  },
};

/**
 * Global Programme Registry
 * Allows adding new programmes (e.g. Mathematics, English) dynamically at runtime or build time.
 */
class ProgrammeRegistry {
  private programmes: Map<string, ProgrammeConfig> = new Map();

  constructor() {
    Object.values(DEFAULT_PROGRAMMES).forEach((p) => this.programmes.set(p.id, p));
  }

  public registerProgramme(config: ProgrammeConfig): void {
    this.programmes.set(config.id, config);
  }

  public getProgramme(programmeId = "sinhala-second-language"): ProgrammeConfig | undefined {
    return this.programmes.get(programmeId) || this.programmes.get("sinhala-second-language");
  }

  public getAllProgrammes(): ProgrammeConfig[] {
    return Array.from(this.programmes.values());
  }

  /**
   * Dynamic Grade-to-Batch Resolver
   * Maps any grade (e.g. "Grade 6") to its corresponding BatchConfig (e.g. "Foundation Sinhala")
   */
  public getBatchForGrade(grade: string, programmeId = "sinhala-second-language"): BatchConfig | null {
    const programme = this.getProgramme(programmeId);
    if (!programme) return null;

    const normalizedGrade = grade.trim();
    for (const batch of programme.batches) {
      if (batch.grades.some((g) => g.toLowerCase() === normalizedGrade.toLowerCase() || normalizedGrade.toLowerCase().includes(g.toLowerCase()))) {
        return batch;
      }
    }

    // Default fallback batch if grade not explicitly matched
    return programme.batches[0] || null;
  }

  /**
   * Retrieves class schedules for a specific grade level
   */
  public getSchedulesForGrade(grade: string, programmeId = "sinhala-second-language"): ClassSchedule[] {
    const batch = this.getBatchForGrade(grade, programmeId);
    return batch ? batch.schedules : [];
  }
}

export const programmeRegistry = new ProgrammeRegistry();

/**
 * Helper Utilities for Components
 */
export function getBatchForGrade(grade: string, programmeId?: string): BatchConfig | null {
  return programmeRegistry.getBatchForGrade(grade, programmeId);
}

export function getSchedulesForGrade(grade: string, programmeId?: string): ClassSchedule[] {
  return programmeRegistry.getSchedulesForGrade(grade, programmeId);
}

export function getProgrammeDetails(programmeId?: string): ProgrammeConfig {
  return programmeRegistry.getProgramme(programmeId)!;
}
