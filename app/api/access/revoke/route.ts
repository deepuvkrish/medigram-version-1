//app/api/access/revoke/route.ts

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    const { doctorId } = await request.json();
    if (!doctorId)
      return NextResponse.json(
        { error: "doctorId is required" },
        { status: 400 },
      );

    // Get patient's record IDs
    const { data: records } = await adminClient
      .from("medical_records")
      .select("id")
      .eq("owner_id", user.id)
      .eq("is_deleted", false);

    if (!records || records.length === 0)
      return NextResponse.json({ error: "No records found" }, { status: 404 });

    // Revoke all active access for this doctor on patient's records
    await adminClient
      .from("record_access")
      .update({ status: "revoked" })
      .eq("user_id", doctorId)
      .eq("status", "active")
      .in(
        "record_id",
        records.map((r) => r.id),
      );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("revoke error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
