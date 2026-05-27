import { z } from "zod";
import { SPECIALTIES } from "@/lib/constants";

// ============================================================
// MEDGRAM — Form Validation Schemas
// Built with Zod. Same schema runs on client and server.
// Import the schema you need in your form component and
// API route — validation logic lives in exactly one place.
// ============================================================

// ── Patient Signup ──────────────────────────────────────────
export const patientSignupSchema = z.object({
  first_name: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must be under 50 characters")
    .trim(),

  last_name: z
    .string()
    .max(50, "Last name must be under 50 characters")
    .trim()
    .optional(),

  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be under 20 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores",
    )
    .trim(),

  email: z.string().email("Enter a valid email address").toLowerCase().trim(),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),

  country: z.string().min(1, "Country is required").trim(),

  state: z.string().min(1, "State is required").trim(),

  city: z.string().min(1, "City is required").trim(),

  pincode: z
    .string()
    .min(4, "Enter a valid pincode")
    .max(10, "Enter a valid pincode")
    .regex(/^[0-9]+$/, "Pincode must contain only numbers")
    .trim(),

  terms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms to continue",
  }),
});

export type PatientSignupData = z.infer<typeof patientSignupSchema>;

// ── Doctor Signup ───────────────────────────────────────────
export const doctorSignupSchema = z.object({
  first_name: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must be under 50 characters")
    .trim(),

  last_name: z
    .string()
    .max(50, "Last name must be under 50 characters")
    .trim()
    .optional(),

  email: z.string().email("Enter a valid email address").toLowerCase().trim(),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),

  specialty: z.enum(SPECIALTIES, {
    error: "Select a valid specialty",
  }),

  hospital_name: z
    .string()
    .max(100, "Hospital name must be under 100 characters")
    .trim()
    .optional(),

  city: z.string().min(1, "City is required").trim(),

  terms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms to continue",
  }),
});

export type DoctorSignupData = z.infer<typeof doctorSignupSchema>;

// ── Login ───────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address").toLowerCase().trim(),

  password: z.string().min(1, "Password is required"),
});

export type LoginData = z.infer<typeof loginSchema>;

// ── Forgot Password ─────────────────────────────────────────
export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address").toLowerCase().trim(),
});

export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

// ── Reset Password ──────────────────────────────────────────
export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),

    confirm_password: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
    // path tells Zod which field to attach this error to
  });

export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

// ── Patient Profile Update ──────────────────────────────────
export const patientProfileSchema = z.object({
  first_name: z.string().min(1, "First name is required").max(50).trim(),

  last_name: z.string().max(50).trim().optional(),

  phone: z
    .string()
    .regex(/^[0-9+\-\s()]+$/, "Enter a valid phone number")
    .min(7, "Enter a valid phone number")
    .max(20, "Enter a valid phone number")
    .trim()
    .optional()
    .or(z.literal("")),

  city: z.string().max(100).trim().optional(),
  state: z.string().max(100).trim().optional(),
  country: z.string().max(100).trim().optional(),
  pincode: z
    .string()
    .regex(/^[0-9]+$/, "Pincode must contain only numbers")
    .max(10)
    .trim()
    .optional()
    .or(z.literal("")),

  date_of_birth: z.string().optional().or(z.literal("")),
});

export type PatientProfileData = z.infer<typeof patientProfileSchema>;

// ── Doctor Profile Update ───────────────────────────────────
export const doctorProfileSchema = z.object({
  first_name: z.string().min(1, "First name is required").max(50).trim(),

  last_name: z.string().max(50).trim().optional(),

  phone: z
    .string()
    .regex(/^[0-9+\-\s()]+$/, "Enter a valid phone number")
    .min(7, "Enter a valid phone number")
    .max(20, "Enter a valid phone number")
    .trim()
    .optional()
    .or(z.literal("")),

  city: z.string().max(100).trim().optional(),
  hospital_name: z.string().max(100).trim().optional(),
});

export type DoctorProfileData = z.infer<typeof doctorProfileSchema>;
