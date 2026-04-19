-- Payroll core (periods, runs, employee results, line items)
-- This migration is additive and does not modify attendance/DTR core tables.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payroll_run_status') THEN
    CREATE TYPE public.payroll_run_status AS ENUM ('draft', 'processing', 'finalized', 'posted', 'voided');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payroll_line_type') THEN
    CREATE TYPE public.payroll_line_type AS ENUM ('earning', 'deduction', 'adjustment', 'exception');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.payroll_periods (
  id                BIGSERIAL PRIMARY KEY,
  period_label      TEXT,
  period_start      DATE NOT NULL,
  period_end        DATE NOT NULL,
  cutoff_date       DATE,
  is_open           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_period_range CHECK (period_end >= period_start),
  CONSTRAINT uq_period_unique UNIQUE (period_start, period_end)
);

CREATE TABLE IF NOT EXISTS public.payroll_runs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_period_id BIGINT NOT NULL REFERENCES public.payroll_periods(id) ON DELETE RESTRICT,
  run_no            INTEGER NOT NULL DEFAULT 1,
  status            public.payroll_run_status NOT NULL DEFAULT 'draft',
  processed_by      TEXT,
  processed_at      TIMESTAMPTZ,
  finalized_at      TIMESTAMPTZ,
  posted_at         TIMESTAMPTZ,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_run_per_period_no UNIQUE (payroll_period_id, run_no)
);

CREATE INDEX IF NOT EXISTS idx_payroll_runs_period ON public.payroll_runs(payroll_period_id);
CREATE INDEX IF NOT EXISTS idx_payroll_runs_status ON public.payroll_runs(status);

CREATE TABLE IF NOT EXISTS public.payroll_run_employees (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_run_id            UUID NOT NULL REFERENCES public.payroll_runs(id) ON DELETE CASCADE,
  employer_registration_id  BIGINT NOT NULL REFERENCES public.employer_registration(id) ON DELETE RESTRICT,
  employee_code             TEXT,
  employee_name_snapshot    TEXT NOT NULL,
  position_snapshot         TEXT,
  department_snapshot       TEXT,
  base_salary               NUMERIC(14,2) NOT NULL DEFAULT 0,
  gross_pay                 NUMERIC(14,2) NOT NULL DEFAULT 0,
  total_earnings            NUMERIC(14,2) NOT NULL DEFAULT 0,
  total_deductions          NUMERIC(14,2) NOT NULL DEFAULT 0,
  net_pay                   NUMERIC(14,2) NOT NULL DEFAULT 0,
  late_count                INTEGER NOT NULL DEFAULT 0,
  absent_count              INTEGER NOT NULL DEFAULT 0,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_run_employee UNIQUE (payroll_run_id, employer_registration_id)
);

CREATE INDEX IF NOT EXISTS idx_pre_emp ON public.payroll_run_employees(employer_registration_id);
CREATE INDEX IF NOT EXISTS idx_pre_run ON public.payroll_run_employees(payroll_run_id);

CREATE TABLE IF NOT EXISTS public.payroll_run_lines (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_run_employee_id   UUID NOT NULL REFERENCES public.payroll_run_employees(id) ON DELETE CASCADE,
  line_type                 public.payroll_line_type NOT NULL,
  code                      TEXT NOT NULL,
  description               TEXT,
  source_module             TEXT NOT NULL,
  source_ref_id             TEXT,
  amount                    NUMERIC(14,2) NOT NULL,
  taxable                   BOOLEAN NOT NULL DEFAULT FALSE,
  sequence_no               INTEGER NOT NULL DEFAULT 100,
  metadata                  JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prl_pre ON public.payroll_run_lines(payroll_run_employee_id);
CREATE INDEX IF NOT EXISTS idx_prl_source ON public.payroll_run_lines(source_module, source_ref_id);
CREATE INDEX IF NOT EXISTS idx_prl_type ON public.payroll_run_lines(line_type);
