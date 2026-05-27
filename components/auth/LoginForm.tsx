"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { loginSchema, type LoginData } from "@/lib/validations";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

// ============================================================
// LoginForm
// Handles login and redirects based on role.
// Reads ?next= param to return user to intended page after login.
// ============================================================

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [serverError, setServerError] = useState<string | null>(null);

  // Read the ?next= param set by middleware when redirecting
  // unauthenticated users. After login, send them there.
  const next = searchParams.get("next");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginData) => {
    setServerError(null);

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      // Don't expose whether email or password was wrong specifically —
      // that helps attackers enumerate valid accounts.
      setServerError("Invalid email or password.");
      return;
    }

    if (!authData.user) {
      setServerError("Something went wrong. Please try again.");
      return;
    }

    // Check if email has been verified.
    if (!authData.user.email_confirmed_at) {
      setServerError(
        "Please verify your email before logging in. Check your inbox.",
      );
      await supabase.auth.signOut();
      return;
    }

    // Read role from user metadata to determine which dashboard to send them to.
    const role = authData.user.user_metadata?.role as string | undefined;

    // If there's a ?next= param and it matches the user's role area, use it.
    // Otherwise send them to their default dashboard.
    if (
      next &&
      ((role === "patient" && next.startsWith("/patient")) ||
        (role === "doctor" && next.startsWith("/doctor")))
    ) {
      router.push(next);
    } else if (role === "doctor") {
      router.push("/doctor/dashboard");
    } else {
      router.push("/patient/dashboard");
    }

    router.refresh();
    // router.refresh() tells Next.js to re-fetch server components
    // so they pick up the new session cookie immediately.
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        required
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />

      <Input
        label="Password"
        type="password"
        placeholder="Your password"
        required
        autoComplete="current-password"
        error={errors.password?.message}
        {...register("password")}
      />

      <div className="flex justify-end">
        <Link
          href="/auth/forgot-password"
          className="text-sm text-(--cornBlue) hover:underline"
        >
          Forgot password?
        </Link>
      </div>

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
      >
        Log in
      </Button>

      <div className="relative my-1">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-(--mobileDark) md:bg-white px-3 text-gray-400">
            New to Medgram?
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/auth/signup/patient"
          className="text-center px-4 py-2 border border-gray-600 md:border-gray-300 rounded-lg
                     text-sm text-gray-100 md:text-gray-700 hover:bg-gray-50 transition-colors"
        >
          User signup
        </Link>
        <Link
          href="/auth/signup/doctor"
          className="text-center px-4 py-2 border border-gray-600 md:border-gray-300 rounded-lg
                     text-sm text-gray-100 md:text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Doctor signup
        </Link>
      </div>
    </form>
  );
}
