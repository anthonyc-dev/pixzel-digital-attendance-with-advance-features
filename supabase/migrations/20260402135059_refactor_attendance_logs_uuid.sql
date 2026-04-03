CREATE TABLE attendance_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employer_registration_id BIGINT NOT NULL REFERENCES employer_registration(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('time_in', 'time_out')),
  status TEXT DEFAULT 'on_time' CHECK (status IN ('on_time', 'late')),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Enable Row Level Security
ALTER TABLE employer_registration ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_logs ENABLE ROW LEVEL SECURITY;
-- Create indexes
CREATE INDEX idx_attendance_employer ON attendance_logs(employer_registration_id);
CREATE INDEX idx_attendance_timestamp ON attendance_logs(timestamp DESC);