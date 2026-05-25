// ============================================================
// MEDGRAM — App-wide constants
// Import from here instead of hardcoding values anywhere.
// Changing a value here changes it everywhere.
// ============================================================

// Storage caps in bytes
export const FREE_STORAGE_CAP = 209_715_200; // 200 MB
export const PRO_STORAGE_CAP = 2_147_483_648; // 2 GB

// Monthly share limit for free tier
export const FREE_SHARE_LIMIT = 3;

// QR / share link expiry in hours
export const FREE_EXPIRY_HOURS = 24;
export const PRO_EXPIRY_HOURS = 168; // 7 days

// Doctor code prefix (display only — not stored in DB)
export const DOCTOR_CODE_PREFIX = "DR-";

// Fixed specialty list — must match CHECK constraint in DB exactly.
// If you add a specialty here, you must also add it to the DB constraint
// via a new migration. They must stay in sync.
export const SPECIALTIES = [
  "Anaesthesiologist",
  "Cardiologist",
  "Dentist",
  "Dermatologist",
  "Diabetologist",
  "Endocrinologist",
  "Emergency Medicine",
  "ENT Specialist",
  "Gastroenterologist",
  "General Physician",
  "General Surgeon",
  "Gynaecologist",
  "Hematology",
  "Infectious Disease Specialist",
  "Intensive Care Unit (ICU)",
  "Nephrologist",
  "Neurologist",
  "Obstetrics and Gynecology",
  "Oncologist",
  "Ophthalmologist",
  "Orthopedics",
  "Orthopaedic Surgeon",
  "Paediatrician",
  "Pathology",
  "Pulmonologist",
  "Physiotherapist",
  "Physical Medicine and Rehabilitation",
  "Psychiatrist",
  "Radiologist",
  "Rheumatologist",
  "Urologist",
] as const;

// TypeScript type derived from the array above.
// Use this type wherever specialty is expected.
export type Specialty = (typeof SPECIALTIES)[number];

// Subscription tiers
export const TIERS = ["free", "pro"] as const;
export type Tier = (typeof TIERS)[number];

// User roles
export const ROLES = ["patient", "doctor"] as const;
export type UserRole = (typeof ROLES)[number];

// Record categories — must match CHECK constraint in DB
export const RECORD_CATEGORIES = [
  "prescription",
  "lab_result",
  "scan",
  "bill",
  "other",
] as const;
export type RecordCategory = (typeof RECORD_CATEGORIES)[number];
