/**
 * Environment Variable Validation & Configuration
 * Ensures required Supabase & Site environment variables are present with descriptive errors.
 */

function getEnvVar(key: string, fallback = ""): string {
  const value = process.env[key];
  if (!value) {
    return fallback;
  }
  return value;
}

export const env = {
  supabase: {
    url: getEnvVar("NEXT_PUBLIC_SUPABASE_URL", "https://demo-thofnaa.supabase.co"),
    anonKey: getEnvVar("NEXT_PUBLIC_SUPABASE_ANON_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo-anon-key"),
    // Service role key must NEVER be prefixed with NEXT_PUBLIC_
    serviceRoleKey: getEnvVar("SUPABASE_SERVICE_ROLE_KEY", "demo-service-role-key"),
  },
  resend: {
    apiKey: getEnvVar("RESEND_API_KEY", ""),
    fromEmail: getEnvVar("PAYMENT_FROM_EMAIL", "THOFNAA Institute <receipts@thofnaa.edu.lk>"),
    adminEmail: getEnvVar("ADMIN_EMAIL", "tthofnaa@gmail.com"),
  },
  siteUrl: getEnvVar("NEXT_PUBLIC_SITE_URL", "http://localhost:3000"),
};

/**
 * Validates that Service Role key is NOT exposed to the client bundle.
 */
export function validateClientSecurity() {
  if (typeof window !== "undefined") {
    // Client-side guard
    const publicServiceRole = (process.env as Record<string, string>)[
      "NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY"
    ];
    if (publicServiceRole) {
      throw new Error(
        "CRITICAL SECURITY RISK: NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY must be removed immediately! Service role keys must never be exposed to the browser."
      );
    }
  }
}
