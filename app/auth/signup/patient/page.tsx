import type { Metadata } from "next";
import PatientSignupForm from "@/components/auth/PatientSignupForm";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Sign Up",
};

export default function PatientSignupPage() {
  return (
    <main className="min-h-screen bg-(--mobileDark) md:bg-gray-100  flex items-center justify-center px-4 py-12">
      <div className="flex flex-col md:flex-row w-full max-w-screen justify-between">
        {/* Header */}
        <div className="flex flex-col items-center justify-center text-center mb-8 md:w-1/2 w-full">
          <Image
            src="/images/heal-13.png"
            alt="logo"
            height={300}
            width={300}
            className="md:w-120 md:h-50 w-60 h-25"
          />
          <h1 className="mt-4 text-2xl font-bold text-white md:text-gray-900">
            Create your account
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Store and share your medical history securely
          </p>
        </div>

        {/* Form card */}
        <div className="flex md:w-1/2 w-full justify-center h-full items-center">
          <div className="bg-(--mobileDark) md:bg-white rounded-2xl shadow-sm border-none md:border md: border-gray-100 px-6 py-8">
            <PatientSignupForm />
          </div>
        </div>
      </div>
    </main>
  );
}
