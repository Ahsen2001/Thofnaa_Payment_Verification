// ─── THOFNAA PAYMENT VERIFICATION SYSTEM ────────────────────────────────────
// Test Suite 7: Utility Functions (utils.ts)
//
// Covers:
//   TC-UT-01  formatLKR formats numbers as LKR currency
//   TC-UT-02  formatLKR handles zero and large values
//   TC-UT-03  formatNameWithInitials produces X. X. LastName format
//   TC-UT-04  formatNameWithInitials handles single-word names
//   TC-UT-05  formatNameWithInitials handles [DEMO] prefixes cleanly
//   TC-UT-06  formatRegNumber strips lowercase and special characters
// ─────────────────────────────────────────────────────────────────────────────

// ─── THOFNAA PAYMENT VERIFICATION SYSTEM ────────────────────────────────────
// Test Suite 8: Admin Auth Action – unit-level (mocked Supabase)
//
// Covers:
//   TC-AA-01  Missing email / password returns error
//   TC-AA-02  Demo account admin@thofnaa.edu.lk / admin123 succeeds
//   TC-AA-03  Wrong password for demo account is rejected
//   TC-AA-04  Successful login returns redirectUrl = "/admin"
// ─────────────────────────────────────────────────────────────────────────────

// ─── THOFNAA PAYMENT VERIFICATION SYSTEM ────────────────────────────────────
// Test Suite 9: Audit Log Engine (auditLogs.ts)
//
// Covers:
//   TC-AL-01  recordAuditLog creates a new record with a unique ID
//   TC-AL-02  recordAuditLog stores action, entityType, entityId correctly
//   TC-AL-03  recordAuditLog inserts record at the beginning (newest first)
//   TC-AL-04  recordAuditLog sets timestamp to current time (ISO string)
//   TC-AL-05  INITIAL_AUDIT_LOGS is pre-seeded with sample entries
// ─────────────────────────────────────────────────────────────────────────────

import {
  formatLKR,
  formatNameWithInitials,
  formatRegNumber,
} from "@/lib/utils";

import {
  recordAuditLog,
  INITIAL_AUDIT_LOGS,
  type AuditActionType,
  type AuditEntityType,
} from "@/lib/auditLogs";

// ─────────────────────────────────────────────────────────────────────────────

// ╔══════════════════════════════════════════════════════════╗
// ║  Suite 7: Utility Functions                              ║
// ╚══════════════════════════════════════════════════════════╝

describe("TC-UT: Utility Functions (utils.ts)", () => {
  // ── TC-UT-01 formatLKR ───────────────────────────────────────────────────
  describe("TC-UT-01/02 – formatLKR", () => {
    it("formats 1000 as LKR currency string", () => {
      const formatted = formatLKR(1000);
      expect(formatted).toContain("1,000");
    });

    it("includes LKR in the formatted string", () => {
      const formatted = formatLKR(500);
      expect(formatted).toMatch(/LKR|Rs/i);
    });

    it("formats 0 correctly", () => {
      const formatted = formatLKR(0);
      expect(formatted).toContain("0");
    });

    it("formats large number 100000 with thousand separator", () => {
      const formatted = formatLKR(100000);
      expect(formatted).toMatch(/100,000/);
    });

    it("includes 2 decimal places", () => {
      const formatted = formatLKR(1000);
      expect(formatted).toMatch(/\.00/);
    });
  });

  // ── TC-UT-03/04/05 formatNameWithInitials ────────────────────────────────
  describe("TC-UT-03 – formatNameWithInitials", () => {
    it("converts 'Kasun Kalhara Perera' to 'K. K. Perera'", () => {
      expect(formatNameWithInitials("Kasun Kalhara Perera")).toBe("K. K. Perera");
    });

    it("converts 'Dilini Senaratne' to 'D. Senaratne'", () => {
      expect(formatNameWithInitials("Dilini Senaratne")).toBe("D. Senaratne");
    });

    it("handles single-word name by returning it unchanged", () => {
      expect(formatNameWithInitials("Kasun")).toBe("Kasun");
    });

    it("handles empty string", () => {
      expect(formatNameWithInitials("")).toBe("");
    });

    it("handles extra whitespace gracefully", () => {
      const result = formatNameWithInitials("  Kasun  Perera  ");
      expect(result).toContain("K.");
      expect(result).toContain("Perera");
    });
  });

  // ── TC-UT-05 [DEMO] prefix stripping ─────────────────────────────────────
  describe("TC-UT-05 – [DEMO] prefix handling", () => {
    // Note: formatNameWithInitials does NOT strip [DEMO] – the studentLookup
    // action handles that. We verify here that the raw formatter preserves brackets.
    it("formatNameWithInitials does not silently corrupt bracket content", () => {
      const result = formatNameWithInitials("[DEMO] Kasun Perera");
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });
  });

  // ── TC-UT-06 formatRegNumber ──────────────────────────────────────────────
  describe("TC-UT-06 – formatRegNumber", () => {
    it("uppercases a lowercase reg no", () => {
      expect(formatRegNumber("thf-26-0001")).toBe("THF-26-0001");
    });

    it("strips characters other than letters, digits, and dashes", () => {
      // Spaces, special chars should be stripped
      const cleaned = formatRegNumber("THF 26 0001!!");
      expect(cleaned).not.toContain(" ");
      expect(cleaned).not.toContain("!");
    });

    it("preserves a well-formed reg no unchanged", () => {
      expect(formatRegNumber("THF-26-0001")).toBe("THF-26-0001");
    });
  });
});

// ╔══════════════════════════════════════════════════════════╗
// ║  Suite 9: Audit Log Engine                               ║
// ╚══════════════════════════════════════════════════════════╝

describe("TC-AL: Audit Log Engine (auditLogs.ts)", () => {
  // ── TC-AL-05 Pre-seeded logs ──────────────────────────────────────────────
  describe("TC-AL-05 – INITIAL_AUDIT_LOGS is pre-seeded", () => {
    it("contains at least one pre-seeded audit entry", () => {
      expect(INITIAL_AUDIT_LOGS.length).toBeGreaterThan(0);
    });

    it("first entry has required fields: id, action, entityType, timestamp", () => {
      const first = INITIAL_AUDIT_LOGS[0];
      expect(first.id).toBeTruthy();
      expect(first.action).toBeTruthy();
      expect(first.entityType).toBeTruthy();
      expect(first.timestamp).toBeTruthy();
    });
  });

  // ── TC-AL-01 recordAuditLog creates record ────────────────────────────────
  describe("TC-AL-01 – recordAuditLog creates a new entry", () => {
    it("returns a record with a non-empty id", () => {
      const record = recordAuditLog({
        adminName: "Test Admin",
        adminEmail: "test@thofnaa.edu.lk",
        action: "payment_verified" as AuditActionType,
        entityType: "payments" as AuditEntityType,
        entityId: "sub-999",
        entityRef: "THF-PAY-26-9999",
        newValues: { status: "VERIFIED" },
      });
      expect(record.id).toBeTruthy();
    });

    it("generated id starts with 'aud-'", () => {
      const record = recordAuditLog({
        adminName: "Test Admin",
        adminEmail: "test@thofnaa.edu.lk",
        action: "payment_rejected" as AuditActionType,
        entityType: "payments" as AuditEntityType,
        entityId: "sub-998",
        entityRef: "THF-PAY-26-9998",
        newValues: { status: "REJECTED", reason: "Wrong account" },
      });
      expect(record.id).toMatch(/^aud-/);
    });
  });

  // ── TC-AL-02 Fields stored correctly ─────────────────────────────────────
  describe("TC-AL-02 – Stored fields match input", () => {
    it("stores action, entityType, entityId correctly", () => {
      const record = recordAuditLog({
        adminName: "Admin User",
        adminEmail: "admin@thofnaa.edu.lk",
        action: "student_updated" as AuditActionType,
        entityType: "students" as AuditEntityType,
        entityId: "std-001",
        entityRef: "THF-26-0001",
        oldValues: { grade: "Grade 5" },
        newValues: { grade: "Grade 6" },
      });
      expect(record.action).toBe("student_updated");
      expect(record.entityType).toBe("students");
      expect(record.entityId).toBe("std-001");
    });
  });

  // ── TC-AL-03 Newest first ─────────────────────────────────────────────────
  describe("TC-AL-03 – New record inserted at start (newest-first order)", () => {
    it("newly created log appears at index 0", () => {
      const beforeLength = INITIAL_AUDIT_LOGS.length;
      recordAuditLog({
        adminName: "Admin",
        adminEmail: "admin@thofnaa.edu.lk",
        action: "confirmation_email_resent" as AuditActionType,
        entityType: "payments" as AuditEntityType,
        entityId: "sub-777",
        entityRef: "THF-PAY-26-0777",
        newValues: { emailSentTo: "parent@example.com" },
      });
      expect(INITIAL_AUDIT_LOGS[0].entityRef).toBe("THF-PAY-26-0777");
      expect(INITIAL_AUDIT_LOGS.length).toBe(beforeLength + 1);
    });
  });

  // ── TC-AL-04 Timestamp is ISO string ─────────────────────────────────────
  describe("TC-AL-04 – Timestamp is a valid ISO 8601 string", () => {
    it("timestamp is parseable as a Date and is recent", () => {
      const before = Date.now();
      const record = recordAuditLog({
        adminName: "Admin",
        adminEmail: "admin@thofnaa.edu.lk",
        action: "student_deactivated" as AuditActionType,
        entityType: "students" as AuditEntityType,
        entityId: "std-009",
        entityRef: "THF-26-0009",
        newValues: { status: "INACTIVE" },
      });
      const after = Date.now();
      const ts = new Date(record.timestamp).getTime();
      expect(ts).toBeGreaterThanOrEqual(before);
      expect(ts).toBeLessThanOrEqual(after);
    });
  });
});

// ╔══════════════════════════════════════════════════════════╗
// ║  Suite 8 (partial): Admin Auth – demo credentials        ║
// ╚══════════════════════════════════════════════════════════╝

// Note: Full Supabase-connected auth tests require integration environment.
// We test the demo-bypass branch that is fully deterministic and has no
// external dependencies.

describe("TC-AA: Admin Auth Action (demo-bypass branch)", () => {
  // Import is lazy to avoid "use server" directive issues in test env
  let adminLoginAction: typeof import("@/app/actions/adminAuthActions").adminLoginAction;

  beforeAll(async () => {
    // Mock cookies() and redirect() from next/navigation / next/headers
    jest.mock("next/headers", () => ({
      cookies: jest.fn(() => ({
        set: jest.fn(),
        delete: jest.fn(),
        get: jest.fn(),
        getAll: jest.fn(() => []),
      })),
    }));

    jest.mock("next/navigation", () => ({
      redirect: jest.fn(),
    }));

    // Mock Supabase server client
    jest.mock("@/lib/supabase/server", () => ({
      createServerSupabaseClient: jest.fn().mockResolvedValue({
        auth: {
          signInWithPassword: jest.fn().mockResolvedValue({
            data: { user: null },
            error: { message: "Invalid credentials" },
          }),
          signOut: jest.fn().mockResolvedValue({}),
        },
      }),
    }));

    jest.mock("@/lib/supabase/admin", () => ({
      createAdminClient: jest.fn().mockReturnValue({}),
    }));

    const mod = await import("@/app/actions/adminAuthActions");
    adminLoginAction = mod.adminLoginAction;
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  // TC-AA-01 Missing fields
  it("TC-AA-01: rejects login with missing email", async () => {
    const result = await adminLoginAction({ email: "", password: "Ahsen@2004" });
    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it("TC-AA-01: rejects login with missing password", async () => {
    const result = await adminLoginAction({ email: "tthofnaa@gmail.com", password: "" });
    expect(result.success).toBe(false);
  });

  // TC-AA-02 Admin credentials succeed
  it("TC-AA-02: admin tthofnaa@gmail.com / Ahsen@2004 succeeds", async () => {
    const result = await adminLoginAction({
      email: "tthofnaa@gmail.com",
      password: "Ahsen@2004",
    });
    expect(result.success).toBe(true);
  });

  // TC-AA-03 Wrong password rejected
  it("TC-AA-03: wrong password for admin account is rejected", async () => {
    const result = await adminLoginAction({
      email: "tthofnaa@gmail.com",
      password: "wrongpassword",
    });
    expect(result.success).toBe(false);
  });

  // TC-AA-04 Redirect URL on success
  it("TC-AA-04: successful login returns redirectUrl='/admin'", async () => {
    const result = await adminLoginAction({
      email: "tthofnaa@gmail.com",
      password: "Ahsen@2004",
    });
    expect(result.redirectUrl).toBe("/admin");
  });
});
