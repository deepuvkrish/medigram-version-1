-- Migration 002: Add record_date to medical_records
-- Run date: 2025

ALTER TABLE public.medical_records
ADD COLUMN IF NOT EXISTS record_date date;

COMMENT ON COLUMN public.medical_records.record_date IS
'Date the record was created/taken, entered by the patient. Not the upload date.';