// app/api/records/signed-url/route.ts

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";

// ============================================================
// POST /api/records/signed-url
//
// Generates a temporary signed URL to view a medical record.
// The URL expires after 60 minutes — cannot be shared permanently.
//
// Flow:
//   1. Verify session
//   2. Confirm the record belongs to the user (or they have access)
//   3. Generate signed URL via Supabase Storage
//   4. Return URL to client
// ============================================================

const SIGNED_URL_EXPIRY = 60 * 60; // 60 minutes in seconds

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    const body = await request.json();
    const { recordId } = body;

    if (!recordId) {
      return NextResponse.json(
        { error: "recordId is required" },
        { status: 400 },
      );
    }

    // Fetch the record
    const { data: record, error: fetchError } = await adminClient
      .from("medical_records")
      .select("id, owner_id, file_url, is_deleted")
      .eq("id", recordId)
      .single();

    if (fetchError || !record) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    // Security: only the owner can view their own records.
    // Phase 3 will extend this to allow doctors with approved access.
    if (record.owner_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (record.is_deleted) {
      return NextResponse.json(
        { error: "Record has been deleted" },
        { status: 404 },
      );
    }

    // Generate signed URL — valid for 60 minutes
    const { data: signedData, error: signedError } = await adminClient.storage
      .from("medical-records")
      .createSignedUrl(record.file_url, SIGNED_URL_EXPIRY);

    if (signedError || !signedData?.signedUrl) {
      console.error("signed URL error:", signedError);
      return NextResponse.json(
        { error: "Failed to generate view URL" },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: signedData.signedUrl });
  } catch (err) {
    console.error("signed-url error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
