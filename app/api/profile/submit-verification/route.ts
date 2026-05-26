import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";

// ============================================================
// POST /api/profile/submit-verification
//
// Called when a doctor submits their MCI number for review.
// Flow:
//   1. Verify the user is logged in and is a doctor
//   2. Insert a new row in doctor_verifications with status 'pending'
//   3. If a previous row exists, update it instead of inserting
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Always derive user from session — never trust client-sent IDs
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    // Confirm this user is actually a doctor
    const { data: profile } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "doctor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { mci_number } = body;

    if (!mci_number?.trim()) {
      return NextResponse.json(
        { error: "MCI registration number is required" },
        { status: 400 },
      );
    }

    // Check if a verification row already exists for this doctor
    const { data: existing } = await adminClient
      .from("doctor_verifications")
      .select("id, status")
      .eq("doctor_id", user.id)
      .order("submitted_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing && existing.status === "pending") {
      // Already pending — don't allow duplicate submission
      return NextResponse.json(
        { error: "A verification request is already under review." },
        { status: 400 },
      );
    }

    // Insert a fresh verification row.
    // Each submission is a new row — full history preserved.
    const { error: insertError } = await adminClient
      .from("doctor_verifications")
      .insert({
        doctor_id: user.id,
        mci_number: mci_number.trim(),
        status: "pending",
        submitted_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error("verification insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to submit verification" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("submit-verification error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
