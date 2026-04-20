-- Helper trigger for updated_at + baseline RLS setup for new payroll domain tables.
-- NOTE: Policies here are intentionally broad for authenticated users.
--       Senior dev should tighten based on actual role claims.

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_payroll_periods_updated_at') THEN
    CREATE TRIGGER trg_payroll_periods_updated_at
    BEFORE UPDATE ON public.payroll_periods
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_payroll_runs_updated_at') THEN
    CREATE TRIGGER trg_payroll_runs_updated_at
    BEFORE UPDATE ON public.payroll_runs
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_pre_updated_at') THEN
    CREATE TRIGGER trg_pre_updated_at
    BEFORE UPDATE ON public.payroll_run_employees
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_leave_policy_updated_at') THEN
    CREATE TRIGGER trg_leave_policy_updated_at
    BEFORE UPDATE ON public.leave_credit_policies
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_ot_updated_at') THEN
    CREATE TRIGGER trg_ot_updated_at
    BEFORE UPDATE ON public.overtime_entries
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_loan_accounts_updated_at') THEN
    CREATE TRIGGER trg_loan_accounts_updated_at
    BEFORE UPDATE ON public.loan_accounts
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_loan_installments_updated_at') THEN
    CREATE TRIGGER trg_loan_installments_updated_at
    BEFORE UPDATE ON public.loan_installments
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_erd_updated_at') THEN
    CREATE TRIGGER trg_erd_updated_at
    BEFORE UPDATE ON public.employee_recurring_deductions
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

ALTER TABLE public.payroll_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_run_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_run_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_credit_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_credit_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_balance_yearly ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.overtime_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.overtime_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deduction_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_recurring_deductions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_one_time_deductions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manual_override_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payslip_snapshots ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  t RECORD;
BEGIN
  FOR t IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename IN (
        'payroll_periods','payroll_runs','payroll_run_employees','payroll_run_lines',
        'leave_credit_policies','leave_credit_ledger','leave_balance_yearly',
        'overtime_entries','overtime_overrides',
        'deduction_catalog','employee_recurring_deductions','employee_one_time_deductions',
        'loan_accounts','loan_installments','loan_transactions',
        'payroll_adjustments','payroll_exceptions','manual_override_audit','payslip_snapshots'
      )
  LOOP
    IF NOT EXISTS (
      SELECT 1
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = t.tablename
        AND policyname = 'auth_full_' || t.tablename
    ) THEN
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true);',
        'auth_full_' || t.tablename,
        t.tablename
      );
    END IF;
  END LOOP;
END $$;
