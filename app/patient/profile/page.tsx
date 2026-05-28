// app/patient/profile/page.tsx;

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PatientProfileForm from "@/components/auth/PatientProfileForm";
import type { Metadata } from "next";
import Image from "next/image";
import { AtSign, MapPin, Phone } from "lucide-react";
import CopyCodeButton from "@/components/ui/CopyCodeButton";

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
  const avatarURL = `${profileRes.data.avatar_url}`;
  const Name = `${profileRes.data.first_name}`;
  const LName = `${profileRes.data.last_name}`;
  const PhoneNum = `${profileRes.data.phone}`;
  const City = `${profileRes.data.city}`;
  const Emails = `${profileRes.data.email}`;
  const PCode = `${patientRes.data.patient_code}`;

  return (
    <div className="flex flex-col gap-4 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-500 md:text-gray-900 md:dark:text-gray-200">
          Profile
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your personal information
        </p>
      </div>

      <div className="bg-(--mobileDarkSide) sm:bg-(--mobileDarkSideMobile) rounded-xl border border-gray-100 sm:border-gray-200 md:dark:border-gray-800 px-6 py-4 flex items-center w-full h-auto md:h-35">
        <div className="w-fit">
          <Image
            src={
              avatarURL && avatarURL !== "null"
                ? avatarURL
                : "/images/icons/user3.svg"
            }
            alt="Profile Picture"
            className="w-20 h-30 object-contain rounded-xl"
            width={100}
            height={100}
            unoptimized
          />
        </div>
        <div className="w-fit px-2 flex flex-col">
          <div className="flex items-center">
            <span className="font-bold font-mono text-xl uppercase text-gray-200 md:text-gray-800 md:dark:text-gray-300">
              {Name} {LName}
            </span>
          </div>
          <span className="flex items-center text-gray-500">
            <AtSign className="mr-1 w-3 h-4" /> {Emails}
          </span>
        </div>
        <div className="w-fit px-2 flex flex-col ml-0 md:ml-10">
          <div className="flex items-center text-gray-500 md:text-blue-800 md:dark:text-blue-200">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="text-sm capitalize">{City}</span>
          </div>
          <div className="flex items-center text-gray-500 md:text-gray-500 md:dark:text-gray-400">
            <Phone className="h-4 w-4 mr-1" />
            <span className="text-sm capitalize">
              {PhoneNum && PhoneNum !== "null" ? (
                <span>{PhoneNum}</span>
              ) : (
                <span className="text-gray-400 dark:md:text-gray-600">
                  Update Phone Number
                </span>
              )}
            </span>
          </div>
        </div>
        <div className="w-fit ml-20 px-2 ">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            HEAL ID
          </p>
          <span className="flex items-center text-xl font-bold font-mono tracking-widest text-gray-500 md:text-gray-900 md:dark:text-blue-400/50 ">
            {PCode}
            <CopyCodeButton code={PCode} />
          </span>
          <p className="text-xs text-gray-400 mt-1.5">
            Share this ID with doctors/others so they can find you to send
            request.
          </p>
        </div>
      </div>

      <div className="bg-(--mobileDarkSide) sm:bg-(--mobileDarkSideMobile) rounded-xl border border-gray-100 md:border-gray-200 md:dark:border-gray-800 px-6 py-6 shadow-sm">
        <PatientProfileForm
          profile={profileRes.data}
          patientProfile={patientRes.data}
        />
      </div>
    </div>
  );
}
