import DoctorShell from "@/components/layout/DoctorShell";

// Server component layout — just renders the shell.
// State management lives in DoctorShell (client component).
export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DoctorShell>{children}</DoctorShell>;
}
