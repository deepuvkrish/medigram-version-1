//app/api/qr/generate/route.ts

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import {
  FREE_EXPIRY_HOURS,
  PRO_EXPIRY_HOURS,
  FREE_SHARE_LIMIT,
} from "@/lib/constants";
import { randomBytes } from "crypto";

export async function POST() {
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

    if (!profile || profile.role !== "patient")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // Check share limit
    const { data: sub } = await adminClient
      .from("subscriptions")
      .select("tier, share_count_this_month, share_reset_at")
      .eq("id", user.id)
      .single();

    const tier = sub?.tier ?? "free";

    if (tier === "free") {
      const now = new Date();
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

    const token = randomBytes(32).toString("hex");
    const expiryHours = tier === "pro" ? PRO_EXPIRY_HOURS : FREE_EXPIRY_HOURS;
    const expiresAt = new Date(
      Date.now() + expiryHours * 60 * 60 * 1000,
    ).toISOString();

    const { error } = await adminClient.from("qr_tokens").insert({
      patient_id: user.id,
      token,
      expires_at: expiresAt,
    });

    if (error) {
      console.error("qr token insert error:", error);
      return NextResponse.json(
        { error: "Failed to generate QR code" },
        { status: 500 },
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const redeemUrl = `${appUrl}/doctor/scan?token=${token}`;

    return NextResponse.json({ token, redeemUrl, expiresAt });
  } catch (err) {
    console.error("qr generate error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
