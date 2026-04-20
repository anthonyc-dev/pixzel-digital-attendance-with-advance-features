-- Deductions + Loans/Cash Advance schema

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'deduction_frequency') THEN
    CREATE TYPE public.deduction_frequency AS ENUM ('one_time', 'monthly', 'semi_monthly');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'loan_status') THEN
    CREATE TYPE public.loan_status AS ENUM ('draft', 'active', 'completed', 'defaulted', 'cancelled');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'loan_tx_type') THEN
    CREATE TYPE public.loan_tx_type AS ENUM ('disbursement', 'payment', 'adjustment', 'writeoff', 'refund');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.deduction_catalog (
  id                        BIGSERIAL PRIMARY KEY,
  code                      TEXT NOT NULL UNIQUE,
  name                      TEXT NOT NULL,
  is_statutory              BOOLEAN NOT NULL DEFAULT FALSE,
  default_priority          INTEGER NOT NULL DEFAULT 100,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.deduction_catalog (code, name, is_statutory, default_priority)
VALUES
  ('SSS', 'SSS', TRUE, 10),
  ('PHILHEALTH', 'PhilHealth', TRUE, 20),
  ('PAGIBIG', 'Pag-IBIG', TRUE, 30),
  ('LOAN', 'Loan Deduction', FALSE, 40),
  ('OTHER', 'Other Deduction', FALSE, 50)
ON CONFLICT (code) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.employee_recurring_deductions (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_registration_id  BIGINT NOT NULL REFERENCES public.employer_registration(id) ON DELETE CASCADE,
  deduction_catalog_id      BIGINT NOT NULL REFERENCES public.deduction_catalog(id) ON DELETE RESTRICT,
  frequency                 public.deduction_frequency NOT NULL DEFAULT 'monthly',
  amount                    NUMERIC(14,2) NOT NULL,
  start_date                DATE NOT NULL,
  end_date                  DATE,
  is_active                 BOOLEAN NOT NULL DEFAULT TRUE,
  notes                     TEXT,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_recurring_dates CHECK (end_date IS NULL OR end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS idx_erd_emp ON public.employee_recurring_deductions(employer_registration_id, is_active);

CREATE TABLE IF NOT EXISTS public.employee_one_time_deductions (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_registration_id  BIGINT NOT NULL REFERENCES public.employer_registration(id) ON DELETE CASCADE,
  deduction_catalog_id      BIGINT NOT NULL REFERENCES public.deduction_catalog(id) ON DELETE RESTRICT,
  amount                    NUMERIC(14,2) NOT NULL,
  deduction_date            DATE NOT NULL,
  payroll_run_employee_id   UUID REFERENCES public.payroll_run_employees(id) ON DELETE SET NULL,
  reason                    TEXT,
  created_by                TEXT,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eotd_emp_date ON public.employee_one_time_deductions(employer_registration_id, deduction_date);

CREATE TABLE IF NOT EXISTS public.loan_accounts (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_registration_id  BIGINT NOT NULL REFERENCES public.employer_registration(id) ON DELETE RESTRICT,
  loan_type                 TEXT NOT NULL,
  principal_amount          NUMERIC(14,2) NOT NULL,
  disbursed_amount          NUMERIC(14,2) NOT NULL,
  remaining_balance         NUMERIC(14,2) NOT NULL,
  monthly_payment           NUMERIC(14,2),
  interest_rate_annual      NUMERIC(8,4) DEFAULT 0,
  term_months               INTEGER,
  start_date                DATE NOT NULL,
  end_date                  DATE,
  status                    public.loan_status NOT NULL DEFAULT 'draft',
  notes                     TEXT,
  created_by                TEXT,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_loan_amounts CHECK (
    principal_amount >= 0 AND disbursed_amount >= 0 AND remaining_balance >= 0
  )
);

CREATE INDEX IF NOT EXISTS idx_loan_emp_status ON public.loan_accounts(employer_registration_id, status);

CREATE TABLE IF NOT EXISTS public.loan_installments (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_account_id           UUID NOT NULL REFERENCES public.loan_accounts(id) ON DELETE CASCADE,
  installment_no            INTEGER NOT NULL,
  due_date                  DATE NOT NULL,
  scheduled_amount          NUMERIC(14,2) NOT NULL,
  paid_amount               NUMERIC(14,2) NOT NULL DEFAULT 0,
  is_paid                   BOOLEAN NOT NULL DEFAULT FALSE,
  paid_at                   TIMESTAMPTZ,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_loan_installment UNIQUE (loan_account_id, installment_no)
);

CREATE INDEX IF NOT EXISTS idx_loan_installment_due ON public.loan_installments(due_date, is_paid);

CREATE TABLE IF NOT EXISTS public.loan_transactions (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_account_id           UUID NOT NULL REFERENCES public.loan_accounts(id) ON DELETE CASCADE,
  tx_type                   public.loan_tx_type NOT NULL,
  amount                    NUMERIC(14,2) NOT NULL,
  tx_date                   DATE NOT NULL DEFAULT CURRENT_DATE,
  payroll_run_id            UUID REFERENCES public.payroll_runs(id) ON DELETE SET NULL,
  notes                     TEXT,
  actor                     TEXT,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_loan_tx_loan_date ON public.loan_transactions(loan_account_id, tx_date);
