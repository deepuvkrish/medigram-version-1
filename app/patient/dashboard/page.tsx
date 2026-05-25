import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FREE_STORAGE_CAP, FREE_SHARE_LIMIT } from "@/lib/constants";
import type { Metadata } from "next";
import { Crown } from "lucide-react";
export const metadata: Metadata = { title: "Dashboard" };

// ============================================================
// Patient Dashboard — server component.
// Fetches profile + subscription data directly on the server.
// No loading state needed — data is ready before page renders.
// ============================================================

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 MB";
  const mb = bytes / (1024 * 1024);
  return mb < 1 ? `${(bytes / 1024).toFixed(1)} KB` : `${mb.toFixed(1)} MB`;
}

function StorageBar({ used, cap }: { used: number; cap: number }) {
  const pct = Math.min((used / cap) * 100, 100);
  const color =
    pct >= 95 ? "bg-red-500" : pct >= 80 ? "bg-amber-400" : "bg-[#6495ed]";
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-500 mb-1.5">
        <span>{formatBytes(used)} used</span>
        <span>{formatBytes(cap)} total</span>
      </div>
      <div className="h-2 bg-white rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default async function PatientDashboard() {
  const supabase = await createClient();

  // Get logged-in user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Fetch profile and patient extension in parallel
  const [profileRes, patientRes, subRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("patient_profiles").select("*").eq("id", user.id).single(),
    supabase.from("subscriptions").select("*").eq("id", user.id).single(),
  ]);

  const profile = profileRes.data;
  const subscription = subRes.data;

  if (!profile) redirect("/auth/login");

  const firstName = profile.first_name ?? "there";
  const tier = subscription?.tier ?? "free";
  const storageUsed = subscription?.storage_used_bytes ?? 0;
  const storageCap = FREE_STORAGE_CAP;
  const shareCount = subscription?.share_count_this_month ?? 0;
  const sharesLeft = Math.max(FREE_SHARE_LIMIT - shareCount, 0);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="flex flex-col gap-6">
      {/* ── Welcome ─────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {greeting}, {firstName} 👋
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Here's an overview of your Medgram account.
        </p>
      </div>

      {/* ── Stats row ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Storage */}
        <div className="bg-[#001f4717] rounded-xl border border-gray-100 p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Storage</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium
              ${
                tier === "pro"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {tier === "pro" ? "Pro — 2GB" : "Free — 200MB"}
            </span>
          </div>
          <StorageBar used={storageUsed} cap={storageCap} />
        </div>

        {/* Shares */}
        <div className="bg-[#ffe9e9] rounded-xl border border-gray-100 p-4 flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-600">
            Shares this month
          </span>
          <div className="flex items-end gap-1.5 mt-1">
            <span className="text-3xl font-bold text-gray-900">
              {sharesLeft}
            </span>
            <span className="text-sm text-gray-400 mb-1">
              of {FREE_SHARE_LIMIT} remaining
            </span>
          </div>
          {sharesLeft === 0 && (
            <p className="text-xs text-amber-600 mt-1">
              Limit reached — resets on the 1st.
            </p>
          )}
        </div>

        {/* Subscription */}
        <div className="bg-[#ffeaf5] rounded-xl border border-gray-100 p-4 flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-600 flex items-center">
            <Crown className="mr-1 text-yellow-500" />
            Subscription
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`text-xl font-bold capitalize
              ${tier === "pro" ? "text-blue-600" : "text-gray-900"}`}
            >
              {tier}
            </span>
            {tier === "free" && (
              <span className="text-xs text-gray-400">· Upgrade for more</span>
            )}
          </div>
          {tier === "free" && (
            <button
              disabled
              className="mt-2 text-xs text-blue-600 text-left hover:underline
                         disabled:cursor-not-allowed disabled:opacity-50"
            >
              Upgrade to Pro →
            </button>
          )}
        </div>
      </div>

      {/* ── Quick actions ────────────────────────────────────── */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Quick actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ActionCard
            title="Upload a Record"
            description="Add prescriptions, lab results, scans or bills"
            icon="📄"
            badge="Phase 2"
          />
          <ActionCard
            title="View My Records"
            description="Browse and manage your medical history"
            icon="🗂️"
            disabled
            badge="Phase 2"
          />
          <ActionCard
            title="Share with Doctor"
            description="Send your records to a doctor securely"
            icon="🔗"
            disabled
            badge="Phase 2"
          />
          <ActionCard
            title="Find a Doctor"
            description="Search doctors by name or specialty"
            icon="🔍"
            disabled
            badge="Phase 2"
          />
        </div>
      </div>
    </div>
  );
}

function ActionCard({
  title,
  description,
  icon,
  disabled,
  badge,
}: {
  title: string;
  description: string;
  icon: string;
  disabled?: boolean;
  badge?: string;
}) {
  return (
    <div
      className={`bg-white 
       rounded-xl border border-gray-100 p-4
      flex items-start gap-3 group
      ${disabled ? "opacity-60 cursor-not-allowed" : "hover:border-[#1f3ab36b] hover:shadow-sm hover:shadow-[#0000006a] cursor-pointer"}
      transition-all
    `}
    >
      <span className="text-2xl">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={`${disabled ? "text-gray-500 " : "group-hover:text-[#1f3bb3] group-hover:text-[16px]"}   duration-500 text-gray-700 text-sm font-medium`}
          >
            {title}
          </span>
          {badge && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-400">
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
      </div>
    </div>
  );
}
