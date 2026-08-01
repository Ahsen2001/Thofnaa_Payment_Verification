"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface AdminLoginInput {
  email: string;
  password: string;
}

export interface AdminLoginResult {
  success: boolean;
  redirectUrl?: string;
  error?: string;
}

/**
 * Server Action: Authenticate Admin with Supabase Auth & Active Profile Verification
 */
export async function adminLoginAction(input: AdminLoginInput): Promise<AdminLoginResult> {
  try {
    if (!input.email || !input.password) {
      return { success: false, error: "Please enter both email address and password." };
    }

    const emailClean = input.email.trim().toLowerCase();
    const cookieStore = await cookies();

    // Check fallback demo admin bypass for local testing
    const isDemoAccount = emailClean === "admin@thofnaa.edu.lk" && input.password === "admin123";
    if (isDemoAccount) {
      cookieStore.set("thofnaa_admin_session", "demo-token", {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return {
        success: true,
        redirectUrl: "/admin",
      };
    }

    const supabaseServer = await createServerSupabaseClient();

    // 1. Authenticate credentials via Supabase Auth
    const { data: authData, error: authError } = await supabaseServer.auth.signInWithPassword({
      email: emailClean,
      password: input.password,
    });

    if (authError || !authData.user) {
      return {
        success: false,
        error: "Invalid email address or password. Please verify your administrator credentials.",
      };
    }

    // 2. Server-side Authorization Check: Verify admin_profiles.active = true
    const { data: adminProfile, error: profileError } = await (supabaseServer
      .from("admin_profiles") as any)
      .select("active, name, role")
      .eq("user_id", authData.user.id)
      .single();

    if (profileError || !adminProfile || !adminProfile.active) {
      // Sign out immediately if user is inactive
      await supabaseServer.auth.signOut();
      return {
        success: false,
        error: "Access Denied: Your administrator account is inactive or pending approval. Contact THOFNAA Super Admin.",
      };
    }

    cookieStore.set("thofnaa_admin_session", "active-admin-token", {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
    });

    return {
      success: true,
      redirectUrl: "/admin",
    };
  } catch (err) {
    console.error("Admin Login Server Action Error:", err);
    return {
      success: false,
      error: "An unexpected server error occurred during login. Please try again.",
    };
  }
}

/**
 * Server Action: Logout Admin User & Clear Supabase Auth Cookies
 */
export async function adminLogoutAction() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("thofnaa_admin_session");

    const supabaseServer = await createServerSupabaseClient();
    await supabaseServer.auth.signOut();
  } catch (err) {
    console.error("Admin Logout Error:", err);
  }
  redirect("/admin/login");
}
