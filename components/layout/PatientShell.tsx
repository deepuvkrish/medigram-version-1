"use client";

import { useState } from "react";
import Sidebar, { type NavItem } from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";

const Icons = {
  dashboard: (
    <svg
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      className="w-4 h-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      />
    </svg>
  ),
  records: (
    <svg
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      className="w-4 h-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  ),
  share: (
    <svg
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      className="w-4 h-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
      />
    </svg>
  ),
  search: (
    <svg
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      className="w-4 h-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  ),
  profile: (
    <svg
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      className="w-4 h-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  ),
  subscription: (
    <svg
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      className="w-4 h-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
      />
    </svg>
  ),
};

const primaryNav: NavItem[] = [
  { label: "Dashboard", href: "/patient/dashboard", icon: Icons.dashboard },
  {
    label: "My Records",
    href: "/patient/records",
    icon: Icons.records,
    disabled: true,
    badge: "Phase 2",
  },
  {
    label: "Share History",
    href: "/patient/shares",
    icon: Icons.share,
    disabled: true,
    badge: "Phase 2",
  },
  {
    label: "Find a Doctor",
    href: "/patient/search",
    icon: Icons.search,
    disabled: true,
    badge: "Phase 2",
  },
];

const bottomNav: NavItem[] = [
  { label: "Profile", href: "/patient/profile", icon: Icons.profile },
  {
    label: "Subscription",
    href: "/patient/subscription",
    icon: Icons.subscription,
    disabled: true,
    badge: "Phase 2",
  },
];

export default function PatientShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        navItems={primaryNav}
        bottomItems={bottomNav}
        userRole="patient"
        userName="My Account"
        userEmail=""
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 bg-[#f4f5f7]">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
