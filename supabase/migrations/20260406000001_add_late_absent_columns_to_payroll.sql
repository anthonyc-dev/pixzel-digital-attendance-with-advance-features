-- Add late_count and absent_count columns to payroll_records
ALTER TABLE payroll_records
ADD COLUMN IF NOT EXISTS late_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS absent_count INTEGER DEFAULT 0;
