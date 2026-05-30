import Link from "next/link";
import Image from "next/image";
// ============================================================
// MEDGRAM — Landing Page
// Public. Visible to everyone including guests.
// Simple value proposition + clear CTAs.
// Full marketing design comes after MVP is functional.
// ============================================================

import { CiMedicalCross } from "react-icons/ci";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col w-full relative">
      {/* ── Navbar ─────────────────────────────────────────── */}
      <nav className="px-6 py-10 flex items-center justify-between h-15 bg-[#1e1f28] sm:bg-transparent">
        <Image
          src="images/heal_nav.png"
          alt="Background Imagee"
          width={100}
          height={100}
          unoptimized
        />

        {/* <span className="text-xl font-semibold text-pink-600">
          Med<span className="text-blue-500">gram</span>
        </span> */}
        <Link
          href="/auth/login"
          className="text-lg sm:text-xl font-medium text-gray-500 hover:text-gray-900 dark:hover:text-pink-400 transition-colors"
        >
          Log in
        </Link>
      </nav>

      {/* ── Hero ───────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center relative overflow-clip bg-[#1e1f28] sm:bg-transparent">
        <Image
          src="images/medboard.png"
          alt="Background Imagee"
          width={400}
          height={400}
          unoptimized
          className="absolute left-10 top-10 hidden md:block"
        />

        <h1 className="text-4xl font-bold text-[#b0bfff] max-w-xl leading-tight relative z-2">
          Your medical history,{" "}
          <span className="text-[#7a93ff]">secure and always with you</span>
        </h1>

        <p className="mt-4 text-lg text-gray-500 max-w-md relative z-2">
          Store prescriptions, lab results, and scans in one place. Share them
          with any doctor — instantly and securely.
        </p>

        {/* ── CTAs ─────────────────────────────────────────── */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 relative z-2">
          <Link
            href="/auth/signup/patient"
            className="px-6 py-3 bg-(--cornBlue) text-white rounded-lg font-medium
                       hover:bg-[#346dd7] transition-colors text-center"
          >
            Get started as a User
          </Link>
          <Link
            href="/auth/signup/doctor"
            className="flex items-center px-6 py-3 bg-[#6495ed1f] text-gray-200 dark:md:text-gray-300 md:text-gray-700 rounded-lg font-medium hover:bg-[#6494ed75] transition-colors text-center"
          >
            <CiMedicalCross />
            Join as a Doctor
          </Link>
        </div>

        <p className="mt-6 text-sm text-gray-400 relative z-2">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="text-(--cornBlue) hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="px-6 py-4 text-center text-xs font-semibold text-white sm:bg-[#6495ed] bg-[#1e1f28] ">
        © {new Date().getFullYear()} Medgram. All rights reserved.
      </footer>
    </main>
  );
}
