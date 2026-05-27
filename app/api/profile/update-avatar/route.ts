//app/api/profile/update-avatar/route.ts

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";

// ============================================================
// POST /api/profile/update-avatar
// Saves the avatar URL to profiles.avatar_url after upload.
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

    const { avatarUrl } = await request.json();
    if (!avatarUrl) {
      return NextResponse.json(
        { error: "avatarUrl is required" },
        { status: 400 },
      );
    }

    const { error } = await adminClient
      .from("profiles")
      .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
      .eq("id", user.id);

    if (error) {
      console.error("avatar update error:", error);
      return NextResponse.json(
        { error: "Failed to save avatar" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("update-avatar error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
