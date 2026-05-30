//components/ui/AvatarUpload.tsx

"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { MdEdit } from "react-icons/md";
// ============================================================
// AvatarUpload — profile photo upload component.
// Uploads to Supabase Storage 'avatars' bucket.
// Calls onUpload with the public URL after successful upload.
// ============================================================

interface Props {
  currentUrl: string | null;
  userId: string;
  role: "patient" | "doctor";
  displayName: string;
  onUpload: (url: string) => void;
}

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
];

export default function AvatarUpload({
  currentUrl,
  userId,
  role,
  displayName,
  onUpload,
}: Props) {
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const displayUrl = preview || currentUrl;

  const handleFile = async (file: File) => {
    setError(null);

    if (!ALLOWED.includes(file.type)) {
      setError("Use JPG, PNG, WebP, or HEIC.");
      return;
    }
    if (file.size > MAX_SIZE) {
      setError("File must be under 5MB.");
      return;
    }

    // Show preview immediately before upload
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    setUploading(true);

    try {
      const ext = file.name.split(".").pop() ?? "jpg";
      const filePath = `${userId}/avatar.${ext}`;
      // Always same filename per user — overwrites previous avatar

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type,
        });

      if (uploadError) {
        setError("Upload failed. Please try again.");
        setPreview(null);
        return;
      }

      // Get public URL — avatars bucket is public
      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

      // Add cache-busting param so browser shows new image immediately
      const publicUrl = `${data.publicUrl}?t=${Date.now()}`;

      // Save URL to profiles table via API
      const res = await fetch("/api/profile/update-avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: data.publicUrl }),
      });

      if (!res.ok) {
        setError("Failed to save avatar. Please try again.");
        return;
      }

      onUpload(publicUrl);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      {/* Avatar preview */}
      <div className="relative shrink-0">
        <div
          className={` ${displayUrl && displayUrl !== "null" ? "p-0" : "p-2.5"} w-16 h-16 rounded-full overflow-hidden bg-(--cornBlue)
    flex items-center justify-center border-2 border-white
    shadow-sm`}
        >
          {displayUrl && displayUrl !== "null" ? (
            <img
              src={displayUrl}
              alt={displayName}
              className="w-full h-full object-cover"
            />
          ) : role === "doctor" ? (
            <img
              src="/images/icons/doctor.svg"
              alt="Default doctor avatar"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <img
              src="/images/icons/user3.svg"
              alt="user image"
              className="w-full h-full object-contain"
            />
          )}
        </div>

        {/* Upload button overlay */}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full
                     bg-blue-600 text-white flex items-center justify-center
                     hover:bg-blue-700 transition-colors shadow-sm
                     disabled:opacity-50 cursor-pointer "
          aria-label="Upload profile photo"
        >
          {uploading ? (
            <svg
              className="w-3 h-3 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          ) : (
            <MdEdit />
          )}
        </button>
      </div>

      {/* Text info */}
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Profile photo
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          JPG, PNG, WebP or HEIC — max 5MB
        </p>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/heic"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = ""; // reset so same file can be re-selected
        }}
      />
    </div>
  );
}
