import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// ============================================================
// MEDGRAM — Root Layout
// Wraps every page on the site.
// Only put things here that apply to ALL pages —
// font, global CSS, and HTML metadata.
// Navigation and sidebars live in sub-layouts.
// ============================================================

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Medgram",
    template: "%s | Medgram",
    // template means individual pages can set their own title
    // and it will render as "Page Title | Medgram"
  },
  description: "Your medical history, secure and always with you.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
