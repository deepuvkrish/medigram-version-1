//app/api/records/shared/route.ts

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";

// GET /api/records/shared?patientId=xxx
// Doctor fetches records they have active access to for a patient.

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    const { data: profile } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "doctor")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patientId");
    if (!patientId)
      return NextResponse.json(
        { error: "patientId required" },
        { status: 400 },
      );

    // Get all active access rows for this doctor
    const { data: accessRows } = await adminClient
      .from("record_access")
      .select("record_id, expires_at")
      .eq("user_id", user.id)
      .eq("status", "active")
      .gt("expires_at", new Date().toISOString());

    if (!accessRows || accessRows.length === 0)
      return NextResponse.json({ records: [], hasAccess: false });

    const recordIds = accessRows.map((a) => a.record_id);

    // Fetch records belonging to this patient only
    const { data: records } = await adminClient
      .from("medical_records")
      .select("*")
      .in("id", recordIds)
      .eq("owner_id", patientId)
      .eq("is_deleted", false)
      .order("created_at", { ascending: false });

    // Earliest expiry for display
    const expiresAt = accessRows
      .map((a) => new Date(a.expires_at))
      .sort((a, b) => a.getTime() - b.getTime())[0]
      ?.toISOString();

    return NextResponse.json({
      records: records ?? [],
      hasAccess: (records ?? []).length > 0,
      expiresAt,
    });
  } catch (err) {
    console.error("shared records error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
