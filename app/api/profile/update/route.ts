// app / api / profile / update / route.ts;
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";

// ============================================================
// POST /api/profile/update
// Updates profiles and the role extension table.
// Uses the logged-in user's session to get their ID —
// they can only update their own profile.
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the logged-in user from session.
    // Never trust the client to send their own userId —
    // always derive it from the verified session.
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    const body = await request.json();
    const { role, ...fields } = body;

    // Update profiles table — fields common to both roles
    const { error: profileError } = await adminClient
      .from("profiles")
      .update({
        first_name: fields.first_name ?? null,
        last_name: fields.last_name ?? null,
        phone: fields.phone || null,
        city: fields.city ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (profileError) {
      console.error("profile update error:", profileError);
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 },
      );
    }

    // Update role-specific extension table
    if (role === "patient") {
      const { error: patientError } = await adminClient
        .from("patient_profiles")
        .update({
          state: fields.state || null,
          country: fields.country || null,
          pincode: fields.pincode || null,
          date_of_birth: fields.date_of_birth || null,
        })
        .eq("id", user.id);

      if (patientError) {
        console.error("patient_profiles update error:", patientError);
        return NextResponse.json(
          { error: "Failed to update patient profile" },
          { status: 500 },
        );
      }
    }

    if (role === "doctor") {
      const { error: doctorError } = await adminClient
        .from("doctor_profiles")
        .update({
          hospital_name: fields.hospital_name || null,
        })
        .eq("id", user.id);

      if (doctorError) {
        console.error("doctor_profiles update error:", doctorError);
        return NextResponse.json(
          { error: "Failed to update doctor profile" },
          { status: 500 },
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("profile update error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
