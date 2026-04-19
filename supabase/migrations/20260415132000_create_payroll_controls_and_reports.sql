-- Payroll controls (adjustments/exceptions/override audit/payslip snapshots) + report views

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'exception_status') THEN
    CREATE TYPE public.exception_status AS ENUM ('open', 'resolved', 'ignored');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.payroll_adjustments (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_registration_id  BIGINT NOT NULL REFERENCES public.employer_registration(id) ON DELETE CASCADE,
  payroll_period_id         BIGINT REFERENCES public.payroll_periods(id) ON DELETE SET NULL,
  adjustment_type           TEXT NOT NULL,
  amount                    NUMERIC(14,2) NOT NULL,
  reason                    TEXT NOT NULL,
  effective_date            DATE NOT NULL,
  created_by                TEXT,
  approved_by               TEXT,
  approved_at               TIMESTAMPTZ,
  is_applied                BOOLEAN NOT NULL DEFAULT FALSE,
  applied_payroll_run_id    UUID REFERENCES public.payroll_runs(id) ON DELETE SET NULL,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  -- Some existing environments may have a legacy payroll_adjustments shape.
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'payroll_adjustments'
      AND column_name = 'effective_date'
  ) THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_pay_adj_emp_date ON public.payroll_adjustments(employer_registration_id, effective_date);';
  ELSIF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'payroll_adjustments'
      AND column_name = 'date'
  ) THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_pay_adj_emp_date ON public.payroll_adjustments(employer_registration_id, date);';
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.payroll_exceptions (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_registration_id  BIGINT NOT NULL REFERENCES public.employer_registration(id) ON DELETE CASCADE,
  payroll_period_id         BIGINT REFERENCES public.payroll_periods(id) ON DELETE SET NULL,
  exception_type            TEXT NOT NULL,
  amount_impact             NUMERIC(14,2) NOT NULL DEFAULT 0,
  description               TEXT NOT NULL,
  status                    public.exception_status NOT NULL DEFAULT 'open',
  resolved_by               TEXT,
  resolved_at               TIMESTAMPTZ,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pay_ex_status ON public.payroll_exceptions(status);
CREATE INDEX IF NOT EXISTS idx_pay_ex_emp_period ON public.payroll_exceptions(employer_registration_id, payroll_period_id);

CREATE TABLE IF NOT EXISTS public.manual_override_audit (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_name               TEXT NOT NULL,
  entity_table              TEXT NOT NULL,
  entity_id                 TEXT NOT NULL,
  employer_registration_id  BIGINT REFERENCES public.employer_registration(id) ON DELETE SET NULL,
  field_name                TEXT,
  old_value                 TEXT,
  new_value                 TEXT,
  delta_value               NUMERIC(14,2),
  reason                    TEXT NOT NULL,
  actor                     TEXT NOT NULL,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_override_module_entity ON public.manual_override_audit(module_name, entity_table, entity_id);
CREATE INDEX IF NOT EXISTS idx_override_emp ON public.manual_override_audit(employer_registration_id);

CREATE TABLE IF NOT EXISTS public.payslip_snapshots (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_run_employee_id   UUID NOT NULL UNIQUE REFERENCES public.payroll_run_employees(id) ON DELETE CASCADE,
  payload                   JSONB NOT NULL,
  generated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  generated_by              TEXT
);

CREATE OR REPLACE VIEW public.vw_payroll_register AS
SELECT
  pr.id AS payroll_run_id,
  pp.period_start,
  pp.period_end,
  pre.id AS payroll_run_employee_id,
  pre.employer_registration_id,
  pre.employee_name_snapshot,
  pre.position_snapshot,
  pre.department_snapshot,
  pre.gross_pay,
  pre.total_deductions,
  pre.net_pay,
  pr.status AS run_status,
  pr.finalized_at
FROM public.payroll_run_employees pre
JOIN public.payroll_runs pr ON pr.id = pre.payroll_run_id
JOIN public.payroll_periods pp ON pp.id = pr.payroll_period_id;

CREATE OR REPLACE VIEW public.vw_loan_balance_report AS
SELECT
  la.id AS loan_account_id,
  la.employer_registration_id,
  er.employer_name,
  la.loan_type,
  la.principal_amount,
  la.remaining_balance,
  la.monthly_payment,
  la.status,
  la.start_date,
  la.end_date
FROM public.loan_accounts la
LEFT JOIN public.employer_registration er ON er.id = la.employer_registration_id;

CREATE OR REPLACE VIEW public.vw_deduction_summary AS
SELECT
  pre.payroll_run_id,
  pre.employer_registration_id,
  dcl.code AS deduction_code,
  dcl.name AS deduction_name,
  SUM(CASE WHEN prl.line_type = 'deduction' THEN prl.amount ELSE 0 END) AS deduction_total
FROM public.payroll_run_lines prl
JOIN public.payroll_run_employees pre ON pre.id = prl.payroll_run_employee_id
LEFT JOIN public.deduction_catalog dcl ON dcl.code = prl.code
GROUP BY pre.payroll_run_id, pre.employer_registration_id, dcl.code, dcl.name;

CREATE OR REPLACE VIEW public.vw_employee_payslip AS
SELECT
  pre.id AS payroll_run_employee_id,
  pre.payroll_run_id,
  pre.employer_registration_id,
  pre.employee_name_snapshot,
  pre.gross_pay,
  pre.total_deductions,
  pre.net_pay,
  ps.payload,
  ps.generated_at
FROM public.payroll_run_employees pre
LEFT JOIN public.payslip_snapshots ps ON ps.payroll_run_employee_id = pre.id;
