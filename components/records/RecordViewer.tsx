// components/records/RecordViewer.tsx

"use client";

import { useEffect, useState } from "react";
import ImageSkeleton from "../ui/ImageSkeleton";
// ============================================================
// RecordViewer — modal overlay for viewing a record.
// Supports PDF (iframe) and image display.
// Closes on backdrop click or Escape key.
// ============================================================
import { FaRegWindowRestore } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";

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

  useEffect(() => {
    setImageLoading(true);
  }, [url]);
  const [imageLoading, setImageLoading] = useState(true);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full h-full max-w-4xl
                   max-h-screen flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        // stopPropagation prevents clicks inside modal from closing it
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-(--cornBlue) px-5 py-4 border-b border-blue-400 shrink-0">
          <p className="text-lg font-medium text-white truncate pr-4">
            {title}
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-xs px-3 py-1.5 bg-blue-100 text-gray-600
                         rounded-lg hover:bg-(--linkActive) hover:text-white transition-colors"
            >
              <FaRegWindowRestore className="mr-1" /> Open in new tab ↗
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-100 hover:text-red-600 hover:bg-gray-100 transition-colors"
            >
              <IoClose />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto min-h-0">
          {type === "pdf" ? (
            <iframe
              src={url}
              className="w-full h-full min-h-[90vh]"
              title={title}
            />
          ) : (
            <div className="flex items-center justify-center p-4 min-h-[50vh]">
              {/* Skeleton */}
              {imageLoading && (
                <div className="absolute inset-4">
                  <ImageSkeleton />
                </div>
              )}

              <img
                src={url}
                alt={title}
                onLoad={() => setImageLoading(false)}
                onError={() => setImageLoading(false)}
                className={`max-w-full max-h-[75vh] object-contain rounded-lg transition-opacity duration-300
                    ${imageLoading ? "opacity-0" : "opacity-100"}`}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
