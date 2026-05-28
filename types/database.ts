// ============================================================
// MEDGRAM — Database Types
// TypeScript interfaces that mirror database table shapes.
// Use these everywhere you work with database data so TypeScript
// catches mismatches between your code and your schema.
// ============================================================

import type {
  Specialty,
  Tier,
  UserRole,
  RecordCategory,
} from "@/lib/constants";

// ---- profiles -----------------------------------------------
export interface Profile {
  id: string;
  role: UserRole;
  first_name: string;
  last_name: string | null;
  email: string;
  phone: string | null;
  city: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  terms_accepted_at: string | null;
}

// ---- patient_profiles ----------------------------------------
export interface PatientProfile {
  id: string;
  username: string | null;
  country: string | null;
  state: string | null;
  pincode: string | null;
  date_of_birth: string | null;
  patient_code: string | null;
}

// ---- doctor_profiles -----------------------------------------
export interface DoctorProfile {
  id: string;
  doctor_code: string; // stored without prefix e.g. "K7X2P9QA1R"
  specialty: Specialty;
  hospital_name: string | null;
  qualifications: string[];
  is_verified: boolean;
}

// ---- doctor_verifications ------------------------------------
export type VerificationStatus =
  | "unverified"
  | "pending"
  | "verified"
  | "rejected";

export interface DoctorVerification {
  id: string;
  doctor_id: string;
  mci_number: string | null;
  certificate_url: string | null;
  status: VerificationStatus;
  submitted_at: string | null;
  reviewed_at: string | null;
}

// ---- subscriptions -------------------------------------------
export interface Subscription {
  id: string;
  tier: Tier;
  storage_used_bytes: number;
  share_count_this_month: number;
  share_reset_at: string | null;
  updated_at: string;
}

// ---- notifications -------------------------------------------
export type NotificationType =
  | "access_request"
  | "access_approved"
  | "access_denied"
  | "system";
export type NotificationStatus = "unread" | "read";

export interface Notification {
  id: string;
  recipient_id: string;
  sender_id: string | null;
  type: NotificationType;
  status: NotificationStatus;
  reference_id: string | null;
  created_at: string;
}

// ---- medical_records -----------------------------------------
export interface MedicalRecord {
  id: string;
  owner_id: string;
  category: RecordCategory;
  title: string;
  file_url: string;
  file_size_bytes: number;
  record_date: string;
  is_deleted: boolean;
  created_at: string;
}

// ---- access_requests -----------------------------------------
export type AccessRequestStatus = "pending" | "approved" | "denied" | "expired";

export interface AccessRequest {
  id: string;
  doctor_id: string;
  patient_id: string;
  status: AccessRequestStatus;
  requested_at: string;
  responded_at: string | null;
}

// ---- record_access -------------------------------------------
export type RecordAccessStatus = "active" | "expired" | "revoked";

export interface RecordAccess {
  id: string;
  record_id: string;
  user_id: string;
  granted_at: string;
  expires_at: string | null;
  status: RecordAccessStatus;
}

// ---- audit_logs ----------------------------------------------
export interface AuditLog {
  id: string;
  actor_id: string;
  action: string;
  target_table: string | null;
  target_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

// ---- Composite types (joined data used in UI) ----------------

// Full patient data — profiles + patient_profiles + subscriptions
export interface FullPatient {
  profile: Profile;
  patient: PatientProfile;
  subscription: Subscription;
}

// Full doctor data — profiles + doctor_profiles
export interface FullDoctor {
  profile: Profile;
  doctor: DoctorProfile;
}

// Doctor search result card
export interface DoctorSearchResult {
  id: string;
  first_name: string;
  last_name: string | null;
  city: string | null;
  avatar_url: string | null;
  doctor_code: string;
  specialty: Specialty;
  hospital_name: string | null;
  is_verified: boolean;
}

//Phase 3 - for generating qr codes to share records
export interface QRToken {
  id: string;
  patient_id: string;
  token: string;
  expires_at: string;
  used_at: string | null;
  created_at: string;
}
