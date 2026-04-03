CREATE TABLE IF NOT EXISTS dtr_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  employer_registration_id BIGINT NOT NULL REFERENCES employer_registration(id) ON DELETE CASCADE,

  employer_id TEXT NOT NULL,
  employer_name TEXT NOT NULL,
  employer_position TEXT,
  department TEXT,

  time_in TIME,
  time_out TIME,

  total_hours NUMERIC(5,2),
  overtime_minutes INTEGER DEFAULT 0,

  is_late BOOLEAN DEFAULT FALSE,
  status TEXT CHECK (status IN ('active', 'inactive')) DEFAULT 'active',

  excuse TEXT,

  image TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Indexes (important for performance)
CREATE INDEX idx_dtr_records_employer_registration_id
ON dtr_records(employer_registration_id);
CREATE INDEX idx_dtr_records_created_at ON dtr_records(created_at DESC);