import { createBrowserClient } from "@supabase/ssr";
import { env, validateClientSecurity } from "@/lib/env";
import { Database } from "@/types/database.types";

/**
 * Creates a browser-side Supabase client instance.
 * Used exclusively in Client Components ('use client').
 * Employs public anon key only.
 */
export function createClient() {
  validateClientSecurity();
  
  return createBrowserClient<Database>(
    env.supabase.url,
    env.supabase.anonKey
  );
}
