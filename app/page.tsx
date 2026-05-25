import Link from "next/link";

// ============================================================
// MEDGRAM — Landing Page
// Public. Visible to everyone including guests.
// Simple value proposition + clear CTAs.
// Full marketing design comes after MVP is functional.
// ============================================================

import { CiMedicalCross } from "react-icons/ci";
import { HeartPulse } from "lucide-react";
import { Stethoscope } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col w-full relative">
      {/* ── Navbar ─────────────────────────────────────────── */}
      <nav className="border-b border-gray-100 dark:border-gray-800 px-6 py-10 flex items-center justify-between h-15">
        <span className="text-xl font-semibold text-pink-600">
          Med<span className="text-blue-500">gram</span>
        </span>
        <Link
          href="/auth/login"
          className="text-sm text-gray-600 hover:text-gray-900 dark:hover:text-pink-400 transition-colors"
        >
          Log in
        </Link>
      </nav>

      {/* ── Hero ───────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
        <HeartPulse className="absolute left-0 top-0 h-100 w-100 opacity-5 rotate-330 text-blue-300" />
        <Stethoscope className="absolute right-0 top-20 h-80 w-80 opacity-5 rotate-45 text-pink-300" />
        <h1 className="text-4xl font-bold text-[#b0bfff] max-w-xl leading-tight">
          Your medical history,{" "}
          <span className="text-[#7a93ff]">secure and always with you</span>
        </h1>

        <p className="mt-4 text-lg text-gray-500 max-w-md">
          Store prescriptions, lab results, and scans in one place. Share them
          with any doctor — instantly and securely.
        </p>

        {/* ── CTAs ─────────────────────────────────────────── */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Link
            href="/auth/signup/patient"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium
                       hover:bg-blue-700 transition-colors text-center"
          >
            Get started as a User
          </Link>
          <Link
            href="/auth/signup/doctor"
            className="flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg
                       font-medium hover:bg-gray-50 transition-colors text-center"
          >
            <CiMedicalCross />
            Join as a Doctor
          </Link>
        </div>

        <p className="mt-6 text-sm text-gray-400">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-blue-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer
        className="border-t border-gray-100 dark:border-gray-800 px-6 py-4 text-center
                          text-xs text-gray-400"
      >
        © {new Date().getFullYear()} Medgram. All rights reserved.
      </footer>
    </main>
  );
}
