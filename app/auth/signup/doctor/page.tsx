import type { Metadata } from "next";
import DoctorSignupForm from "@/components/auth/DoctorSignupForm";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Doctor Sign Up",
};

export default function DoctorSignupPage() {
  return (
    <main className="min-h-screen bg-(--mobileDark) md:bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="flex flex-col md:flex-row w-full max-w-screen justify-between">
        <div className="flex flex-col items-center justify-center text-center mb-8 md:w-1/2 w-full">
          <Image
            src="/images/heal-14.png"
            alt="logo"
            height={300}
            width={300}
            className="md:w-120 md:h-50 w-60 h-25"
          />
          <h1 className="mt-4 text-2xl font-bold text-white md:text-gray-900">
            Join as a doctor
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage patient records and appointments
          </p>
        </div>

        {/* Form card */}
        <div className="flex md:w-1/2 w-full justify-center h-full items-center">
          <div className="bg-(--mobileDark) md:bg-white rounded-2xl shadow-sm border-none md:border md: border-gray-100 px-6 py-8">
            <DoctorSignupForm />
          </div>
        </div>
      </div>
    </main>
  );
}
