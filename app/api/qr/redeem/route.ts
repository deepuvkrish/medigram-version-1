//app/api/qr/redeem/route.ts
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

    const { data: profile } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "doctor")
      return NextResponse.json(
        { error: "Only doctors can redeem QR codes" },
        { status: 403 },
      );

    const { token } = await request.json();
    if (!token)
      return NextResponse.json({ error: "token is required" }, { status: 400 });

    // Validate token
    const { data: qrToken } = await adminClient
      .from("qr_tokens")
      .select("*")
      .eq("token", token)
      .single();

    if (!qrToken)
      return NextResponse.json({ error: "Invalid QR code" }, { status: 404 });
    if (qrToken.used_at)
      return NextResponse.json(
        { error: "This QR code has already been used" },
        { status: 400 },
      );
    if (new Date(qrToken.expires_at) < new Date())
      return NextResponse.json(
        { error: "This QR code has expired" },
        { status: 400 },
      );

    // Get patient records
    const { data: records } = await adminClient
      .from("medical_records")
      .select("id")
      .eq("owner_id", qrToken.patient_id)
      .eq("is_deleted", false);

    if (!records || records.length === 0)
      return NextResponse.json(
        { error: "Patient has no records to share" },
        { status: 400 },
      );

    // Grant access
    await adminClient.from("record_access").insert(
      records.map((r) => ({
        record_id: r.id,
        user_id: user.id,
        granted_at: new Date().toISOString(),
        expires_at: qrToken.expires_at,
        status: "active",
      })),
    );

    // Mark token used
    await adminClient
      .from("qr_tokens")
      .update({ used_at: new Date().toISOString() })
      .eq("id", qrToken.id);

    // Increment patient share counter
    const { data: sub } = await adminClient
      .from("subscriptions")
      .select("tier, share_count_this_month, share_reset_at")
      .eq("id", qrToken.patient_id)
      .single();

    if (sub) {
      const now = new Date();
      const shouldReset =
        !sub.share_reset_at ||
        new Date(sub.share_reset_at).getMonth() !== now.getMonth();
      await adminClient
        .from("subscriptions")
        .update({
          share_count_this_month: shouldReset
            ? 1
            : (sub.share_count_this_month ?? 0) + 1,
          share_reset_at: shouldReset ? now.toISOString() : sub.share_reset_at,
          updated_at: now.toISOString(),
        })
        .eq("id", qrToken.patient_id);
    }

    return NextResponse.json({
      success: true,
      patientId: qrToken.patient_id,
      expiresAt: qrToken.expires_at,
    });
  } catch (err) {
    console.error("qr redeem error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
