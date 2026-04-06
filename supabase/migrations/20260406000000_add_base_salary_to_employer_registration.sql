-- Add base_salary column to employer_registration table
ALTER TABLE public.employer_registration
ADD COLUMN IF NOT EXISTS base_salary NUMERIC(12,2) DEFAULT 0;

-- Also add other employee fields for completeness
ALTER TABLE public.employer_registration
ADD COLUMN IF NOT EXISTS contact_no TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS birth_day DATE;
