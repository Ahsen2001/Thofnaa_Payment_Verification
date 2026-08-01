import { createBrowserClient } from "@supabase/ssr";
import { clientEnv } from "@/lib/env";
import { Database } from "@/types/database.types";

/**
 * Creates a browser-side Supabase client instance.
 * Used exclusively in Client Components ('use client').
 * Employs the public anon key only — service role key is NEVER used here.
 *
 * The security guard against NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY leaks
 * is enforced at module load time in src/lib/env.ts (assertServiceKeyNotPublic).
 */
export function createClient() {
  return createBrowserClient<Database>(
    clientEnv.supabase.url,
    clientEnv.supabase.anonKey
  );
}
