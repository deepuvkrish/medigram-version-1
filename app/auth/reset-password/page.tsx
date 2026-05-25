// app / auth / reset - password / page.tsx;

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { resetPasswordSchema, type ResetPasswordData } from "@/lib/validations";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordData) => {
    setServerError(null);

    const { error } = await supabase.auth.updateUser({
      password: data.password,
    });

    if (error) {
      setServerError(error.message);
      return;
    }

    // Password updated — send them to login
    router.push("/auth/login");
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <a href="/" className="text-2xl font-semibold text-blue-600">
            Medgram
          </a>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            Set new password
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Choose a strong password for your account
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-8">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <Input
              label="New password"
              type="password"
              placeholder="Min 8 characters, 1 uppercase, 1 number"
              required
              error={errors.password?.message}
              {...register("password")}
            />
            <Input
              label="Confirm new password"
              type="password"
              placeholder="Repeat your password"
              required
              error={errors.confirm_password?.message}
              {...register("confirm_password")}
            />
            {serverError && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                <p className="text-sm text-red-600">{serverError}</p>
              </div>
            )}
            <Button type="submit" fullWidth isLoading={isSubmitting}>
              Update password
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
