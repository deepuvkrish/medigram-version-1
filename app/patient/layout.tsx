import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PatientShell from "@/components/layout/PatientShell";

// Server component layout — just renders the shell.
// State management lives in PatientShell (client component).
// Server component layout — fetches user data and passes to shell.

export default async function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, email, avatar_url")
    .eq("id", user.id)
    .single();

  const displayName =
    [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
    "My Account";

  return (
    <PatientShell
      userName={displayName}
      userEmail={profile?.email ?? ""}
      avatarUrl={profile?.avatar_url ?? null}
    >
      {children}
    </PatientShell>
  );
}
