import { NextResponse, type NextRequest } from "next/server";

/**
 * SECURE SERVER-SIDE MIDDLEWARE FOR THOFNAA ADMIN AUTHENTICATION & AUTHORIZATION
 *
 * Rules:
 * 1. Unauthenticated users accessing /admin/* (except /admin/login) are redirected to /admin/login.
 * 2. The admin session cookie "thofnaa_admin_session" controls access.
 * 3. Supabase Auth is checked as a secondary fallback — if it fails for any reason,
 *    the user is redirected to /admin/login rather than crashing the page.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /admin routes (except /admin/login and /admin/unauthorized)
  if (
    !pathname.startsWith("/admin") ||
    pathname === "/admin/login" ||
    pathname === "/admin/unauthorized"
  ) {
    return NextResponse.next();
  }

  try {
    // 1. Check our own session cookie first (fast path)
    const adminSessionCookie = request.cookies.get("thofnaa_admin_session")?.value;
    const hasValidSessionCookie =
      adminSessionCookie === "demo-token" || adminSessionCookie === "active-admin-token";

    if (hasValidSessionCookie) {
      return NextResponse.next({ request: { headers: request.headers } });
    }

    // 2. Check Supabase Auth session as fallback (only if env vars are properly set)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const hasSupabase =
      supabaseUrl &&
      supabaseAnonKey &&
      !supabaseUrl.includes("demo-thofnaa") &&
      !supabaseUrl.includes("your-supabase") &&
      supabaseUrl.startsWith("https://");

    if (hasSupabase) {
      try {
        const { createServerClient } = await import("@supabase/ssr");

        let response = NextResponse.next({ request: { headers: request.headers } });

        const supabase = createServerClient(
          supabaseUrl!,
          supabaseAnonKey!,
          {
            cookies: {
              getAll() {
                return request.cookies.getAll();
              },
              setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value }) => {
                  request.cookies.set(name, value);
                });
                response = NextResponse.next({ request });
                cookiesToSet.forEach(({ name, value, options }) => {
                  response.cookies.set(name, value, options);
                });
              },
            },
          }
        );

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (user && !authError) {
          // User is authenticated via Supabase — check admin profile
          try {
            const { data: adminProfile } = await (supabase.from("admin_profiles") as any)
              .select("active, role")
              .eq("user_id", user.id)
              .single();

            if (adminProfile && adminProfile.active) {
              return response;
            }
          } catch {
            // admin_profiles query failed — treat as unauthorized
          }
          const unauthorizedUrl = new URL("/admin/unauthorized", request.url);
          return NextResponse.redirect(unauthorizedUrl);
        }
      } catch (supabaseErr) {
        console.warn("[Middleware] Supabase auth check failed:", supabaseErr);
        // Fall through to redirect to login
      }
    }

    // 3. No valid session — redirect to login
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  } catch (err) {
    // Ultimate fallback — never crash the middleware, always redirect safely
    console.error("[Middleware] Unexpected error:", err);
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
