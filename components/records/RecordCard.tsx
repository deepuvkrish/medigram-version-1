// components/records/RecordCard.tsx
"use client";

import { useState } from "react";
import type { MedicalRecord } from "@/types/database";

const CATEGORY_LABELS: Record<string, string> = {
  prescription: "Prescription",
  lab_result: "Lab Result",
  scan: "Scan",
  bill: "Bill",
  other: "Other",
};

const CATEGORY_COLORS: Record<string, string> = {
  prescription: "bg-blue-50 text-blue-700",
  lab_result: "bg-purple-50 text-purple-700",
  scan: "bg-teal-50 text-teal-700",
  bill: "bg-amber-50 text-amber-700",
  other: "bg-gray-100 text-gray-600",
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(fileUrl: string): string {
  const ext = fileUrl.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "📄";
  if (["jpg", "jpeg", "png", "heic", "heif"].includes(ext ?? "")) return "🖼️";
  return "📎";
}

interface Props {
  record: MedicalRecord;
  onDelete: (id: string) => void;
  onView: (url: string, type: string, title: string) => void;
}

export default function RecordCard({ record, onDelete, onView }: Props) {
  const [viewing, setViewing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [viewError, setViewError] = useState<string | null>(null);

  const handleView = async () => {
    setViewing(true);
    setViewError(null);
    try {
      const res = await fetch("/api/records/signed-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recordId: record.id }),
      });
      const data = await res.json();

      if (res.ok && data.url) {
        const ext = record.file_url.split(".").pop()?.toLowerCase();
        const type = ext === "pdf" ? "pdf" : "image";
        onView(data.url, type, record.title);
      } else {
        setViewError(data.error ?? "Failed to open file.");
      }
    } catch (err) {
      setViewError("Network error. Please try again.");
    } finally {
      setViewing(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch("/api/records/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recordId: record.id }),
      });
      if (res.ok) {
        onDelete(record.id);
      }
    } finally {
      setDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <div
      className="bg-white rounded-xl border border-gray-100 p-4
                    hover:border-gray-200 hover:shadow-sm transition-all"
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0 mt-0.5">
          {getFileIcon(record.file_url)}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium text-gray-900 truncate">
              {record.title}
            </p>
            <span
              className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium
              ${CATEGORY_COLORS[record.category]}`}
            >
              {CATEGORY_LABELS[record.category]}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1.5">
            {record.record_date && (
              <span className="text-xs text-gray-400">
                📅 {formatDate(record.record_date)}
              </span>
            )}
            <span className="text-xs text-gray-400">
              {formatBytes(record.file_size_bytes)}
            </span>
            <span className="text-xs text-gray-300">
              Uploaded {formatDate(record.created_at)}
            </span>
          </div>
        </div>
      </div>

      {/* View error — shown inline under the card header */}
      {viewError && (
        <div className="mt-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-xs text-red-600">{viewError}</p>
        </div>
      )}

      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
        <button
          onClick={handleView}
          disabled={viewing}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                     text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100
                     transition-colors disabled:opacity-50"
        >
          {viewing ? "Opening..." : "👁 View"}
        </button>

        {!showConfirm ? (
          <button
            onClick={() => setShowConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                       text-red-500 bg-red-50 rounded-lg hover:bg-red-100
                       transition-colors ml-auto"
          >
            🗑 Delete
          </button>
        ) : (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-gray-500">Sure?</span>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-3 py-1.5 text-xs font-medium text-white bg-red-500
                         rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Yes, delete"}
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="px-3 py-1.5 text-xs font-medium text-gray-600
                         bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
