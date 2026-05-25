import { createBrowserClient } from "@supabase/ssr";

// This client runs in the BROWSER only.
// Use this inside React client components (files with 'use client' at top).
// It uses the ANON key — safe to expose, RLS controls access.
// Never use this in API routes or server components.

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
