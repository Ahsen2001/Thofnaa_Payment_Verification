/**
 * Environment Variable Validation & Configuration
 * Ensures required Supabase & Site environment variables are present with descriptive errors.
 */

function getEnvVar(key: string, isRequired = true): string {
  const value = process.env[key];
  if (isRequired && !value) {
    throw new Error(
      `❌ Missing required environment variable: "${key}". Please check your .env.local file.`
    );
  }
  return value || "";
}

export const env = {
  supabase: {
    url: getEnvVar("NEXT_PUBLIC_SUPABASE_URL", true),
    anonKey: getEnvVar("NEXT_PUBLIC_SUPABASE_ANON_KEY", true),
    // Service role key must NEVER be prefixed with NEXT_PUBLIC_
    serviceRoleKey: getEnvVar("SUPABASE_SERVICE_ROLE_KEY", false),
  },
  siteUrl: getEnvVar("NEXT_PUBLIC_SITE_URL", false) || "http://localhost:3000",
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
