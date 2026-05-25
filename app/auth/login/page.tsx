import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Log In",
};

// Suspense is required here because LoginForm uses useSearchParams()
// which needs to be wrapped in a Suspense boundary in Next.js App Router.
export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <a href="/" className="text-2xl font-semibold text-blue-600">
            Medgram
          </a>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Log in to your Medgram account
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-8">
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
