import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { Database } from "@/types/database.types";

/**
 * STRICTLY SERVER-ONLY SUPABASE ADMIN CLIENT.
 * Uses SUPABASE_SERVICE_ROLE_KEY to bypass Row Level Security.
 * 
 * NEVER expose or import this file in Client Components ('use client').
 */
export function createAdminClient() {
  if (typeof window !== "undefined") {
    throw new Error(
      "FATAL SECURITY FAILURE: createAdminClient() was called in a browser client environment! Service role keys must NEVER be instantiated on the client."
    );
  }

  if (!env.supabase.serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY environment variable on server."
    );
  }

  return createClient<Database>(
    env.supabase.url,
    env.supabase.serviceRoleKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}
