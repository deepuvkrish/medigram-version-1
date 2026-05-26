// app/api/records/delete/route.ts

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";

// ============================================================
// POST /api/records/delete
//
// Soft-deletes a medical record. Flow:
//   1. Verify session
//   2. Confirm the record belongs to the requesting user
//   3. Set is_deleted = true
//   4. Subtract file_size_bytes from subscriptions.storage_used_bytes
//
// File stays in storage — hard purge handled manually for now.
// Storage count is updated immediately so cap is recalculated.
// ============================================================

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

    // Fetch the record — confirms it exists and belongs to this user
    const { data: record, error: fetchError } = await adminClient
      .from("medical_records")
      .select("id, owner_id, file_size_bytes, is_deleted")
      .eq("id", recordId)
      .single();

    if (fetchError || !record) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    // Security check — user can only delete their own records
    if (record.owner_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (record.is_deleted) {
      return NextResponse.json(
        { error: "Record is already deleted" },
        { status: 400 },
      );
    }

    // Soft delete — mark as deleted, don't touch the file yet
    const { error: deleteError } = await adminClient
      .from("medical_records")
      .update({ is_deleted: true })
      .eq("id", recordId);

    if (deleteError) {
      console.error("soft delete error:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete record" },
        { status: 500 },
      );
    }

    // Update storage usage — subtract this file's size
    const { data: subscription } = await adminClient
      .from("subscriptions")
      .select("storage_used_bytes")
      .eq("id", user.id)
      .single();

    if (subscription) {
      const newUsage = Math.max(
        0,
        (subscription.storage_used_bytes ?? 0) - record.file_size_bytes,
      );
      // Math.max(0, ...) prevents negative storage values if something
      // is already inconsistent

      await adminClient
        .from("subscriptions")
        .update({
          storage_used_bytes: newUsage,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("delete error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
