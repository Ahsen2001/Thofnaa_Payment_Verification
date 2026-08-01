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
    console.warn("createAdminClient called in browser client environment; using fallback client.");
    return createClient<Database>(
      env.supabase.url,
      env.supabase.anonKey,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );
  }

  const key = env.supabase.serviceRoleKey || env.supabase.anonKey;
  return createClient<Database>(
    env.supabase.url,
    key,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}
