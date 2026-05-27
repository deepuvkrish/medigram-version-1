"use client";

// ============================================================
// TopBar — Shown at top on mobile. Contains hamburger button
// that toggles the sidebar drawer. Hidden on desktop where
// the sidebar is always visible.
// ============================================================
import Image from "next/image";
interface TopBarProps {
  onMenuClick: () => void;
  src?: string;
}

export default function TopBar({
  onMenuClick,
  src = "/images/heal-logo.svg",
}: TopBarProps) {
  return (
    <header className="lg:hidden sticky top-0 z-10  border-b border-gray-700  flex items-center gap-3 px-4 py-3">
      {/* Hamburger button */}
      <button
        onClick={onMenuClick}
        className="p-1.5 rounded-lg text-gray-300 hover:text-blue-400
                   hover:bg-gray-100 transition-colors"
        aria-label="Open menu"
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
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      <Image
        src={src}
        height={100}
        width={100}
        unoptimized
        alt="logo"
        className="w-15"
      />
    </header>
  );
}
