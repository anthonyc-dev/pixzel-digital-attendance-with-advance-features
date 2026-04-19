-- Overtime management schema

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'overtime_status') THEN
    CREATE TYPE public.overtime_status AS ENUM ('pending', 'approved', 'rejected', 'paid');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.overtime_entries (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_registration_id  BIGINT NOT NULL REFERENCES public.employer_registration(id) ON DELETE CASCADE,
  work_date                 DATE NOT NULL,
  hours                     NUMERIC(8,2) NOT NULL,
  rate_multiplier           NUMERIC(6,3) NOT NULL DEFAULT 1.500,
  base_hourly_rate          NUMERIC(12,4),
  computed_amount           NUMERIC(14,2),
  status                    public.overtime_status NOT NULL DEFAULT 'pending',
  approved_by               TEXT,
  approved_at               TIMESTAMPTZ,
  remarks                   TEXT,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ot_emp_date ON public.overtime_entries(employer_registration_id, work_date);
CREATE INDEX IF NOT EXISTS idx_ot_status ON public.overtime_entries(status);

CREATE TABLE IF NOT EXISTS public.overtime_overrides (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  overtime_entry_id         UUID NOT NULL REFERENCES public.overtime_entries(id) ON DELETE CASCADE,
  original_hours            NUMERIC(8,2) NOT NULL,
  adjusted_hours            NUMERIC(8,2) NOT NULL,
  original_amount           NUMERIC(14,2),
  adjusted_amount           NUMERIC(14,2),
  reason                    TEXT NOT NULL,
  actor                     TEXT NOT NULL,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ot_override_entry ON public.overtime_overrides(overtime_entry_id);
