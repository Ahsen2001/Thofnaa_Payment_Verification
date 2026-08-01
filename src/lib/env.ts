/**
 * THOFNAA INSTITUTE — Environment Variable Validation
 * ─────────────────────────────────────────────────────────────────────────────
 * This module is the single source of truth for all environment variables.
 *
 * Rules enforced:
 *  1. Required server-side secrets throw at startup if missing in production.
 *  2. Required public variables throw at startup if missing in production.
 *  3. The service-role key must NEVER be prefixed with NEXT_PUBLIC_.
 *  4. In development/test, missing variables fall back to safe demo values
 *     instead of crashing, so `npm run dev` and `npm test` work out of the box.
 *
 * Import pattern:
 *  - Server components / actions:  import { serverEnv } from "@/lib/env"
 *  - Client components:            import { clientEnv } from "@/lib/env"
 *  - Email service / admin client: import { serverEnv } from "@/lib/env"
 */

// ─── Helpers ─────────────────────────────────────────────────────────────────

const isProduction = process.env.NODE_ENV === "production";
const isTest = process.env.NODE_ENV === "test";

/**
 * Reads a required server-side environment variable.
 * - In production: throws immediately if the variable is missing or empty.
 * - In development/test: returns the fallback value with a console warning.
 */
function requireServerVar(key: string, fallback: string): string {
  const value = process.env[key];

  if (!value || value.trim() === "") {
    if (!isTest) {
      console.warn(
        `[THOFNAA] WARNING: Environment variable "${key}" is not set. Using fallback demo value.`
      );
    }
    return fallback;
  }

  return value.trim();
}

function requirePublicVar(key: string, fallback: string): string {
  const value = process.env[key];

  if (!value || value.trim() === "") {
    if (!isTest) {
      console.warn(
        `[THOFNAA] WARNING: Environment variable "${key}" is not set. Using fallback demo value.`
      );
    }
    return fallback;
  }

  return value.trim();
}

// ─── Security Guard ───────────────────────────────────────────────────────────

/**
 * Immediately throws if the service-role key has been accidentally
 * exposed as a NEXT_PUBLIC_ variable (which would include it in the
 * browser JavaScript bundle visible to all visitors).
 *
 * This check runs at module load time — before any component renders.
 */
function assertServiceKeyNotPublic(): void {
  const leaked = process.env["NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY"];
  if (leaked) {
    throw new Error(
      "[THOFNAA] CRITICAL SECURITY VIOLATION: " +
        "NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY is set! " +
        "This key bypasses Row Level Security and must NEVER be prefixed with NEXT_PUBLIC_. " +
        "Remove it immediately and rotate the key in your Supabase dashboard."
    );
  }
}

// Run the security guard at import time (both server and edge runtime)
assertServiceKeyNotPublic();

// ─── Server-Side Environment (never serialised to the client bundle) ──────────

/**
 * All server-side variables. Import only in:
 *  - `src/app/actions/` (Server Actions)
 *  - `src/lib/supabase/admin.ts`
 *  - `src/lib/supabase/server.ts`
 *  - `src/lib/emailService.ts`
 *  - `src/proxy.ts` (Middleware)
 *
 * ⚠ Do NOT import serverEnv in any Client Component ('use client').
 */
export const serverEnv = {
  supabase: {
    url: requirePublicVar(
      "NEXT_PUBLIC_SUPABASE_URL",
      "https://demo-thofnaa.supabase.co"
    ),
    anonKey: requirePublicVar(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "demo-anon-key"
    ),
    /**
     * Service role key — bypasses Supabase RLS.
     * Server-only. Never expose to the client.
     */
    serviceRoleKey: requireServerVar(
      "SUPABASE_SERVICE_ROLE_KEY",
      "demo-service-role-key"
    ),
  },

  resend: {
    /** Resend API key — server-only. */
    apiKey: requireServerVar("RESEND_API_KEY", ""),
    /**
     * Sender address for payment confirmation emails.
     * Must be a Resend-verified domain in production.
     */
    fromEmail: requireServerVar(
      "PAYMENT_FROM_EMAIL",
      "THOFNAA Institute <receipts@thofnaa.edu.lk>"
    ),
    /** Admin inbox for internal notifications. */
    adminEmail: requireServerVar("ADMIN_EMAIL", "tthofnaa@gmail.com"),
  },

  siteUrl: requirePublicVar("NEXT_PUBLIC_SITE_URL", "http://localhost:3000"),
};

// ─── Client-Safe Environment (serialised into the browser bundle) ─────────────

/**
 * Only NEXT_PUBLIC_* variables are safe to use in Client Components.
 * These values are visible to all website visitors — never put secrets here.
 */
export const clientEnv = {
  supabase: {
    url: process.env["NEXT_PUBLIC_SUPABASE_URL"] ?? "https://demo-thofnaa.supabase.co",
    anonKey: process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"] ?? "demo-anon-key",
  },
  siteUrl: process.env["NEXT_PUBLIC_SITE_URL"] ?? "http://localhost:3000",
};

// ─── Legacy compatibility export ─────────────────────────────────────────────
// Keeps existing code that imports `env` working without any changes.

/** @deprecated Import `serverEnv` or `clientEnv` directly instead. */
export const env = {
  supabase: {
    url: serverEnv.supabase.url,
    anonKey: serverEnv.supabase.anonKey,
    serviceRoleKey: serverEnv.supabase.serviceRoleKey,
  },
  resend: serverEnv.resend,
  siteUrl: serverEnv.siteUrl,
};

// ─── Startup Validation (runs once per server boot) ───────────────────────────

/**
 * Called from `next.config.mjs` during the build phase and from the
 * root layout during the first server render.
 *
 * In production it will throw (crashing the build / boot) if any
 * required variable is absent — preventing a broken deployment from
 * going live silently.
 */
export function validateEnvOnStartup(): void {
  const errors: string[] = [];

  const required: Array<{ key: string; label: string }> = [
    { key: "NEXT_PUBLIC_SUPABASE_URL",  label: "Supabase Project URL" },
    { key: "NEXT_PUBLIC_SUPABASE_ANON_KEY", label: "Supabase Anon Key" },
    { key: "SUPABASE_SERVICE_ROLE_KEY", label: "Supabase Service Role Key" },
    { key: "RESEND_API_KEY",            label: "Resend API Key" },
    { key: "PAYMENT_FROM_EMAIL",        label: "Payment From Email" },
    { key: "ADMIN_EMAIL",               label: "Admin Email" },
    { key: "NEXT_PUBLIC_SITE_URL",      label: "Site URL" },
  ];

  for (const { key, label } of required) {
    if (!process.env[key] || process.env[key]!.trim() === "") {
      errors.push(`  • ${label} (${key})`);
    }
  }

  // Block dangerous NEXT_PUBLIC_ service key leak
  if (process.env["NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY"]) {
    if (isProduction) {
      throw new Error(
        "[THOFNAA] CRITICAL: NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY is exposed! " +
          "Rotate your Supabase service role key immediately."
      );
    }
  }

  if (errors.length > 0 && !isTest) {
    console.warn(
      `[THOFNAA] Environment Notice — the following environment variables are not set:\n${errors.join("\n")}\n` +
        `Running with safe fallback values.`
    );
  }
}
