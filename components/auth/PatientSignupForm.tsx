"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { patientSignupSchema, type PatientSignupData } from "@/lib/validations";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

// ============================================================
// PatientSignupForm
// Handles patient registration end to end:
//   1. Client-side validation via Zod + react-hook-form
//   2. Supabase Auth signup with metadata
//   3. API call to save patient-specific fields
//   4. Redirect to verify-email page
// ============================================================

export default function PatientSignupForm() {
  const router = useRouter();
  const supabase = createClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PatientSignupData>({
    resolver: zodResolver(patientSignupSchema),
  });
  // register     → connects each input to react-hook-form
  // handleSubmit → runs validation before calling our onSubmit
  // errors       → validation error messages per field
  // isSubmitting → true while our async onSubmit is running

  const onSubmit = async (data: PatientSignupData) => {
    setServerError(null);

    // Pass ALL fields via options.data (becomes raw_user_meta_data).
    // The trigger reads every field here and inserts them in one
    // atomic transaction — no race condition possible.
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          role: "patient",
          first_name: data.first_name,
          last_name: data.last_name ?? "",
          username: data.username,
          country: data.country,
          state: data.state,
          city: data.city,
          pincode: data.pincode,
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
      {/* Name row */}
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="First name"
          placeholder="Arun"
          required
          error={errors.first_name?.message}
          {...register("first_name")}
        />
        <Input
          label="Last name"
          placeholder="Kumar"
          error={errors.last_name?.message}
          {...register("last_name")}
        />
      </div>

      <Input
        label="Username"
        placeholder="arunkumar"
        required
        hint="3–20 characters. Letters, numbers, underscores only."
        error={errors.username?.message}
        {...register("username")}
      />

      <Input
        label="Email"
        type="email"
        placeholder="arun@example.com"
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

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Country"
          placeholder="India"
          required
          error={errors.country?.message}
          {...register("country")}
        />
        <Input
          label="State"
          placeholder="Kerala"
          required
          error={errors.state?.message}
          {...register("state")}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="City"
          placeholder="Kochi"
          required
          error={errors.city?.message}
          {...register("city")}
        />
        <Input
          label="Pincode"
          placeholder="682001"
          required
          error={errors.pincode?.message}
          {...register("pincode")}
        />
      </div>

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

      {/* Server-side error — shown below the form */}
      {serverError && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <p className="text-sm text-red-600">{serverError}</p>
        </div>
      )}

      <Button
        type="submit"
        variant="cornBlue"
        fullWidth
        isLoading={isSubmitting}
        className="mt-2"
      >
        Create account
      </Button>

      <p className="text-center text-sm text-gray-500">
        Are you a doctor?{" "}
        <Link
          href="/auth/signup/doctor"
          className="text-(--cornBlue) hover:underline"
        >
          Register here
        </Link>
      </p>

      <p className="text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-(--cornBlue) hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
