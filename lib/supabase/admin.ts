import { createClient } from "@supabase/supabase-js";

// This client uses the SERVICE ROLE KEY.
// It BYPASSES Row Level Security entirely.
//
// Use this ONLY in:
//   - app/api/.../route.ts (server-side API routes)
//
// NEVER use this in:
//   - Client components
//   - Server components that render pages
//   - Any file imported by the browser
//
// If this key leaks to the browser, anyone can read and write
// every row in your database with no restrictions.
// The SERVICE_ROLE_KEY env var has no NEXT_PUBLIC_ prefix
// specifically to prevent Next.js from bundling it for the browser.

export const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      // Admin client should not manage sessions.
      // It acts as the database owner, not as any specific user.
    },
  },
);
