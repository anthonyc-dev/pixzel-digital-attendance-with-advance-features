-- Payroll MVP foundation (breaks, overtime, leave types, cutoffs, carry-over)

CREATE TABLE IF NOT EXISTS leave_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  is_paid BOOLEAN NOT NULL DEFAULT TRUE,
  percentage_pay NUMERIC(5,2) NOT NULL DEFAULT 100.00 CHECK (percentage_pay >= 0 AND percentage_pay <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO leave_types (name, is_paid, percentage_pay)
VALUES
  ('paid', TRUE, 100.00),
  ('unpaid', FALSE, 0.00)
ON CONFLICT (name) DO NOTHING;

ALTER TABLE leave_requests
ADD COLUMN IF NOT EXISTS leave_type_id UUID REFERENCES leave_types(id),
ADD COLUMN IF NOT EXISTS applied BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS break_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_registration_id BIGINT NOT NULL REFERENCES employer_registration(id) ON DELETE CASCADE,
  work_date DATE NOT NULL,
  attendance_log_id UUID REFERENCES attendance_logs(id) ON DELETE SET NULL,
  break_type TEXT NOT NULL CHECK (break_type IN ('regular', 'client_meeting')),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  is_paid BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT break_logs_time_order CHECK (end_time > start_time)
);

CREATE INDEX IF NOT EXISTS idx_break_logs_employee_work_date
ON break_logs(employer_registration_id, work_date);

CREATE TABLE IF NOT EXISTS payroll_cutoffs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_processed BOOLEAN NOT NULL DEFAULT FALSE,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT payroll_cutoffs_date_range CHECK (end_date >= start_date),
  CONSTRAINT payroll_cutoffs_unique_period UNIQUE (start_date, end_date)
);

CREATE TABLE IF NOT EXISTS payroll_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_registration_id BIGINT NOT NULL REFERENCES employer_registration(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('unpaid_late', 'unprocessed_leave', 'correction', 'manual')),
  reference_date DATE NOT NULL,
  minutes INTEGER DEFAULT 0,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  notes TEXT,
  applied BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payroll_adjustments_lookup
ON payroll_adjustments(employer_registration_id, applied, reference_date);

ALTER TABLE payroll_records
ADD COLUMN IF NOT EXISTS payroll_cutoff_id UUID REFERENCES payroll_cutoffs(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS late_deduction NUMERIC(12,2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS absent_deduction NUMERIC(12,2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS break_deduction NUMERIC(12,2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS leave_pay NUMERIC(12,2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS allowances_adjustment NUMERIC(12,2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS other_deductions NUMERIC(12,2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS loan_deduction NUMERIC(12,2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS carry_over_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_deduction NUMERIC(12,2) NOT NULL DEFAULT 0;

