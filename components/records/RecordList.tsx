// components/records/RecordList.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import RecordCard from "@/components/records/RecordCard";
import RecordViewer from "@/components/records/RecordViewer";
import type { MedicalRecord } from "@/types/database";

// ============================================================
// RecordList — displays records with filter tabs.
// Manages viewer modal state.
// Handles optimistic delete (removes card immediately).
// ============================================================

const TABS = [
  { value: "all", label: "All" },
  { value: "prescription", label: "Prescriptions" },
  { value: "lab_result", label: "Lab Results" },
  { value: "scan", label: "Scans" },
  { value: "bill", label: "Bills" },
  { value: "other", label: "Other" },
];

interface ViewerState {
  url: string;
  type: "pdf" | "image";
  title: string;
}

interface Props {
  initialRecords: MedicalRecord[];
}

export default function RecordList({ initialRecords }: Props) {
  const [records, setRecords] = useState<MedicalRecord[]>(initialRecords);
  const [tab, setTab] = useState("all");
  const [viewer, setViewer] = useState<ViewerState | null>(null);

  // Optimistic delete — remove card immediately without waiting for refetch
  const handleDelete = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  const handleView = (url: string, type: string, title: string) => {
    setViewer({ url, type: type as "pdf" | "image", title });
  };

  const filtered =
    tab === "all" ? records : records.filter((r) => r.category === tab);

  return (
    <>
      {/* ── Filter tabs ───────────────────────────────────── */}
      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
        {TABS.map((t) => {
          const count =
            t.value === "all"
              ? records.length
              : records.filter((r) => r.category === t.value).length;

          return (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`
                shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium
                transition-colors flex items-center gap-1.5
                ${
                  tab === t.value
                    ? "bg-blue-100 text-blue-600 border border-blue-200"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                } 
              `}
            >
              {t.label}
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full
                ${tab === t.value ? "bg-(--cornBlue) text-white" : "bg-gray-100 text-gray-500"}
              `}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Records ───────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-4xl mb-4">📂</p>
          <p className="text-gray-500 font-medium">
            {tab === "all"
              ? "No records yet"
              : `No ${tab.replace("_", " ")} records`}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {tab === "all"
              ? "Upload your first medical record to get started."
              : "Upload a record in this category to see it here."}
          </p>
          {tab === "all" && (
            <Link
              href="/patient/records/upload"
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg
                         text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Upload a record
            </Link>
          )}
        </div>
      ) : (
        <div className="flex flex-row gap-3 flex-wrap">
          {filtered.map((record) => (
            <RecordCard
              key={record.id}
              record={record}
              onDelete={handleDelete}
              onView={handleView}
            />
          ))}
        </div>
      )}

      {/* ── Viewer modal ──────────────────────────────────── */}
      {viewer && (
        <RecordViewer
          url={viewer.url}
          type={viewer.type}
          title={viewer.title}
          onClose={() => setViewer(null)}
        />
      )}
    </>
  );
}
