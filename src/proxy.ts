import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { Database } from "@/types/database.types";

/**
 * SECURE SERVER-SIDE MIDDLEWARE FOR THOFNAA ADMIN AUTHENTICATION & AUTHORIZATION
 * 
 * Rules:
 * 1. Unauthenticated users accessing /admin/* (except /admin/login) are redirected to /admin/login.
 * 2. Authenticated users WITHOUT active admin profile (admin_profiles.active = true) receive Access Denied.
 * 3. Handles Supabase Auth cookie session refreshing automatically.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /admin routes (except /admin/login and static assets)
  if (!pathname.startsWith("/admin") || pathname === "/admin/login" || pathname === "/admin/unauthorized") {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Fallback demo mode check if Supabase environment variables are missing during local development
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes("your-supabase")) {
    return NextResponse.next();
  }

  try {
    const supabase = createServerClient<Database>(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value);
            });
            response = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    // 0. Verify Admin Session Cookie & Supabase Auth User
    const adminSessionCookie = request.cookies.get("thofnaa_admin_session")?.value;
    
    // In production, strictly enforce Supabase Auth session verification
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    // Allow demo session bypass ONLY if development environment or valid active session token matching authenticated session
    const isValidDemoSession = process.env.NODE_ENV !== "production" && adminSessionCookie === "demo-token";
    const isAuthenticatedUser = !!user && !authError;

    if (!isAuthenticatedUser && !isValidDemoSession) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Bypass profile lookup if demo session in non-production
    if (isValidDemoSession) {
      return response;
    }

    // 3. Server-side Authorization Check: Check admin_profiles.active === true
    if (!user) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const { data: adminProfile, error: profileError } = await (supabase
      .from("admin_profiles") as any)
      .select("active, role")
      .eq("user_id", user.id)
      .single();

    if (profileError || !adminProfile || !adminProfile.active) {
      // Authenticated user exists but is NOT an active admin -> Redirect to Access Denied page
      const unauthorizedUrl = new URL("/admin/unauthorized", request.url);
      return NextResponse.redirect(unauthorizedUrl);
    }

    // 4. User is fully authenticated & active admin -> Proceed to route
    return response;
  } catch (err) {
    console.error("Middleware Auth Execution Error:", err);
    // On unexpected middleware error, redirect safely to login
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    "/admin/:path*",
  ],
};
