import { createClient } from "@/lib/supabase/server";
import type {
  Profile,
  PatientProfile,
  DoctorProfile,
  Subscription,
} from "@/types/database";

// ============================================================
// MEDGRAM — Server-side profile fetching
// Used in server components (layouts and pages) to load
// the current user's data before rendering.
// These functions run on the server — never in the browser.
// ============================================================

// Returns the base profile for the logged-in user.
// Returns null if no session exists.
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  // .single() returns one row or throws — never an array.
  // Correct here because one user = one profile row.

  if (error || !data) return null;
  return data as Profile;
}

// Returns full patient data — profile + patient_profiles + subscriptions.
// Call this in patient dashboard and profile pages.
export async function getPatientData(): Promise<{
  profile: Profile;
  patient: PatientProfile;
  subscription: Subscription;
} | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Fetch all three tables in parallel using Promise.all.
  // Parallel = faster than three sequential await calls.
  const [profileRes, patientRes, subRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("patient_profiles").select("*").eq("id", user.id).single(),
    supabase.from("subscriptions").select("*").eq("id", user.id).single(),
  ]);

  if (profileRes.error || patientRes.error || subRes.error) return null;

  return {
    profile: profileRes.data as Profile,
    patient: patientRes.data as PatientProfile,
    subscription: subRes.data as Subscription,
  };
}

// Returns full doctor data — profile + doctor_profiles + subscriptions.
// Call this in doctor dashboard and profile pages.
export async function getDoctorData(): Promise<{
  profile: Profile;
  doctor: DoctorProfile;
  subscription: Subscription;
} | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [profileRes, doctorRes, subRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("doctor_profiles").select("*").eq("id", user.id).single(),
    supabase.from("subscriptions").select("*").eq("id", user.id).single(),
  ]);

  if (profileRes.error || doctorRes.error || subRes.error) return null;

  return {
    profile: profileRes.data as Profile,
    doctor: doctorRes.data as DoctorProfile,
    subscription: subRes.data as Subscription,
  };
}
