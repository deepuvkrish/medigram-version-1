// components/auth/PatientProfileForm.tsx

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  patientProfileSchema,
  type PatientProfileData,
} from "@/lib/validations";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import type { Profile, PatientProfile } from "@/types/database";

// ============================================================
// PatientProfileForm
// Pre-fills with existing data. On submit, updates both
// profiles and patient_profiles tables via the API route.
// ============================================================

interface Props {
  profile: Profile;
  patientProfile: PatientProfile | null;
}

export default function PatientProfileForm({ profile, patientProfile }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PatientProfileData>({
    resolver: zodResolver(patientProfileSchema),
    defaultValues: {
      first_name: profile.first_name ?? "",
      last_name: profile.last_name ?? "",
      phone: profile.phone ?? "",
      city: profile.city ?? "",
      state: patientProfile?.state ?? "",
      country: patientProfile?.country ?? "",
      pincode: patientProfile?.pincode ?? "",
      date_of_birth: patientProfile?.date_of_birth ?? "",
    },
  });

  const onSubmit = async (data: PatientProfileData) => {
    setServerError(null);
    setSuccessMsg(null);

    const res = await fetch("/api/profile/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "patient", ...data }),
    });

    if (!res.ok) {
      const body = await res.json();
      setServerError(body.error ?? "Failed to update profile.");
      return;
    }

    setSuccessMsg("Profile updated successfully.");
    router.refresh();
    // router.refresh() re-fetches server component data so the
    // sidebar name updates without a full page reload.
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      {/* ── Account info (read-only) ──────────────────────── */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Account
        </p>
        <div className="bg-gray-50 rounded-lg px-4 py-3 text-sm text-gray-600">
          <span className="font-medium">Email: </span>
          {profile.email}
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
              {...register("first_name")}
            />
            <Input
              label="Last name"
              error={errors.last_name?.message}
              {...register("last_name")}
            />
          </div>

          <Input
            label="Phone number"
            type="tel"
            placeholder="+91 12345 67890"
            error={errors.phone?.message}
            {...register("phone")}
          />

          <Input
            label="Date of birth"
            type="date"
            error={errors.date_of_birth?.message}
            {...register("date_of_birth")}
          />
        </div>
      </div>

      {/* ── Location ──────────────────────────────────────── */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Location
        </p>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Country"
              error={errors.country?.message}
              {...register("country")}
            />
            <Input
              label="State"
              error={errors.state?.message}
              {...register("state")}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="City"
              error={errors.city?.message}
              {...register("city")}
            />
            <Input
              label="Pincode"
              error={errors.pincode?.message}
              {...register("pincode")}
            />
          </div>
        </div>
      </div>

      {/* ── Feedback ──────────────────────────────────────── */}
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
  );
}
