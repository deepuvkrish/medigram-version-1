// components / auth / DoctorProfileForm.tsx;
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { doctorProfileSchema, type DoctorProfileData } from "@/lib/validations";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import QualificationsInput from "@/components/ui/QualificationsInput";
import AvatarUpload from "@/components/ui/AvatarUpload";
import type {
  Profile,
  DoctorProfile,
  DoctorVerification,
} from "@/types/database";

// ============================================================
// DoctorProfileForm
// Handles profile updates and MCI verification submission.
// ============================================================

interface Props {
  profile: Profile;
  doctorProfile: DoctorProfile;
  verification: DoctorVerification | null;
}

export default function DoctorProfileForm({
  profile,
  doctorProfile,
  verification,
}: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [qualifications, setQualifications] = useState<string[]>(
    doctorProfile.qualifications ?? [],
  );
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile.avatar_url);
  const [mciNumber, setMciNumber] = useState(verification?.mci_number ?? "");
  const [mciFile, setMciFile] = useState<File | null>(null);
  const [mciSubmitting, setMciSubmitting] = useState(false);
  const [mciError, setMciError] = useState<string | null>(null);
  const [mciSuccess, setMciSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DoctorProfileData>({
    resolver: zodResolver(doctorProfileSchema),
    defaultValues: {
      first_name: profile.first_name ?? "",
      last_name: profile.last_name ?? "",
      phone: profile.phone ?? "",
      city: profile.city ?? "",
      hospital_name: doctorProfile.hospital_name ?? "",
    },
  });

  const onSubmit = async (data: DoctorProfileData) => {
    setServerError(null);
    setSuccessMsg(null);

    const res = await fetch("/api/profile/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role: "doctor",
        ...data,
        qualifications,
      }),
    });

    if (!res.ok) {
      const body = await res.json();
      setServerError(body.error ?? "Failed to update profile.");
      return;
    }

    setSuccessMsg("Profile updated successfully.");
    router.refresh();
  };

  // MCI verification submission
  const handleMciSubmit = async () => {
    setMciError(null);
    setMciSuccess(null);

    if (!mciNumber.trim()) {
      setMciError("MCI registration number is required.");
      return;
    }
    if (!mciFile) {
      setMciError("Please upload your MCI certificate.");
      return;
    }

    setMciSubmitting(true);

    try {
      const res = await fetch("/api/profile/submit-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mci_number: mciNumber }),
      });

      if (!res.ok) {
        const body = await res.json();
        setMciError(body.error ?? "Submission failed. Please try again.");
        return;
      }

      setMciSuccess(
        "Verification submitted. We'll review within 1–2 business days.",
      );
      router.refresh();
    } finally {
      setMciSubmitting(false);
    }
  };

  const verifStatus = verification?.status ?? "unverified";
  const canSubmit = verifStatus === "unverified" || verifStatus === "rejected";
  const displayName = [profile.first_name, profile.last_name]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="flex flex-col gap-8">
      {/* ── Profile form ──────────────────────────────────── */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {/* ── Avatar ────────────────────────────────────────── */}
        <AvatarUpload
          currentUrl={avatarUrl}
          userId={profile.id}
          role="doctor"
          displayName={displayName}
          onUpload={(url) => setAvatarUrl(url)}
        />
        {/* ── Account info ──────────────────────────────────── */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Account
          </p>

          <div className="bg-transparent rounded-lg px-4 py-1 text-sm text-blue-400 ">
            <span className="font-medium text-gray-500 dark:text-gray-400">
              Specialty:{" "}
            </span>
            {doctorProfile.specialty}
            <span className="text-xs text-gray-400 ml-2">
              (contact support to change)
            </span>
          </div>
        </div>

        {/* ── Personal info ─────────────────────────────────── */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Personal information
          </p>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="First name"
                required
                error={errors.first_name?.message}
                edit
                {...register("first_name")}
              />
              <Input
                label="Last name"
                error={errors.last_name?.message}
                {...register("last_name")}
                edit
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Phone number"
                type="tel"
                placeholder="+91 98765 43210"
                error={errors.phone?.message}
                {...register("phone")}
                edit
              />
              <Input
                label="Current hospital"
                error={errors.hospital_name?.message}
                {...register("hospital_name")}
                edit
              />
              <Input
                label="City"
                error={errors.city?.message}
                {...register("city")}
                edit
              />
            </div>
            {/* Qualifications autocomplete */}
            <QualificationsInput
              value={qualifications}
              onChange={setQualifications}
            />
          </div>
        </div>

        {serverError && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            <p className="text-sm text-red-600">{serverError}</p>
          </div>
        )}
        {successMsg && (
          <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3">
            <p className="text-sm text-green-700">{successMsg}</p>
          </div>
        )}

        <Button
          type="submit"
          isLoading={isSubmitting}
          className="self-start px-6"
        >
          Save changes
        </Button>
      </form>

      {/* ── Verification section ──────────────────────────── */}
      {!doctorProfile.is_verified && (
        <div className="border-t border-gray-100 pt-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Verification
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Submit your MCI registration to get a verified badge on your
            profile.
          </p>

          {/* Current status */}
          {verifStatus === "pending" && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-4">
              <p className="text-sm text-amber-700">
                ⏳ Your verification is under review. We'll notify you within
                1–2 business days.
              </p>
            </div>
          )}
          {verifStatus === "rejected" && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
              <p className="text-sm text-red-600">
                ❌ Your previous submission was rejected. Please resubmit with
                correct details.
              </p>
            </div>
          )}

          {canSubmit && (
            <div className="flex flex-col gap-3">
              <Input
                label="MCI Registration Number"
                placeholder="e.g. MH-12345"
                value={mciNumber}
                onChange={(e) => setMciNumber(e.target.value)}
              />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  MCI Certificate <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setMciFile(e.target.files?.[0] ?? null)}
                  className="text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3
                             file:rounded-lg file:border file:border-gray-300
                             file:text-sm file:text-gray-600 file:bg-white
                             hover:file:bg-gray-50 cursor-pointer"
                />
                <p className="text-xs text-gray-400">PDF or image. Max 5MB.</p>
              </div>

              {mciError && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                  <p className="text-sm text-red-600">{mciError}</p>
                </div>
              )}
              {mciSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                  <p className="text-sm text-green-700">{mciSuccess}</p>
                </div>
              )}

              <Button
                type="button"
                variant="secondary"
                isLoading={mciSubmitting}
                onClick={handleMciSubmit}
                className="self-start px-6"
              >
                Submit for verification
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
