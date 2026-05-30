//components/notifications/NotificationBell.tsx

"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";

interface Notification {
  id: string;
  type: string;
  status: string;
  reference_id: string | null;
  created_at: string;
  sender: {
    first_name: string;
    last_name: string | null;
    avatar_url: string | null;
  } | null;
}

export default function NotificationBell({
  role,
}: {
  role: "patient" | "doctor";
}) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [responding, setResponding] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (res.ok) {
        setNotifications(data.notifications ?? []);
        setUnreadCount(data.unreadCount ?? 0);
      }
    } catch {}
  };

  // Initial fetch + poll every 30s
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(interval);
  }, []);

  // Mark all read when panel opens
  useEffect(() => {
    if (open && unreadCount > 0) {
      fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationIds: [] }),
      }).then(() => setUnreadCount(0));
    }
  }, [open]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleRespond = async (
    notifId: string,
    requestId: string,
    action: "approve" | "deny",
  ) => {
    setResponding(notifId);
    try {
      const res = await fetch("/api/access/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action }),
      });
      const data = await res.json();
      if (res.ok) {
        fetchNotifications();
        router.refresh();
      } else {
        alert(data.error ?? "Something went wrong.");
      }
    } finally {
      setResponding(null);
    }
  };

  const formatTime = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });
  };

  const getText = (n: Notification) => {
    const name = n.sender
      ? [n.sender.first_name, n.sender.last_name].filter(Boolean).join(" ")
      : "Someone";
    switch (n.type) {
      case "access_request":
        return `Dr. ${name} has requested access to your medical records`;
      case "access_approved":
        return `${name} approved your access request`;
      case "access_denied":
        return `${name} declined your access request`;
      default:
        return "New notification";
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen((p) => !p)}
        className="relative p-2 rounded-lg text-gray-500 hover:text-gray-700
                   hover:bg-gray-100 transition-colors"
      >
        <Bell className="h-8" />
        {unreadCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full
                           bg-red-500 text-white text-[10px] font-bold
                           flex items-center justify-center"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl
                        shadow-lg border border-gray-100 overflow-hidden z-50"
        >
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900">
              Notifications
            </span>
            {notifications.length > 0 && (
              <button
                onClick={() =>
                  router.push(
                    role === "patient"
                      ? "/patient/notifications"
                      : "/doctor/notifications",
                  )
                }
                className="text-xs text-blue-600 hover:underline"
              >
                View all
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-3xl mb-2">🔔</p>
                <p className="text-sm text-gray-400">
                  {role === "patient"
                    ? "No Notification Yet"
                    : "No Notifications Yet Doctor!"}
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 border-b border-gray-50 last:border-0
                    ${n.status === "unread" ? "bg-blue-50/50" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-8 h-8 rounded-full bg-blue-100 shrink-0
                                    flex items-center justify-center overflow-hidden"
                    >
                      {n.sender?.avatar_url ? (
                        <img
                          src={n.sender.avatar_url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-semibold text-blue-600">
                          {n.sender?.first_name?.[0] ?? "?"}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-700 leading-relaxed">
                        {getText(n)}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {formatTime(n.created_at)}
                      </p>
                      {n.type === "access_request" &&
                        role === "patient" &&
                        n.reference_id && (
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() =>
                                handleRespond(n.id, n.reference_id!, "approve")
                              }
                              disabled={!!responding}
                              className="px-3 py-1 bg-blue-600 text-white text-xs
                                       rounded-lg hover:bg-blue-700 transition-colors
                                       disabled:opacity-50"
                            >
                              {responding === n.id
                                ? "Processing..."
                                : "Approve"}
                            </button>
                            <button
                              onClick={() =>
                                handleRespond(n.id, n.reference_id!, "deny")
                              }
                              disabled={!!responding}
                              className="px-3 py-1 bg-white text-gray-600 text-xs
                                       rounded-lg border border-gray-300 hover:bg-gray-50
                                       transition-colors disabled:opacity-50"
                            >
                              Deny
                            </button>
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
