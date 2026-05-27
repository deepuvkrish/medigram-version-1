// components / auth / DoctorSignupForm.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { doctorSignupSchema, type DoctorSignupData } from "@/lib/validations";
import { SPECIALTIES } from "@/lib/constants";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";

// ============================================================
// DoctorSignupForm
// Same pattern as PatientSignupForm but with doctor fields.
// specialty and hospital_name passed via metadata to trigger.
// ============================================================

const specialtyOptions = SPECIALTIES.map((s) => ({ value: s, label: s }));

export default function DoctorSignupForm() {
  const router = useRouter();
  const supabase = createClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DoctorSignupData>({
    resolver: zodResolver(doctorSignupSchema),
  });

  const onSubmit = async (data: DoctorSignupData) => {
    setServerError(null);

    // Pass ALL fields via options.data (becomes raw_user_meta_data).
    // The trigger reads every field here and inserts them in one
    // atomic transaction — no race condition possible.
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          role: "doctor",
          first_name: data.first_name,
          last_name: data.last_name ?? "",
          specialty: data.specialty,
          hospital_name: data.hospital_name ?? "",
          city: data.city,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) {
      setServerError(authError.message);
      return;
    }

    if (!authData.user) {
      setServerError("Something went wrong. Please try again.");
      return;
    }

    // Redirect to verify-email page.
    router.push("/auth/verify-email");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="First name"
          placeholder="Priya"
          required
          error={errors.first_name?.message}
          {...register("first_name")}
        />
        <Input
          label="Last name"
          placeholder="Nair"
          error={errors.last_name?.message}
          {...register("last_name")}
        />
      </div>

      <Input
        label="Email"
        type="email"
        placeholder="doctor@hospital.com"
        required
        error={errors.email?.message}
        {...register("email")}
      />

      <Input
        label="Password"
        type="password"
        placeholder="Min 8 characters, 1 uppercase, 1 number"
        required
        error={errors.password?.message}
        {...register("password")}
      />

      <Select
        label="Specialty"
        required
        placeholder="Select your specialty"
        options={specialtyOptions}
        error={errors.specialty?.message}
        {...register("specialty")}
      />

      <Input
        label="Current hospital"
        placeholder="Amrita Institute of Medical Sciences"
        hint="Optional — you can update this from your profile"
        error={errors.hospital_name?.message}
        {...register("hospital_name")}
      />

      <Input
        label="City"
        placeholder="Kochi"
        required
        error={errors.city?.message}
        {...register("city")}
      />

      {/* Terms and conditions checkbox */}
      <div className="flex flex-col gap-1">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-(--cornBlue)
                       focus:ring-blue-500 cursor-pointer shrink-0"
            {...register("terms")}
          />
          <span className="text-sm text-gray-300 md:text-gray-600">
            I agree to the{" "}
            <Link href="/terms" className="text-(--cornBlue) hover:underline">
              Terms of Service
            </Link>
            {" and "}
            <Link href="/privacy" className="text-(--cornBlue) hover:underline">
              Privacy Policy
            </Link>
          </span>
        </label>
        {errors.terms && (
          <p className="text-xs text-red-500 ml-7">{errors.terms.message}</p>
        )}
      </div>

      {serverError && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <p className="text-sm text-red-600">{serverError}</p>
        </div>
      )}

      <Button type="submit" fullWidth isLoading={isSubmitting} className="mt-2">
        Create doctor account
      </Button>

      <p className="text-center text-sm text-gray-500">
        Are you a patient?{" "}
        <Link
          href="/auth/signup/patient"
          className="text-blue-600 hover:underline"
        >
          Register here
        </Link>
      </p>

      <p className="text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-blue-600 hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
