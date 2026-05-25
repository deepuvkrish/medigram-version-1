import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DOCTOR_CODE_PREFIX } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

// ============================================================
// Doctor Dashboard — server component.
// Shows DR- code, verification status, and quick actions.
// ============================================================

export default async function DoctorDashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [profileRes, doctorRes, verificationRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("doctor_profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("doctor_verifications")
      .select("*")
      .eq("doctor_id", user.id)
      .order("submitted_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const profile = profileRes.data;
  const doctor = doctorRes.data;
  const verification = verificationRes.data;

  if (!profile || !doctor) redirect("/auth/login");

  const displayName = profile.last_name
    ? `Dr. ${profile.last_name}`
    : `Dr. ${profile.first_name}`;
  const doctorCode = `${DOCTOR_CODE_PREFIX}${doctor.doctor_code}`;
  const isVerified = doctor.is_verified;
  const verifStatus = verification?.status ?? "unverified";

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="flex flex-col gap-6">
      {/* ── Welcome ─────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {greeting}, {displayName} 👋
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          {doctor.specialty} · {profile.city ?? "Location not set"}
        </p>
      </div>

      {/* ── DR- code card ───────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">
              Your Doctor ID
            </p>
            <p className="text-2xl font-bold text-gray-900 tracking-widest font-mono">
              {doctorCode}
            </p>
            <p className="text-xs text-gray-400 mt-1.5">
              Share this ID with patients so they can find and send you their
              records.
            </p>
          </div>
          {isVerified && (
            <span
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5
                             bg-green-50 text-green-700 rounded-full text-xs font-medium"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Verified
            </span>
          )}
        </div>

        {/* Copy button — client interaction, handled inline */}
        <CopyCodeButton code={doctorCode} />
      </div>

      {/* ── Verification status card ─────────────────────────── */}
      {!isVerified && (
        <div
          className={`rounded-xl border p-4 flex items-start gap-3
          ${
            verifStatus === "pending"
              ? "bg-amber-50 border-amber-200"
              : verifStatus === "rejected"
                ? "bg-red-50 border-red-200"
                : "bg-blue-50 border-blue-200"
          }`}
        >
          <div className="text-xl">
            {verifStatus === "pending"
              ? "⏳"
              : verifStatus === "rejected"
                ? "❌"
                : "🪪"}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-800">
              {verifStatus === "pending"
                ? "Verification under review"
                : verifStatus === "rejected"
                  ? "Verification rejected"
                  : "Get verified"}
            </p>
            <p className="text-xs text-gray-600 mt-0.5">
              {verifStatus === "pending"
                ? "We're reviewing your MCI certificate. This usually takes 1–2 business days."
                : verifStatus === "rejected"
                  ? "Your submission was rejected. Please update your MCI details from your profile and resubmit."
                  : "Upload your MCI registration certificate to get a verified badge on your profile."}
            </p>
            {verifStatus !== "pending" && (
              <a
                href="/doctor/profile"
                className="inline-block mt-2 text-xs font-medium text-blue-600 hover:underline"
              >
                {verifStatus === "rejected"
                  ? "Resubmit from Profile →"
                  : "Apply from Profile →"}
              </a>
            )}
          </div>
        </div>
      )}

      {/* ── Quick actions ────────────────────────────────────── */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Quick actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ActionCard
            title="View Patient Records"
            description="Access records shared with you by patients"
            icon="📋"
            disabled
            badge="Phase 3"
          />
          <ActionCard
            title="Notifications"
            description="Record access requests from patients"
            icon="🔔"
            disabled
            badge="Phase 3"
          />
        </div>
      </div>
    </div>
  );
}

// Copy button is a client component — needs browser API
function CopyCodeButton({ code }: { code: string }) {
  // We use a small inline script approach since this is inside
  // a server component. A proper solution uses a 'use client' wrapper.
  return (
    <button
      onClick={undefined}
      className="mt-3 text-xs text-blue-600 hover:underline"
      // Full copy functionality added when we make this a client component
    >
      Copy ID
    </button>
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
      className={`
      bg-white rounded-xl border border-gray-100 p-4
      flex items-start gap-3
      ${disabled ? "opacity-60" : "hover:border-blue-200 hover:shadow-sm cursor-pointer"}
      transition-all
    `}
    >
      <span className="text-2xl">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900">{title}</span>
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
