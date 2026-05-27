"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
// ============================================================
// Sidebar — Shared by patient and doctor layouts.
// Desktop: fixed left sidebar.
// Mobile: slide-in drawer triggered by hamburger in Topbar.
// ============================================================

export interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  disabled?: boolean;
  badge?: string; // e.g. "Phase 2" label on disabled items
}

interface SidebarProps {
  navItems: NavItem[];
  bottomItems?: NavItem[]; // items pinned to bottom (profile, subscription)
  userRole: "patient" | "doctor";
  userName: string;
  userEmail: string;
  avatarUrl?: string | null;
  isOpen: boolean; // controlled by parent (Topbar hamburger)
  onClose: () => void;
}

export default function Sidebar({
  navItems,
  bottomItems,
  userRole,
  userName,
  userEmail,
  avatarUrl,
  isOpen,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [loggingOut, setLoggingOut] = useState(false);

  // Close drawer when route changes (user tapped a link on mobile)
  useEffect(() => {
    onClose();
  }, [pathname]);

  // Prevent body scroll when drawer is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleLogout = async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      {/* ── Backdrop (mobile only) ──────────────────────────── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* ── Sidebar panel ───────────────────────────────────── */}
      <aside
        className={`
          fixed top-0 left-0 z-30 h-full w-64 bg-(--mobileDarkSide) md:bg-white border-r 
          md:border-gray-200 border-gray-700
          flex flex-col transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* ── Logo ──────────────────────────────────────────── */}
        <div className="px-5 py-5 border-b border-gray-700 md:border-gray-100 flex items-center justify-between">
          <Link href="/" className=" tracking-tight">
            <Image
              src="/images/heal_nav.png"
              alt="Background Image"
              width={100}
              height={100}
              unoptimized
            />
          </Link>
          {/* Close button — mobile only */}
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md text-gray-300 hover:text-gray-200
                       hover:bg-gray-100 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* ── User info strip ───────────────────────────────── */}
        <div className="px-4 py-3 border-b border-gray-700 md:border-gray-100 flex items-center gap-3">
          {/* Avatar */}
          <div
            className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center
                          shrink-0 overflow-hidden"
          >
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={userName}
                className="w-full h-full object-cover"
                width={100}
                height={100}
                unoptimized
              />
            ) : (
              <span className="text-xs font-semibold text-white">
                {initials}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white md:text-gray-900 truncate">
              {userRole == "patient" ? " " : "Dr "} {userName}
            </p>
            <p className="text-xs text-gray-400 truncate">{userEmail}</p>
          </div>
        </div>

        {/* ── Primary nav items ─────────────────────────────── */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-0.5">
          {navItems.map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} />
          ))}
        </nav>

        {/* ── Bottom items ──────────────────────────────────── */}
        {bottomItems && bottomItems.length > 0 && (
          <div className="px-3 py-2 border-t border-gray-100 flex flex-col gap-0.5">
            {bottomItems.map((item) => (
              <NavLink key={item.href} item={item} pathname={pathname} />
            ))}
          </div>
        )}

        {/* ── Logout ────────────────────────────────────────── */}
        <div className="px-3 py-3 border-t border-gray-100">
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg
                       text-sm text-gray-500 hover:text-red-600 hover:bg-red-50
                       transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              className="w-4 h-4 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span>{loggingOut ? "Logging out..." : "Log out"}</span>
          </button>
        </div>
      </aside>
    </>
  );
}

// ── NavLink — individual sidebar link ──────────────────────

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const isActive =
    pathname === item.href || pathname.startsWith(item.href + "/");

  if (item.disabled) {
    return (
      <div
        className="flex items-center gap-3 px-3 py-2 rounded-lg
                   text-sm text-gray-300 cursor-not-allowed select-none"
      >
        <span className="w-4 h-4 shrink-0">{item.icon}</span>
        <span className="flex-1">{item.label}</span>
        {item.badge && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-400">
            {item.badge}
          </span>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      className={`
        flex items-center gap-3 px-3 py-2 rounded-lg text-sm
        transition-colors
        ${
          isActive
            ? "bg-transparent md:bg-blue-100/50 text-(--cornBlue) md:text-[#1f3bb3] font-medium"
            : "text-gray-600  hover:text-[#4a89fd]"
        }
      `}
    >
      <span className="w-4 h-4 shrink-0">{item.icon}</span>
      <span className="flex-1">{item.label}</span>
      {item.badge && (
        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">
          {item.badge}
        </span>
      )}
    </Link>
  );
}
