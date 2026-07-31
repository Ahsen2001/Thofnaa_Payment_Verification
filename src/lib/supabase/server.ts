import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "@/lib/env";
import { Database } from "@/types/database.types";

/**
 * Creates a server-side Supabase client instance.
 * Used in Server Components, Server Actions, and Route Handlers.
 * Automatically manages authentication session cookies.
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    env.supabase.url,
    env.supabase.anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if middleware is refreshing sessions.
          }
        },
      },
    }
  );
}
