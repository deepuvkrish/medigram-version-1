import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// ============================================================
// MEDGRAM — Middleware
// Runs before EVERY page request. Handles:
//   1. Session refresh (keeps auth cookies valid)
//   2. Route protection (redirects unauthenticated users)
//   3. Role enforcement (patients can't access doctor routes)
//   4. Auth page bypass (logged-in users skip login/signup)
// ============================================================

// Routes that anyone can visit without being logged in.
const PUBLIC_ROUTES = [
  "/",
  "/auth/login",
  "/auth/signup/patient",
  "/auth/signup/doctor",
  "/auth/verify-email",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/callback",
];

// Routes only for logged-in patients.
const PATIENT_ROUTES = "/patient";

// Routes only for logged-in doctors.
const DOCTOR_ROUTES = "/doctor";

export async function proxy(request: NextRequest) {
  // We need a mutable response so Supabase can set/refresh
  // session cookies on it before it's sent to the browser.
  let supabaseResponse = NextResponse.next({
    request,
  });

  // Create a server Supabase client that can read and write
  // cookies on this specific request/response pair.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Write cookies to both the request and response.
          // Request: so later middleware/server code sees them.
          // Response: so the browser stores the refreshed session.
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: getUser() refreshes the session token if it has
  // expired. This must be called on every request — if you skip
  // it, sessions expire and users get randomly logged out.
  // Do NOT use getSession() here — it doesn't validate the token
  // with Supabase's server and can be spoofed.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // ── 1. Let public routes through unconditionally ───────────
  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith("/auth/callback"),
  );

  if (isPublicRoute) {
    // If user is already logged in and tries to visit a login
    // or signup page, redirect them to their dashboard.
    // No point showing login to someone already authenticated.
    if (
      user &&
      (pathname.startsWith("/auth/login") ||
        pathname.startsWith("/auth/signup"))
    ) {
      const role = user.user_metadata?.role as string | undefined;

      const dashboardUrl =
        role === "doctor"
          ? new URL("/doctor/dashboard", request.url)
          : new URL("/patient/dashboard", request.url);

      return NextResponse.redirect(dashboardUrl);
    }

    return supabaseResponse;
  }

  // ── 2. All other routes require authentication ──────────────
  if (!user) {
    // Not logged in. Redirect to login.
    // Save the page they were trying to visit so we can
    // send them back there after successful login.
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── 3. Role enforcement ─────────────────────────────────────
  const role = user.user_metadata?.role as string | undefined;

  // Patient trying to access doctor routes → redirect to patient dashboard
  if (pathname.startsWith(DOCTOR_ROUTES) && role !== "doctor") {
    return NextResponse.redirect(new URL("/patient/dashboard", request.url));
  }

  // Doctor trying to access patient routes → redirect to doctor dashboard
  if (pathname.startsWith(PATIENT_ROUTES) && role !== "patient") {
    return NextResponse.redirect(new URL("/doctor/dashboard", request.url));
  }

  // ── 4. All checks passed — let the request through ──────────
  return supabaseResponse;
}

// Tell Next.js which routes this middleware should run on.
// We exclude static files, images, and Next.js internals
// because running auth checks on every image request is wasteful.
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
