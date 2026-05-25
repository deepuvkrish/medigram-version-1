import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Verify Your Email",
};

export default function VerifyEmailPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        {/* Email icon */}
        <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6">
          <svg
            className="w-8 h-8 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900">Check your email</h1>

        <p className="mt-3 text-gray-500 leading-relaxed">
          We've sent you a verification link. Click it to activate your account
          and get started with Medgram.
        </p>

        <p className="mt-2 text-sm text-gray-400">
          Didn't receive it? Check your spam folder.
        </p>

        <div className="mt-8">
          <Link
            href="/auth/login"
            className="text-sm text-blue-600 hover:underline"
          >
            Back to log in
          </Link>
        </div>
      </div>
    </main>
  );
}
