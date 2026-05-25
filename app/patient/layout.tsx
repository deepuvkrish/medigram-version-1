import PatientShell from "@/components/layout/PatientShell";

// Server component layout — just renders the shell.
// State management lives in PatientShell (client component).
export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PatientShell>{children}</PatientShell>;
}
