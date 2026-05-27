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

// ── Medical Qualifications ──────────────────────────────────
// Used in doctor profile autocomplete input.
// Covers Indian, UK, European, American, Canadian,
// Australian and Singaporean medical degrees.

export const QUALIFICATIONS = [
  // Indian Undergraduate
  "M.B.B.S",
  "B.D.S",
  "B.A.M.S",
  "B.U.M.S",
  "B.H.M.S",
  "B.N.Y.S",
  "B.V.Sc & A.H",
  "B.Sc Nursing",
  "B.Pharm",
  "B.P.T",
  "B.O.T",
  "B.Sc MLT",
  "B.Sc Radiology",
  "B.Sc Optometry",
  "B.Sc Perfusion Technology",
  // Indian PG — MD
  "M.D (Anaesthesiology)",
  "M.D (Biochemistry)",
  "M.D (Community Medicine)",
  "M.D (Dermatology)",
  "M.D (Emergency Medicine)",
  "M.D (Forensic Medicine)",
  "M.D (General Medicine)",
  "M.D (Geriatrics)",
  "M.D (Microbiology)",
  "M.D (Obstetrics & Gynaecology)",
  "M.D (Paediatrics)",
  "M.D (Pathology)",
  "M.D (Pharmacology)",
  "M.D (Physical Medicine & Rehabilitation)",
  "M.D (Psychiatry)",
  "M.D (Pulmonology)",
  "M.D (Radiology)",
  "M.D (Transfusion Medicine)",
  "M.D (Tropical Medicine)",
  // Indian PG — MS
  "M.S (ENT)",
  "M.S (General Surgery)",
  "M.S (Obstetrics & Gynaecology)",
  "M.S (Ophthalmology)",
  "M.S (Orthopaedics)",
  "M.S (Anatomy)",
  // Indian PG — MDS
  "M.D.S (Oral & Maxillofacial Surgery)",
  "M.D.S (Orthodontics)",
  "M.D.S (Periodontics)",
  "M.D.S (Prosthodontics)",
  "M.D.S (Endodontics)",
  "M.D.S (Pedodontics)",
  "M.D.S (Conservative Dentistry)",
  // Indian PG — MCh
  "M.Ch (Cardiothoracic Surgery)",
  "M.Ch (Endocrine Surgery)",
  "M.Ch (Neurosurgery)",
  "M.Ch (Paediatric Surgery)",
  "M.Ch (Plastic Surgery)",
  "M.Ch (Urology)",
  "M.Ch (Vascular Surgery)",
  // Indian PG — DM
  "D.M (Cardiology)",
  "D.M (Clinical Haematology)",
  "D.M (Clinical Pharmacology)",
  "D.M (Endocrinology)",
  "D.M (Gastroenterology)",
  "D.M (Hepatology)",
  "D.M (Infectious Diseases)",
  "D.M (Medical Genetics)",
  "D.M (Medical Oncology)",
  "D.M (Nephrology)",
  "D.M (Neurology)",
  "D.M (Neonatology)",
  "D.M (Onco-Anaesthesiology)",
  "D.M (Psychiatry)",
  "D.M (Rheumatology)",
  // Indian DNB
  "D.N.B (Anaesthesiology)",
  "D.N.B (Cardiology)",
  "D.N.B (Dermatology)",
  "D.N.B (Emergency Medicine)",
  "D.N.B (Family Medicine)",
  "D.N.B (General Medicine)",
  "D.N.B (General Surgery)",
  "D.N.B (Neurology)",
  "D.N.B (Neurosurgery)",
  "D.N.B (Obstetrics & Gynaecology)",
  "D.N.B (Ophthalmology)",
  "D.N.B (Orthopaedics)",
  "D.N.B (Paediatrics)",
  "D.N.B (Pathology)",
  "D.N.B (Psychiatry)",
  "D.N.B (Pulmonology)",
  "D.N.B (Radiology)",
  "D.N.B (Urology)",
  // Indian Diploma
  "D.G.O",
  "D.C.H",
  "D.A",
  "D.Ortho",
  "D.Ophthal",
  "D.L.O",
  "D.P.M",
  "D.V.D",
  "D.P.H",
  "D.Path",
  "D.Card",
  // UK / Europe
  "M.B.B.S (UK)",
  "M.R.C.P (UK)",
  "M.R.C.S (UK)",
  "M.R.C.O.G (UK)",
  "M.R.C.Psych (UK)",
  "M.R.C.P.C.H (UK)",
  "M.R.C.O.phth (UK)",
  "F.R.C.S (UK)",
  "F.R.C.P (UK)",
  "F.R.C.R (UK)",
  "F.R.C.A (UK)",
  "F.R.C.Path (UK)",
  "F.R.C.O.G (UK)",
  "F.R.C.Psych (UK)",
  "F.R.C.P.C.H (UK)",
  "F.F.A.R.C.S (UK)",
  "M.D (Germany)",
  "Dr.med (Germany)",
  "Facharzt (Germany)",
  "M.D (France)",
  "Diplôme d'État (France)",
  "M.D (Netherlands)",
  "BIG Registration (Netherlands)",
  // USA / Canada
  "M.D (USA)",
  "D.O (USA)",
  "M.B.B.S (USA)",
  "F.A.C.S (USA)",
  "F.A.C.P (USA)",
  "F.A.C.C (USA)",
  "F.A.C.O.G (USA)",
  "F.A.A.P (USA)",
  "F.A.C.E.P (USA)",
  "F.A.C.R (USA)",
  "F.A.C.N (USA)",
  "F.A.C.G (USA)",
  "F.A.C.S.M (USA)",
  "F.A.C.A (USA)",
  "A.B.M.S Board Certification (USA)",
  "M.D (Canada)",
  "F.R.C.P.C (Canada)",
  "F.R.C.S.C (Canada)",
  // Australia / Singapore
  "M.B.B.S (Australia)",
  "F.R.A.C.P (Australia)",
  "F.R.A.C.S (Australia)",
  "F.R.A.N.Z.C.P (Australia)",
  "F.R.A.N.Z.C.O.G (Australia)",
  "F.A.C.E.M (Australia)",
  "F.A.C.R.R.M (Australia)",
  "M.D (Singapore)",
  "M.M.E.D (Singapore)",
  "F.A.M.S (Singapore)",
] as const;

export type Qualification = (typeof QUALIFICATIONS)[number];
