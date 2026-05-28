// app/patient/records/page.tsx

import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import RecordList from "@/components/records/RecordList";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Records" };
import { Plus } from "lucide-react";
// ============================================================
// Records page — server component.
// Fetches all non-deleted records for the logged-in patient.
// Passes to RecordList client component for interactivity.
// ============================================================

export default async function RecordsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Fetch all non-deleted records, newest first
  const { data: records, error } = await supabase
    .from("medical_records")
    .select("*")
    .eq("owner_id", user.id)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("records fetch error:", error);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-200">
            My Records
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {records?.length ?? 0} record{records?.length !== 1 ? "s" : ""}{" "}
            stored
          </p>
        </div>
        <Link
          href="/patient/records/upload"
          className="flex items-center gap-2 px-4 py-2 bg-(--cornBlue) text-white
                     rounded-lg text-sm font-medium hover:bg-(--linkActive) transition-colors"
        >
          <Plus className="w-5 h-5" />
          Upload
        </Link>
      </div>

      {/* ── Record list with filter tabs ─────────────────────── */}
      <RecordList initialRecords={records ?? []} />
    </div>
  );
}
