// app / auth / forgot - password / page.tsx;

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  forgotPasswordSchema,
  type ForgotPasswordData,
} from "@/lib/validations";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordData) => {
    setServerError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      setServerError(error.message);
      return;
    }

    setSent(true);
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <a href="/" className="text-2xl font-semibold text-blue-600">
            Medgram
          </a>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            Reset your password
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Enter your email and we'll send a reset link
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-8">
          {sent ? (
            <div className="text-center">
              <div
                className="w-12 h-12 bg-green-100 rounded-full flex items-center
                              justify-center mx-auto mb-4"
              >
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-sm text-gray-600">
                Reset link sent. Check your inbox and follow the instructions.
              </p>
              <Link
                href="/auth/login"
                className="mt-4 inline-block text-sm text-blue-600 hover:underline"
              >
                Back to log in
              </Link>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                required
                error={errors.email?.message}
                {...register("email")}
              />
              {serverError && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                  <p className="text-sm text-red-600">{serverError}</p>
                </div>
              )}
              <Button type="submit" fullWidth isLoading={isSubmitting}>
                Send reset link
              </Button>
              <p className="text-center text-sm text-gray-500">
                <Link
                  href="/auth/login"
                  className="text-blue-600 hover:underline"
                >
                  Back to log in
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
