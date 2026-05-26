// app/api/records/upload/route.ts

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import {
  FREE_STORAGE_CAP,
  PRO_STORAGE_CAP,
  RECORD_CATEGORIES,
} from "@/lib/constants";

// ============================================================
// POST /api/records/upload
//
// Handles medical record file upload. Flow:
//   1. Verify session
//   2. Parse multipart form data (file + metadata)
//   3. Validate file type and size
//   4. Check storage cap — reject if would exceed limit
//   5. Upload file to Supabase Storage
//   6. Insert row into medical_records
//   7. Update subscriptions.storage_used_bytes
//
// Uses FormData not JSON — files can't be sent as JSON.
// ============================================================

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/heic",
  "image/heif",
];

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB in bytes

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Step 1: Verify session
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    // Confirm user is a patient — doctors don't upload records
    const { data: profile } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "patient") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Step 2: Parse multipart form data
    // FormData is used because JSON can't carry binary file data.
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const title = formData.get("title") as string | null;
    const category = formData.get("category") as string | null;
    const recordDate = formData.get("record_date") as string | null;

    // Step 3: Validate inputs
    if (!file || !title?.trim() || !category) {
      return NextResponse.json(
        { error: "File, title, and category are required" },
        { status: 400 },
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "File type not allowed. Use PDF, JPG, PNG, or HEIC." },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 20MB." },
        { status: 400 },
      );
    }

    if (!RECORD_CATEGORIES.includes(category as any)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    // Step 4: Check storage cap
    const { data: subscription } = await adminClient
      .from("subscriptions")
      .select("tier, storage_used_bytes")
      .eq("id", user.id)
      .single();

    if (!subscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 500 },
      );
    }

    const cap =
      subscription.tier === "pro" ? PRO_STORAGE_CAP : FREE_STORAGE_CAP;
    const currentUsage = subscription.storage_used_bytes ?? 0;

    if (currentUsage + file.size > cap) {
      const capMB = cap / (1024 * 1024);
      return NextResponse.json(
        {
          error: `Storage limit reached. Your ${subscription.tier} plan includes ${capMB}MB.`,
          code: "STORAGE_LIMIT_EXCEEDED",
        },
        { status: 400 },
      );
    }

    // Step 5: Upload to Supabase Storage
    // Path: {user_id}/{timestamp}_{sanitised_filename}
    // Timestamp prefix prevents collisions if same filename uploaded twice.
    const timestamp = Date.now();
    const sanitisedName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = `${user.id}/${timestamp}_${sanitisedName}`;

    const fileBuffer = await file.arrayBuffer();

    const { error: storageError } = await adminClient.storage
      .from("medical-records")
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
        // upsert: false means if the path already exists, fail.
        // The timestamp prefix makes collisions essentially impossible.
      });

    if (storageError) {
      console.error("storage upload error:", storageError);
      return NextResponse.json(
        { error: "Failed to upload file. Please try again." },
        { status: 500 },
      );
    }

    // Step 6: Insert record row
    const { data: record, error: insertError } = await adminClient
      .from("medical_records")
      .insert({
        owner_id: user.id,
        category: category,
        title: title.trim(),
        file_url: filePath,
        file_size_bytes: file.size,
        record_date: recordDate || null,
        is_deleted: false,
      })
      .select("id")
      .single();

    if (insertError) {
      // If DB insert fails, clean up the uploaded file
      await adminClient.storage.from("medical-records").remove([filePath]);
      console.error("record insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to save record. Please try again." },
        { status: 500 },
      );
    }

    // Step 7: Update storage usage
    const { error: updateError } = await adminClient
      .from("subscriptions")
      .update({
        storage_used_bytes: currentUsage + file.size,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      // Non-fatal — record was saved successfully.
      // Storage counter is slightly off but record is intact.
      // Log it for manual correction.
      console.error("storage usage update error:", updateError);
    }

    return NextResponse.json({ success: true, recordId: record.id });
  } catch (err) {
    console.error("upload error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
