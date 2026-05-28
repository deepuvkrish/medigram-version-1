// components/records/RecordCard.tsx
"use client";

import { useState } from "react";
import type { MedicalRecord } from "@/types/database";
import { Paperclip } from "lucide-react";
import { BsFileEarmarkPdfFill } from "react-icons/bs";
import { FcImageFile } from "react-icons/fc";
import { MdDeleteForever } from "react-icons/md";
// import { AiOutlineCloudUpload } from "react-icons/ai";

const CATEGORY_LABELS: Record<string, string> = {
  prescription: "Prescription",
  lab_result: "Lab Result",
  scan: "Scan",
  bill: "Bill",
  other: "Other",
};

const CATEGORY_COLORS: Record<string, string> = {
  prescription:
    "bg-blue-50 text-blue-700 dark:bg-[#1447e657] dark:text-blue-50",
  lab_result:
    "bg-purple-50 text-purple-700 dark:text-purple-50 dark:bg-[#8200db4d]",
  scan: "bg-teal-50 text-teal-700 dark:text-teal-50 dark:bg-teal-700",
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

function getFileIcon(fileUrl: string): React.ReactNode {
  const ext = fileUrl.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return <BsFileEarmarkPdfFill className="text-red-700" />;
  if (["jpg", "jpeg", "png", "heic", "heif"].includes(ext ?? ""))
    return <FcImageFile />;
  return <Paperclip />;
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
    <div className="bg-(--mobileDarkSideMobile) rounded-xl border border-gray-100 dark:border-gray-900 p-4 hover:border-blue-300 hover:shadow-sm transition-all min-w-87.5 cursor-pointer">
      <div className="flex items-start gap-3">
        <span className="text-2xl shrink-0 mt-0.5">
          {getFileIcon(record.file_url)}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center justify-center">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-300 truncate">
                {record.title}
              </p>
              <span className="text-[10px] ml-2 text-gray-500">
                ({formatBytes(record.file_size_bytes)})
              </span>
            </div>
            <span
              className={`shrink-0 text-[12px] px-2 py-0.5 px-2 rounded-full font-medium
              ${CATEGORY_COLORS[record.category]}`}
            >
              {CATEGORY_LABELS[record.category]}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1.5 justify-between">
            {record.record_date && (
              <span className="text-xs text-gray-400">
                📅 {formatDate(record.record_date)}
              </span>
            )}
            {/* <span className="flex items-center text-xs text-gray-400">
              <AiOutlineCloudUpload className="text-blue-400 font-medium mr-1" />{" "}
              {formatDate(record.created_at)}
            </span> */}
          </div>
        </div>
      </div>

      {/* View error — shown inline under the card header */}
      {viewError && (
        <div className="mt-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-xs text-red-600">{viewError}</p>
        </div>
      )}

      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50 dark:border-gray-700">
        <button
          onClick={handleView}
          disabled={viewing}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                     text-blue-600 dark:text-gray-300 bg-gray-50 dark:bg-transparent rounded-lg hover:bg-blue-100 dark:hover:bg-transparent
                     transition-colors disabled:opacity-50 dark:hover:text-blue-300"
        >
          {viewing ? "Opening..." : "👁 View"}
        </button>

        {!showConfirm ? (
          <button
            onClick={() => setShowConfirm(true)}
            className="flex items-center gap-1.5 p-1 text-lg font-medium
                       text-gray-600 bg-red-50 dark:bg-transparent rounded-lg hover:bg-red-100 dark:hover:bg-transparent 
                       transition-colors ml-auto hover:text-red-500"
          >
            <MdDeleteForever />
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
