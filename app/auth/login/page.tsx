import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "@/components/auth/LoginForm";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Log In",
};

// Suspense is required here because LoginForm uses useSearchParams()
// which needs to be wrapped in a Suspense boundary in Next.js App Router.
export default function LoginPage() {
  return (
    <main className="min-h-screen bg-(--mobileDark) md:bg-gray-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center justify-center text-center mb-8">
          <Image
            src="/images/heal_nav.png"
            alt="logo"
            height={200}
            width={200}
          />
          <h1 className="mt-4 text-2xl font-bold text-white md:text-gray-900">
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-gray-300 md:text-gray-500">
            Log in to your Medgram account
          </p>
        </div>

        <div className="bg-(--mobileDark) md:bg-white rounded-2xl shadow-sm border-none md:border md:border-gray-100 px-6 py-8">
          <Suspense
            fallback={<div className="text-sm text-gray-400">Loading...</div>}
          >
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
