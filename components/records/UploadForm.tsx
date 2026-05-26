// components/records/UploadForm.tsx

"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { RECORD_CATEGORIES, SPECIALTIES } from "@/lib/constants";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

// ============================================================
// UploadForm — medical record upload form.
// Sends multipart/form-data to /api/records/upload.
// Client-side validation runs before the API call.
// ============================================================

const CATEGORY_OPTIONS = [
  { value: "prescription", label: "Prescription" },
  { value: "lab_result", label: "Lab Result" },
  { value: "scan", label: "Scan / Imaging" },
  { value: "bill", label: "Medical Bill" },
  { value: "other", label: "Other" },
];

const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/heic",
  "image/heif",
];

const MAX_SIZE = 20 * 1024 * 1024; // 20MB

export default function UploadForm() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [recordDate, setRecordDate] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (selected: File | null) => {
    if (!selected) return;
    setError(null);

    if (!ALLOWED_TYPES.includes(selected.type)) {
      setError("File type not allowed. Use PDF, JPG, PNG, or HEIC.");
      return;
    }
    if (selected.size > MAX_SIZE) {
      setError("File too large. Maximum size is 20MB.");
      return;
    }

    setFile(selected);
    // Pre-fill title with filename (without extension) if title is empty
    if (!title) {
      const nameWithoutExt = selected.name.replace(/\.[^/.]+$/, "");
      setTitle(nameWithoutExt.replace(/[_-]/g, " "));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFileSelect(dropped);
  };

  const handleSubmit = async () => {
    setError(null);

    if (!file) {
      setError("Please select a file.");
      return;
    }
    if (!title.trim()) {
      setError("Please enter a title.");
      return;
    }
    if (!category) {
      setError("Please select a category.");
      return;
    }

    setUploading(true);

    try {
      // Build FormData — required for file uploads
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title.trim());
      formData.append("category", category);
      formData.append("record_date", recordDate);

      const res = await fetch("/api/records/upload", {
        method: "POST",
        body: formData,
        // Do NOT set Content-Type header manually for FormData.
        // The browser sets it automatically with the correct boundary.
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Upload failed. Please try again.");
        return;
      }

      // Success — go back to records list
      router.push("/patient/records");
      router.refresh();
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 max-w-lg">
      {/* ── Drop zone ─────────────────────────────────────── */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
          transition-colors
          ${
            dragOver
              ? "border-blue-400 bg-blue-50"
              : file
                ? "border-green-400 bg-green-50"
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
          }
        `}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.heic,.heif"
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
        />

        {file ? (
          <div>
            <p className="text-2xl mb-2">
              {file.type === "application/pdf" ? "📄" : "🖼️"}
            </p>
            <p className="text-sm font-medium text-gray-900">{file.name}</p>
            <p className="text-xs text-gray-400 mt-1">
              {(file.size / (1024 * 1024)).toFixed(2)} MB
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
              }}
              className="mt-2 text-xs text-red-500 hover:underline"
            >
              Remove
            </button>
          </div>
        ) : (
          <div>
            <p className="text-3xl mb-3">📁</p>
            <p className="text-sm font-medium text-gray-700">
              Drop your file here or click to browse
            </p>
            <p className="text-xs text-gray-400 mt-1">
              PDF, JPG, PNG, HEIC — max 20MB
            </p>
          </div>
        )}
      </div>

      {/* ── Metadata fields ───────────────────────────────── */}
      <Input
        label="Record name"
        placeholder="e.g. Blood test March 2025"
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <Select
        label="Category"
        required
        placeholder="Select a category"
        options={CATEGORY_OPTIONS}
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />

      <Input
        label="Date of record"
        type="date"
        hint="When was this record created? (optional)"
        value={recordDate}
        onChange={(e) => setRecordDate(e.target.value)}
      />

      {/* ── Error ─────────────────────────────────────────── */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* ── Actions ───────────────────────────────────────── */}
      <div className="flex gap-3">
        <Button
          type="button"
          onClick={handleSubmit}
          isLoading={uploading}
          className="flex-1"
        >
          {uploading ? "Uploading..." : "Upload record"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
          disabled={uploading}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
