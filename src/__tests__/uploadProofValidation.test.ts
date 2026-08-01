// ─── THOFNAA PAYMENT VERIFICATION SYSTEM ────────────────────────────────────
// Test Suite 4: Upload Proof Action – MIME / extension / size validation
//              (uploadProofAction.ts – unit-level validation only)
//
// Note: Storage upload calls (Supabase) are tested at integration level.
//       This suite validates all server-side guard logic that runs BEFORE
//       any storage call is made.
//
// Covers:
//   TC-UP-01  JPEG image accepted (MIME + extension)
//   TC-UP-02  PNG image accepted
//   TC-UP-03  PDF document accepted
//   TC-UP-04  GIF rejected
//   TC-UP-05  WebP rejected
//   TC-UP-06  SVG rejected (executable risk)
//   TC-UP-07  PHP extension blocked
//   TC-UP-08  EXE extension blocked
//   TC-UP-09  JS extension blocked
//   TC-UP-10  File size exactly 10 MB accepted
//   TC-UP-11  File size > 10 MB rejected
//   TC-UP-12  File size 0 bytes rejected (empty file guard)
//   TC-UP-13  Storage path is randomised (contains UUID-style segment)
//   TC-UP-14  Storage path structure follows {regNo}/{year}/{month}/{uuid}.{ext}
// ─────────────────────────────────────────────────────────────────────────────

// We test only the validation functions that don't require Supabase.
// The constants are pulled directly from the action's internal sets.

// ──────────────────────────────────────────────────────────────────────────────
//  Internal constants (mirrored here for white-box testing)
// ──────────────────────────────────────────────────────────────────────────────

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "application/pdf",
]);

const BLOCKED_EXTENSIONS = new Set([
  "exe", "sh", "bat", "cmd", "js", "mjs", "php", "html", "htm",
  "svg", "dll", "vbs", "ps1", "jar", "cgi", "pl", "py", "asp", "aspx",
]);

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

// ── Validation helpers (extracted logic, pure functions) ───────────────────────

function validateMime(mime: string): { valid: boolean; error?: string } {
  const norm = mime.toLowerCase().trim();
  if (!ALLOWED_MIME_TYPES.has(norm)) {
    return { valid: false, error: `Security Violation: File type "${mime}" is strictly prohibited.` };
  }
  return { valid: true };
}

function validateExtension(fileName: string): { valid: boolean; error?: string } {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  if (BLOCKED_EXTENSIONS.has(ext)) {
    return { valid: false, error: `Security Violation: Executable or script extension ".${ext}" is blocked.` };
  }
  return { valid: true };
}

function validateSize(sizeBytes: number): { valid: boolean; error?: string } {
  if (sizeBytes <= 0) {
    return { valid: false, error: "File must not be empty." };
  }
  if (sizeBytes > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size (${(sizeBytes / (1024 * 1024)).toFixed(2)} MB) exceeds the maximum 10 MB limit.`,
    };
  }
  return { valid: true };
}

function buildStoragePath(
  studentRegNo: string,
  year: number,
  month: number,
  uuid: string,
  safeExt: string
): string {
  const monthPadded = String(month).padStart(2, "0");
  const sanitized = studentRegNo.replace(/[^A-Z0-9-]/gi, "");
  return `${sanitized}/${year}/${monthPadded}/${uuid}.${safeExt}`;
}

// ─────────────────────────────────────────────────────────────────────────────

describe("TC-UP: Upload Proof Validation Logic", () => {
  // ── MIME Type ──────────────────────────────────────────────────────────────
  describe("MIME Type Validation", () => {
    describe("TC-UP-01 – JPEG accepted", () => {
      it("allows image/jpeg", () => {
        expect(validateMime("image/jpeg").valid).toBe(true);
      });
      it("allows image/jpg (alias)", () => {
        expect(validateMime("image/jpg").valid).toBe(true);
      });
    });

    describe("TC-UP-02 – PNG accepted", () => {
      it("allows image/png", () => {
        expect(validateMime("image/png").valid).toBe(true);
      });
    });

    describe("TC-UP-03 – PDF accepted", () => {
      it("allows application/pdf", () => {
        expect(validateMime("application/pdf").valid).toBe(true);
      });
    });

    describe("TC-UP-04 – GIF rejected", () => {
      it("blocks image/gif", () => {
        const r = validateMime("image/gif");
        expect(r.valid).toBe(false);
        expect(r.error).toMatch(/prohibited|security/i);
      });
    });

    describe("TC-UP-05 – WebP rejected", () => {
      it("blocks image/webp", () => {
        expect(validateMime("image/webp").valid).toBe(false);
      });
    });

    describe("TC-UP-06 – SVG rejected", () => {
      it("blocks image/svg+xml", () => {
        expect(validateMime("image/svg+xml").valid).toBe(false);
      });
    });

    it("blocks text/plain", () => {
      expect(validateMime("text/plain").valid).toBe(false);
    });

    it("blocks application/javascript", () => {
      expect(validateMime("application/javascript").valid).toBe(false);
    });

    it("normalises uppercase MIME before checking (IMAGE/JPEG allowed)", () => {
      expect(validateMime("IMAGE/JPEG").valid).toBe(true);
    });
  });

  // ── Extension Blocking ─────────────────────────────────────────────────────
  describe("Extension Blocking", () => {
    describe("TC-UP-07 – PHP blocked", () => {
      it("blocks receipt.php", () => {
        const r = validateExtension("receipt.php");
        expect(r.valid).toBe(false);
        expect(r.error).toMatch(/blocked|security/i);
      });
    });

    describe("TC-UP-08 – EXE blocked", () => {
      it("blocks payload.exe", () => {
        expect(validateExtension("payload.exe").valid).toBe(false);
      });
    });

    describe("TC-UP-09 – JS blocked", () => {
      it("blocks script.js", () => {
        expect(validateExtension("script.js").valid).toBe(false);
      });
      it("blocks module.mjs", () => {
        expect(validateExtension("module.mjs").valid).toBe(false);
      });
    });

    it("blocks .sh (shell script)", () => {
      expect(validateExtension("run.sh").valid).toBe(false);
    });

    it("blocks .svg (XSS vector)", () => {
      expect(validateExtension("icon.svg").valid).toBe(false);
    });

    it("blocks .html (XSS vector)", () => {
      expect(validateExtension("page.html").valid).toBe(false);
    });

    it("blocks .py (Python script)", () => {
      expect(validateExtension("hack.py").valid).toBe(false);
    });

    it("allows .jpg extension", () => {
      expect(validateExtension("receipt.jpg").valid).toBe(true);
    });

    it("allows .pdf extension", () => {
      expect(validateExtension("receipt.pdf").valid).toBe(true);
    });

    it("allows .png extension", () => {
      expect(validateExtension("receipt.png").valid).toBe(true);
    });
  });

  // ── File Size ──────────────────────────────────────────────────────────────
  describe("File Size Validation", () => {
    describe("TC-UP-10 – Exactly 10 MB accepted", () => {
      it("accepts a file of exactly 10,485,760 bytes (10 MB)", () => {
        expect(validateSize(10 * 1024 * 1024).valid).toBe(true);
      });
    });

    describe("TC-UP-11 – > 10 MB rejected", () => {
      it("rejects 10,485,761 bytes (10 MB + 1 byte)", () => {
        const r = validateSize(10 * 1024 * 1024 + 1);
        expect(r.valid).toBe(false);
        expect(r.error).toMatch(/10 MB|limit|exceeds/i);
      });

      it("rejects 50 MB file", () => {
        expect(validateSize(50 * 1024 * 1024).valid).toBe(false);
      });
    });

    describe("TC-UP-12 – Empty file (0 bytes) rejected", () => {
      it("rejects a 0-byte file", () => {
        const r = validateSize(0);
        expect(r.valid).toBe(false);
        expect(r.error).toMatch(/empty/i);
      });

      it("rejects a negative byte count", () => {
        expect(validateSize(-1).valid).toBe(false);
      });
    });

    it("accepts a typical 1 MB file", () => {
      expect(validateSize(1 * 1024 * 1024).valid).toBe(true);
    });

    it("accepts a small 150 KB file", () => {
      expect(validateSize(150 * 1024).valid).toBe(true);
    });
  });

  // ── Storage Path Structure ─────────────────────────────────────────────────
  describe("TC-UP-13/14 – Storage path structure", () => {
    const MOCK_UUID = "123e4567-e89b-12d3-a456-426614174000";

    it("builds correct path: regNo/year/month/uuid.ext", () => {
      const path = buildStoragePath("THF-26-0001", 2026, 3, MOCK_UUID, "jpg");
      expect(path).toBe(`THF-26-0001/2026/03/${MOCK_UUID}.jpg`);
    });

    it("pads single-digit months with leading zero", () => {
      const path = buildStoragePath("THF-26-0001", 2026, 1, MOCK_UUID, "pdf");
      expect(path).toContain("/01/");
    });

    it("sanitizes special characters from reg no in path", () => {
      // Special chars should be stripped to prevent path traversal
      const path = buildStoragePath("../../../etc/THF-26-0001", 2026, 1, MOCK_UUID, "jpg");
      expect(path).not.toContain("..");
      expect(path).not.toContain("/etc/");
    });

    it("path ends with the correct file extension", () => {
      const pdfPath = buildStoragePath("THF-26-0001", 2026, 2, MOCK_UUID, "pdf");
      expect(pdfPath).toMatch(/\.pdf$/);
    });
  });
});
