import { NextResponse, type NextRequest } from "next/server";
import { adminClient } from "@/lib/supabase/admin";

// ============================================================
// POST /api/auth/complete-profile
//
// Called immediately after supabase.auth.signUp() in the
// signup forms. Saves fields that the database trigger
// can't access (form fields not in raw_user_meta_data).
//
// For patients: username, country, state, city, pincode
// For doctors: city (specialty and hospital_name go via trigger)
//
// Uses adminClient (service role) to bypass RLS —
// the user's session isn't confirmed yet at this point.
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, role, ...fields } = body;

    // Basic validation — userId and role are required.
    if (!userId || !role) {
      return NextResponse.json(
        { error: "userId and role are required" },
        { status: 400 },
      );
    }

    if (role === "patient") {
      // Update patient_profiles with registration fields.
      // The trigger already created the row — we're updating it.
      const { error } = await adminClient
        .from("patient_profiles")
        .update({
          username: fields.username ?? null,
          country: fields.country ?? null,
          state: fields.state ?? null,
          pincode: fields.pincode ?? null,
        })
        .eq("id", userId);

      if (error) {
        console.error("patient_profiles update error:", error);
        return NextResponse.json(
          { error: "Failed to save patient profile" },
          { status: 500 },
        );
      }

      // Also update profiles.city for patients.
      if (fields.city) {
        await adminClient
          .from("profiles")
          .update({ city: fields.city })
          .eq("id", userId);
      }
    }

    if (role === "doctor") {
      // For doctors, just update profiles.city.
      // specialty and hospital_name were passed via metadata
      // and inserted by the trigger into doctor_profiles already.
      if (fields.city) {
        const { error } = await adminClient
          .from("profiles")
          .update({ city: fields.city })
          .eq("id", userId);

        if (error) {
          console.error("profiles city update error:", error);
          return NextResponse.json(
            { error: "Failed to save doctor profile" },
            { status: 500 },
          );
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("complete-profile error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
