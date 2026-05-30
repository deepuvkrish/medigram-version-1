// app/api/notifications/route.ts

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";

// GET — fetch notifications for logged-in user
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    const { data: notifications, error } = await adminClient
      .from("notifications")
      .select(
        `*, sender:profiles!notifications_sender_id_fkey(first_name, last_name, avatar_url)`,
      )
      .eq("recipient_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error)
      return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });

    const unreadCount = (notifications ?? []).filter(
      (n) => n.status === "unread",
    ).length;

    return NextResponse.json({
      notifications: notifications ?? [],
      unreadCount,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST — mark notifications as read
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    const { notificationIds } = await request.json();

    let query = adminClient
      .from("notifications")
      .update({ status: "read" })
      .eq("recipient_id", user.id)
      .eq("status", "unread");

    if (notificationIds?.length > 0) {
      query = query.in("id", notificationIds);
    }

    await query;
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
