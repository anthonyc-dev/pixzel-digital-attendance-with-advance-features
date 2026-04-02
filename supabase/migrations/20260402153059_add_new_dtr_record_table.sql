CREATE TABLE IF NOT EXISTS payroll (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  employer_registration_id BIGINT NOT NULL REFERENCES employer_registration(id) ON DELETE CASCADE,

  full_name TEXT NOT NULL,
  position TEXT,

  base_salary NUMERIC(12,2) NOT NULL,
  allowances NUMERIC(12,2) DEFAULT 0,

  gross_pay NUMERIC(12,2) NOT NULL,
  overtime_pay NUMERIC(12,2) DEFAULT 0,

  sss NUMERIC(12,2) DEFAULT 0,
  philhealth NUMERIC(12,2) DEFAULT 0,
  pagibig NUMERIC(12,2) DEFAULT 0,
  tax NUMERIC(12,2) DEFAULT 0,

  total_deductions NUMERIC(12,2) GENERATED ALWAYS AS (
    sss + philhealth + pagibig + tax
  ) STORED,

  net_pay NUMERIC(12,2) NOT NULL,

  payment_method TEXT,
  period TEXT,

  status TEXT CHECK (status IN ('pending', 'processed', 'paid')) DEFAULT 'pending',

  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

