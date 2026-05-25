// app / patient / profile / page.tsx;

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PatientProfileForm from "@/components/auth/PatientProfileForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Profile" };

export default async function PatientProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [profileRes, patientRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("patient_profiles").select("*").eq("id", user.id).single(),
  ]);

  if (!profileRes.data) redirect("/auth/login");

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your personal information
        </p>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 px-6 py-6 shadow-sm">
        <PatientProfileForm
          profile={profileRes.data}
          patientProfile={patientRes.data}
        />
      </div>
    </div>
  );
}
