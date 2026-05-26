// app/patient/records/upload/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import UploadForm from "@/components/records/UploadForm";

export const metadata: Metadata = { title: "Upload Record" };

export default function UploadPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Link
            href="/patient/records"
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            ← My Records
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Upload a record</h1>
        <p className="text-sm text-gray-500 mt-1">
          Add a new medical document to your history
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <UploadForm />
      </div>
    </div>
  );
}
