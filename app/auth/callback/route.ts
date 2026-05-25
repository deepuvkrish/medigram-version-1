import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ============================================================
// /auth/callback — Supabase email verification handler
//
// Flow:
//   1. User clicks verification link in email
//   2. Supabase redirects to this URL with ?code=xxxx
//   3. We exchange the code for a session (sets auth cookies)
//   4. We read the user's role and redirect to their dashboard
//
// This route must exist — without it, email verification breaks.
// ============================================================

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();

    // exchangeCodeForSession exchanges the one-time code from
    // the email link for a proper session with cookies.
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const role = data.user.user_metadata?.role as string | undefined;

      // Redirect to the correct dashboard based on role.
      const dashboard =
        role === "doctor" ? "/doctor/dashboard" : "/patient/dashboard";

      return NextResponse.redirect(new URL(dashboard, origin));
    }
  }

  // If code is missing or exchange failed, redirect to login
  // with an error message in the URL.
  return NextResponse.redirect(
    new URL("/auth/login?error=verification_failed", origin),
  );
}
