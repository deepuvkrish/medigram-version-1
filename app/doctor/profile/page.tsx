//app/doctor/profile/page.tsx;

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DoctorProfileForm from "@/components/auth/DoctorProfileForm";
import { DOCTOR_CODE_PREFIX } from "@/lib/constants";
import type { Metadata } from "next";
import { AtSign } from "lucide-react";
import Image from "next/image";
import CopyCodeButton from "@/components/ui/CopyCodeButton";
import { CiStethoscope } from "react-icons/ci";
import { TbHospital } from "react-icons/tb";

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
  const avatarURL = `${profileRes.data.avatar_url}`;
  const Name = `${profileRes.data.first_name}`;
  const LName = `${profileRes.data.last_name}`;
  const Emails = `${profileRes.data.email}`;
  const Specs = `${doctorRes.data.specialty}`;
  const hName = `${doctorRes.data.hospital_name}`;
  const qualifications: string[] = doctorRes.data.qualifications ?? [];
  // const Verify = `${verificationRes.data.status}`;

  return (
    <div className="flex flex-col gap-4 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-500 md:text-gray-900 md:dark:text-gray-200">
          Profile
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your professional information
        </p>
      </div>

      {/* DR- code display — read only */}
      <div className="bg-(--mobileDarkSide) sm:bg-(--mobileDarkSideMobile) rounded-xl border border-gray-100 sm:border-gray-200 md:dark:border-gray-800 px-6 py-6 flex items-center w-full h-auto md:h-45">
        <div className="w-fit relative">
          <Image
            src={
              avatarURL && avatarURL !== "null"
                ? avatarURL
                : "/images/icons/doctor.svg"
            }
            alt="Profile Picture"
            className="w-20 h-30 object-contain rounded-xl z-1"
            width={100}
            height={100}
            unoptimized
          />
          <CiStethoscope className="bg-(--cornBlue) text-white p-1 rounded-full h-8 w-8 absolute -top-1 -right-1 z-2" />
        </div>

        <div className="w-fit px-2 flex flex-col ml-3">
          <div className="flex items-center">
            <span className="font-bold font-mono text-xl uppercase">
              Dr.{Name} {LName}
            </span>
            <span className="ml-3 text-[12px] bg-blue-200 px-2 py-1 rounded-2xl text-gray-800 font-semibold ">
              {Specs}
            </span>
          </div>
          <span className="flex items-center text-gray-500 text-[12px]">
            {qualifications?.map((item) => (
              <span key={item} className="mr-2 text-xs font-medium ">
                {item}
              </span>
            ))}
          </span>
          <span className="flex items-center text-gray-500 text-[12px] mt-3">
            <TbHospital className="mr-1 w-4 h-4" />
            {hName}
          </span>
          <span className="flex items-center text-gray-500">
            <AtSign className="mr-1 w-4 h-4" /> {Emails}
          </span>
        </div>

        <div className="flex items-baseline h-full mx-3">
          <Image
            src={
              Specs === "Cardiologist"
                ? "/images/icons/heart3.svg"
                : Specs === "Anaesthesiologist"
                  ? "/images/icons/syringe.svg"
                  : Specs === "Dentist"
                    ? "/images/icons/teeth.svg"
                    : Specs === "Dermatologist"
                      ? "/images/icons/skin.svg"
                      : Specs === "Dermatologist"
                        ? "/images/icons/skin.svg"
                        : Specs === "Diabetologist"
                          ? "/images/icons/sugar.svg"
                          : Specs === "Endocrinologist"
                            ? "/images/icons/default.svg"
                            : Specs === "Obstetrics and Gynecology"
                              ? "/images/icons/gyno.svg"
                              : Specs === "Ophthalmologist"
                                ? "/images/icons/eyes.svg"
                                : Specs === "Nephrologist"
                                  ? "/images/icons/kidney.svg"
                                  : Specs === "Neurologist"
                                    ? "/images/icons/brain.svg"
                                    : Specs === "Orthopedics"
                                      ? "/images/icons/ortho.svg"
                                      : Specs === "Gynaecologist"
                                        ? "/images/icons/gyno.svg"
                                        : Specs === "Pulmonologist"
                                          ? "/images/icons/lungs.svg"
                                          : "/images/icons/default.svg"
            }
            alt="Verification Status"
            width={100}
            height={100}
            className="opacity-40"
          />
        </div>
        {/* <div className="flex items-center">
          <Image
            src={
              Verify === "pending"
                ? "/images/icons/shield-pending.svg"
                : Verify === "rejected"
                  ? "/images/icons/shield-verified.svg"
                  : Verify === "verified"
                    ? "/images/icons/shield-verified.svg"
                    : "/images/icons/shield-verified.svg"
            }
            alt="Verification Status"
            width={50}
            height={50}
          />
          <span className="font-medium text-xs text-gray-500 uppercase">
            {Verify === "pending"
              ? "Verification Pending"
              : Verify === "rejected"
                ? "Your Request is Rejected due to errors. Please Try again later."
                : Verify === "verified"
                  ? "You've been succesfully verified."
                  : "Verify here."}
          </span>
        </div> */}
        <div className="w-fit ml-20 px-2 ">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Your Doctor ID
          </p>
          <span className="flex items-center text-xl font-bold font-mono tracking-widest text-gray-500 md:text-gray-900 md:dark:text-blue-400/50 ">
            {doctorCode}
            <CopyCodeButton code={doctorCode} />
          </span>
          <p className="text-xs text-gray-400 mt-1.5">
            Share this ID with patients so they can find and send you their
            records.
          </p>
        </div>
        {doctorRes.data.is_verified && (
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-medium">
            ✓ Verified
          </span>
        )}
      </div>

      <div className="bg-(--mobileDarkSide) sm:bg-(--mobileDarkSideMobile) rounded-xl border border-gray-100 md:border-gray-200 md:dark:border-gray-800 px-6 py-6 shadow-sm">
        <DoctorProfileForm
          profile={profileRes.data}
          doctorProfile={doctorRes.data}
          verification={verificationRes.data}
        />
      </div>
    </div>
  );
}
