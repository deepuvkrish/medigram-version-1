import type { Metadata } from "next";
import PatientSignupForm from "@/components/auth/PatientSignupForm";

export const metadata: Metadata = {
  title: "Patient Sign Up",
};

export default function PatientSignupPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <a href="/" className="text-2xl font-semibold text-blue-600">
            Medgram
          </a>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            Create your patient account
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Store and share your medical history securely
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-8">
          <PatientSignupForm />
        </div>
      </div>
    </main>
  );
}
