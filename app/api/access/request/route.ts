//app/api/access/request/route.ts

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import { sendAccessRequestEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    // Verify doctor
    const { data: doctorProfile } = await adminClient
      .from("profiles")
      .select("role, first_name, last_name, email")
      .eq("id", user.id)
      .single();

    if (!doctorProfile || doctorProfile.role !== "doctor")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { data: doctorExt } = await adminClient
      .from("doctor_profiles")
      .select("doctor_code, specialty")
      .eq("id", user.id)
      .single();

    const body = await request.json();
    const { patientId } = body;
    if (!patientId)
      return NextResponse.json(
        { error: "patientId is required" },
        { status: 400 },
      );

    // Verify patient exists
    const { data: patientProfile } = await adminClient
      .from("profiles")
      .select("id, role, first_name, last_name, email")
      .eq("id", patientId)
      .single();

    if (!patientProfile || patientProfile.role !== "patient")
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });

    // Prevent duplicate pending requests
    const { data: existing } = await adminClient
      .from("access_requests")
      .select("id")
      .eq("doctor_id", user.id)
      .eq("patient_id", patientId)
      .eq("status", "pending")
      .maybeSingle();

    if (existing)
      return NextResponse.json(
        { error: "You already have a pending request for this patient." },
        { status: 400 },
      );

    // Insert access request
    const { data: accessRequest, error: reqError } = await adminClient
      .from("access_requests")
      .insert({
        doctor_id: user.id,
        patient_id: patientId,
        status: "pending",
        requested_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (reqError) {
      console.error("access request insert error:", reqError);
      return NextResponse.json(
        { error: "Failed to send request" },
        { status: 500 },
      );
    }

    // Create in-app notification for patient
    await adminClient.from("notifications").insert({
      recipient_id: patientId,
      sender_id: user.id,
      type: "access_request",
      status: "unread",
      reference_id: accessRequest.id,
    });

    // Send email (non-blocking)
    const doctorName = [doctorProfile.first_name, doctorProfile.last_name]
      .filter(Boolean)
      .join(" ");
    const patientName = [patientProfile.first_name, patientProfile.last_name]
      .filter(Boolean)
      .join(" ");

    sendAccessRequestEmail({
      patientEmail: patientProfile.email,
      patientName,
      doctorName,
      doctorSpecialty: doctorExt?.specialty ?? "",
      doctorCode: doctorExt?.doctor_code ?? "",
    });

    return NextResponse.json({ success: true, requestId: accessRequest.id });
  } catch (err) {
    console.error("access request error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
