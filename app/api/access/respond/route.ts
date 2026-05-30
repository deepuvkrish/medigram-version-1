//app/api/access/respond/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import { sendAccessApprovedEmail, sendAccessDeniedEmail } from "@/lib/email";
import {
  FREE_EXPIRY_HOURS,
  PRO_EXPIRY_HOURS,
  FREE_SHARE_LIMIT,
} from "@/lib/constants";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    const { requestId, action } = await request.json();
    if (!requestId || !["approve", "deny"].includes(action))
      return NextResponse.json(
        { error: "requestId and action required" },
        { status: 400 },
      );

    const { data: accessRequest } = await adminClient
      .from("access_requests")
      .select("*")
      .eq("id", requestId)
      .single();

    if (!accessRequest)
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    if (accessRequest.patient_id !== user.id)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (accessRequest.status !== "pending")
      return NextResponse.json(
        { error: "Request is no longer pending" },
        { status: 400 },
      );

    const [patientRes, doctorRes, doctorExtRes, subRes] = await Promise.all([
      adminClient
        .from("profiles")
        .select("first_name, last_name, email")
        .eq("id", user.id)
        .single(),
      adminClient
        .from("profiles")
        .select("first_name, last_name, email")
        .eq("id", accessRequest.doctor_id)
        .single(),
      adminClient
        .from("doctor_profiles")
        .select("doctor_code")
        .eq("id", accessRequest.doctor_id)
        .single(),
      adminClient
        .from("subscriptions")
        .select("tier, share_count_this_month, share_reset_at")
        .eq("id", user.id)
        .single(),
    ]);

    const patientName = [
      patientRes.data?.first_name,
      patientRes.data?.last_name,
    ]
      .filter(Boolean)
      .join(" ");
    const doctorName = [doctorRes.data?.first_name, doctorRes.data?.last_name]
      .filter(Boolean)
      .join(" ");

    if (action === "deny") {
      await adminClient
        .from("access_requests")
        .update({ status: "denied", responded_at: new Date().toISOString() })
        .eq("id", requestId);

      await adminClient.from("notifications").insert({
        recipient_id: accessRequest.doctor_id,
        sender_id: user.id,
        type: "access_denied",
        status: "unread",
        reference_id: requestId,
      });

      sendAccessDeniedEmail({
        doctorEmail: doctorRes.data?.email ?? "",
        doctorName,
        patientName,
      });

      return NextResponse.json({ success: true, action: "denied" });
    }

    // APPROVE — check share limit
    const sub = subRes.data;
    const tier = sub?.tier ?? "free";
    const now = new Date();

    if (tier === "free") {
      const shouldReset =
        !sub?.share_reset_at ||
        new Date(sub.share_reset_at).getMonth() !== now.getMonth();
      const count = shouldReset ? 0 : (sub?.share_count_this_month ?? 0);
      if (count >= FREE_SHARE_LIMIT)
        return NextResponse.json(
          {
            error: "Share limit reached. Upgrade to Pro for unlimited sharing.",
            code: "SHARE_LIMIT_EXCEEDED",
          },
          { status: 400 },
        );
    }

    const expiryHours = tier === "pro" ? PRO_EXPIRY_HOURS : FREE_EXPIRY_HOURS;
    const expiresAt = new Date(
      Date.now() + expiryHours * 60 * 60 * 1000,
    ).toISOString();

    // Fetch patient records
    const { data: records } = await adminClient
      .from("medical_records")
      .select("id")
      .eq("owner_id", user.id)
      .eq("is_deleted", false);

    if (!records || records.length === 0)
      return NextResponse.json(
        { error: "You have no records to share." },
        { status: 400 },
      );

    // Create record_access rows
    await adminClient.from("record_access").insert(
      records.map((r) => ({
        record_id: r.id,
        user_id: accessRequest.doctor_id,
        granted_at: now.toISOString(),
        expires_at: expiresAt,
        status: "active",
      })),
    );

    // Update request status
    await adminClient
      .from("access_requests")
      .update({ status: "approved", responded_at: now.toISOString() })
      .eq("id", requestId);

    // Increment share counter
    const shouldReset =
      !sub?.share_reset_at ||
      new Date(sub.share_reset_at).getMonth() !== now.getMonth();

    await adminClient
      .from("subscriptions")
      .update({
        share_count_this_month: shouldReset
          ? 1
          : (sub?.share_count_this_month ?? 0) + 1,
        share_reset_at: shouldReset ? now.toISOString() : sub?.share_reset_at,
        updated_at: now.toISOString(),
      })
      .eq("id", user.id);

    // Notify doctor
    await adminClient.from("notifications").insert({
      recipient_id: accessRequest.doctor_id,
      sender_id: user.id,
      type: "access_approved",
      status: "unread",
      reference_id: requestId,
    });

    sendAccessApprovedEmail({
      doctorEmail: doctorRes.data?.email ?? "",
      doctorName,
      patientName,
      patientCode: doctorExtRes.data?.doctor_code ?? "",
      expiresAt,
    });

    return NextResponse.json({ success: true, action: "approved", expiresAt });
  } catch (err) {
    console.error("access respond error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
