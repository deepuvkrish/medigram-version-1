import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// This client runs on the SERVER only.
// Use this in:
//   - Server components (default in Next.js App Router)
//   - API route handlers (app/api/.../route.ts)
//   - middleware.ts
//
// It reads the user session from HTTP cookies.
// Still uses the ANON key — RLS still applies.
// Never import this in a client component (use client.ts instead).

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // setAll can be called from a Server Component where
            // cookies cannot be set. Safe to ignore — middleware
            // handles session refresh in those cases.
          }
        },
      },
    },
  );
}
