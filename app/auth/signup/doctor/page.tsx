import type { Metadata } from "next";
import DoctorSignupForm from "@/components/auth/DoctorSignupForm";

export const metadata: Metadata = {
  title: "Doctor Sign Up",
};

export default function DoctorSignupPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <a href="/" className="text-2xl font-semibold text-blue-600">
            Medgram
          </a>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            Join as a doctor
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage patient records and appointments
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-8">
          <DoctorSignupForm />
        </div>
      </div>
    </main>
  );
}
