CREATE TABLE IF NOT EXISTS payroll_deduction_settings (
  id               BIGSERIAL PRIMARY KEY,
  late_deduction   NUMERIC(12,2) NOT NULL DEFAULT 50.00,
  absent_deduction NUMERIC(12,2) NOT NULL DEFAULT 100.00,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Seed one default row
INSERT INTO payroll_deduction_settings (late_deduction, absent_deduction)
VALUES (50.00, 100.00);
