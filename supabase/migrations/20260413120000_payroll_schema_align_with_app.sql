-- Payroll-only schema alignment for Supabase (remote or local).
-- Does NOT modify: attendance / DTR / face descriptor / auth login tables.
--
-- Fixes mismatch: legacy payroll_records used generated column total_deductions (sss+philhealth+pagibig+tax)
-- while the app writes total_deduction (late/absent and other payroll totals).

-- ---------------------------------------------------------------------------
-- employer_registration: monthly salary input for payroll (no face/login columns touched)
-- ---------------------------------------------------------------------------
ALTER TABLE public.employer_registration
  ADD COLUMN IF NOT EXISTS base_salary NUMERIC(12, 2) DEFAULT 0;

-- ---------------------------------------------------------------------------
-- payroll_deduction_settings: late/absent rates (used by admin payroll UI)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payroll_deduction_settings (
  id               BIGSERIAL PRIMARY KEY,
  late_deduction   NUMERIC(12, 2) NOT NULL DEFAULT 50.00,
  absent_deduction NUMERIC(12, 2) NOT NULL DEFAULT 100.00,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.payroll_deduction_settings (late_deduction, absent_deduction)
SELECT 50.00, 100.00
WHERE NOT EXISTS (SELECT 1 FROM public.payroll_deduction_settings);

-- ---------------------------------------------------------------------------
-- payroll_records: app columns + migrate off generated total_deductions
-- ---------------------------------------------------------------------------

-- Writable total for the app (replaces reliance on generated statutory-only total)
ALTER TABLE public.payroll_records
  ADD COLUMN IF NOT EXISTS total_deduction NUMERIC(12, 2) DEFAULT 0;

ALTER TABLE public.payroll_records
  ADD COLUMN IF NOT EXISTS late_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS absent_count INTEGER DEFAULT 0;

-- Copy generated statutory total into the writable column, then drop generated column
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'payroll_records'
      AND column_name = 'total_deductions'
  ) THEN
    EXECUTE $q$
      UPDATE public.payroll_records
      SET total_deduction = COALESCE(total_deductions, 0)
    $q$;
    ALTER TABLE public.payroll_records DROP COLUMN total_deductions;
  END IF;
END $$;

-- Helpful for filtering by pay period (safe if index already exists)
CREATE INDEX IF NOT EXISTS idx_payroll_records_period
  ON public.payroll_records (period);
