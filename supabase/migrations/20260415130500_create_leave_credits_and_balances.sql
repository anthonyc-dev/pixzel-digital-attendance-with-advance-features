-- Leave credits redesign
-- "Leave token" = leave credits, default 10 credits/year per employee.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'leave_request_status') THEN
    CREATE TYPE public.leave_request_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'leave_ledger_event_type') THEN
    CREATE TYPE public.leave_ledger_event_type AS ENUM ('annual_grant', 'consume', 'manual_add', 'manual_subtract', 'carryover');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.leave_credit_policies (
  id                        BIGSERIAL PRIMARY KEY,
  policy_name               TEXT NOT NULL DEFAULT 'Default Annual Leave',
  leave_type                TEXT NOT NULL DEFAULT 'General',
  credits_per_year          NUMERIC(8,2) NOT NULL DEFAULT 10,
  carryover_enabled         BOOLEAN NOT NULL DEFAULT FALSE,
  max_carryover             NUMERIC(8,2),
  is_active                 BOOLEAN NOT NULL DEFAULT TRUE,
  effective_start           DATE NOT NULL,
  effective_end             DATE,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_leave_policy_dates CHECK (effective_end IS NULL OR effective_end >= effective_start)
);

INSERT INTO public.leave_credit_policies (policy_name, leave_type, credits_per_year, carryover_enabled, effective_start)
SELECT 'Default Annual Leave', 'General', 10, FALSE, CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM public.leave_credit_policies);

CREATE TABLE IF NOT EXISTS public.leave_credit_ledger (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_registration_id  BIGINT NOT NULL REFERENCES public.employer_registration(id) ON DELETE CASCADE,
  leave_type                TEXT NOT NULL DEFAULT 'General',
  ledger_year               INTEGER NOT NULL,
  event_type                public.leave_ledger_event_type NOT NULL,
  quantity                  NUMERIC(8,2) NOT NULL,
  reason                    TEXT,
  reference_table           TEXT,
  reference_id              TEXT,
  actor                     TEXT,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lcl_emp_year_type ON public.leave_credit_ledger(employer_registration_id, ledger_year, leave_type);
CREATE INDEX IF NOT EXISTS idx_lcl_ref ON public.leave_credit_ledger(reference_table, reference_id);

CREATE TABLE IF NOT EXISTS public.leave_balance_yearly (
  id                        BIGSERIAL PRIMARY KEY,
  employer_registration_id  BIGINT NOT NULL REFERENCES public.employer_registration(id) ON DELETE CASCADE,
  leave_type                TEXT NOT NULL DEFAULT 'General',
  balance_year              INTEGER NOT NULL,
  granted_credits           NUMERIC(8,2) NOT NULL DEFAULT 0,
  used_credits              NUMERIC(8,2) NOT NULL DEFAULT 0,
  manual_adjustments        NUMERIC(8,2) NOT NULL DEFAULT 0,
  carryover_in              NUMERIC(8,2) NOT NULL DEFAULT 0,
  ending_balance            NUMERIC(8,2) NOT NULL DEFAULT 0,
  computed_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_leave_balance UNIQUE (employer_registration_id, leave_type, balance_year)
);

ALTER TABLE public.leave_requests
  ADD COLUMN IF NOT EXISTS leave_days NUMERIC(8,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS approved_by TEXT,
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejected_by TEXT,
  ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS payroll_period_id BIGINT REFERENCES public.payroll_periods(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS leave_status_new public.leave_request_status;

DO $$
BEGIN
  -- Backfill safely across schema variants:
  -- some databases still use "status", others already use "leave_status".
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'leave_requests'
      AND column_name = 'status'
  ) THEN
    EXECUTE $sql$
      UPDATE public.leave_requests
      SET leave_status_new =
        CASE lower(coalesce(status::text, 'pending'))
          WHEN 'pending' THEN 'pending'::public.leave_request_status
          WHEN 'approved' THEN 'approved'::public.leave_request_status
          WHEN 'rejected' THEN 'rejected'::public.leave_request_status
          WHEN 'cancelled' THEN 'cancelled'::public.leave_request_status
          ELSE 'pending'::public.leave_request_status
        END
      WHERE leave_status_new IS NULL;
    $sql$;
  ELSIF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'leave_requests'
      AND column_name = 'leave_status'
  ) THEN
    EXECUTE $sql$
      UPDATE public.leave_requests
      SET leave_status_new =
        CASE lower(coalesce(leave_status::text, 'pending'))
          WHEN 'pending' THEN 'pending'::public.leave_request_status
          WHEN 'approved' THEN 'approved'::public.leave_request_status
          WHEN 'rejected' THEN 'rejected'::public.leave_request_status
          WHEN 'cancelled' THEN 'cancelled'::public.leave_request_status
          ELSE 'pending'::public.leave_request_status
        END
      WHERE leave_status_new IS NULL;
    $sql$;
  ELSE
    UPDATE public.leave_requests
    SET leave_status_new = 'pending'::public.leave_request_status
    WHERE leave_status_new IS NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_leave_requests_emp ON public.leave_requests(employer_registration_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_dates ON public.leave_requests(start_date, end_date);
