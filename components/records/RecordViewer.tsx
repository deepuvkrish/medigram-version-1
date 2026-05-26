// components/records/RecordViewer.tsx

"use client";

import { useEffect } from "react";

// ============================================================
// RecordViewer — modal overlay for viewing a record.
// Supports PDF (iframe) and image display.
// Closes on backdrop click or Escape key.
// ============================================================

interface Props {
  url: string;
  type: "pdf" | "image";
  title: string;
  onClose: () => void;
}

export default function RecordViewer({ url, type, title, onClose }: Props) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Prevent body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm
                 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl
                   max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        // stopPropagation prevents clicks inside modal from closing it
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <p className="text-sm font-medium text-gray-900 truncate pr-4">
            {title}
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-3 py-1.5 bg-gray-100 text-gray-600
                         rounded-lg hover:bg-gray-200 transition-colors"
            >
              Open in new tab ↗
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto min-h-0">
          {type === "pdf" ? (
            <iframe
              src={url}
              className="w-full h-full min-h-[70vh]"
              title={title}
            />
          ) : (
            <div className="flex items-center justify-center p-4 min-h-[50vh]">
              <img
                src={url}
                alt={title}
                className="max-w-full max-h-[75vh] object-contain rounded-lg"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
