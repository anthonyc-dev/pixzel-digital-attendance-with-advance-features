CREATE TABLE IF NOT EXISTS dtr (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  employer_registration_id BIGINT NOT NULL REFERENCES employer_registration(id) ON DELETE CASCADE,
  
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  time_in TIMESTAMPTZ,
  time_out TIMESTAMPTZ,
  
  total_hours NUMERIC(5,2),
  overtime_minutes INTEGER DEFAULT 0,
  
  status TEXT CHECK (status IN ('present', 'late', 'absent', 'on_leave')) DEFAULT 'present',
  is_late BOOLEAN DEFAULT false,
  
  excuse TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dtr_employer_registration_id ON dtr(employer_registration_id);
CREATE INDEX idx_dtr_date ON dtr(date DESC);
