import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DoctorShell from "@/components/layout/DoctorShell";

// Server component layout — just renders the shell.
// State management lives in DoctorShell (client component).
// Server component layout — fetches user data and passes to shell.
export default async function DoctorLayout({
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
    <DoctorShell
      userName={displayName}
      userEmail={profile?.email ?? ""}
      avatarUrl={profile?.avatar_url ?? null}
    >
      {children}
    </DoctorShell>
  );
}
