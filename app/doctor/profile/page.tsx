// app / doctor / profile / page.tsx;

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DoctorProfileForm from "@/components/auth/DoctorProfileForm";
import { DOCTOR_CODE_PREFIX } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Profile" };

export default async function DoctorProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [profileRes, doctorRes, verificationRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("doctor_profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("doctor_verifications")
      .select("*")
      .eq("doctor_id", user.id)
      .order("submitted_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (!profileRes.data || !doctorRes.data) redirect("/auth/login");

  const doctorCode = `${DOCTOR_CODE_PREFIX}${doctorRes.data.doctor_code}`;

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your professional information
        </p>
      </div>

      {/* DR- code display — read only */}
      <div
        className="bg-white rounded-xl border border-gray-100 px-6 py-4
                      flex items-center justify-between"
      >
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Your Doctor ID
          </p>
          <p className="text-xl font-bold font-mono tracking-widest text-gray-900">
            {doctorCode}
          </p>
        </div>
        {doctorRes.data.is_verified && (
          <span
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50
                           text-green-700 rounded-full text-xs font-medium"
          >
            ✓ Verified
          </span>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 px-6 py-6">
        <DoctorProfileForm
          profile={profileRes.data}
          doctorProfile={doctorRes.data}
          verification={verificationRes.data}
        />
      </div>
    </div>
  );
}
