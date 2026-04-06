-- Leave Requests Table
CREATE TABLE IF NOT EXISTS leave_requests (
    id SERIAL PRIMARY KEY,
    employer_registration_id BIGINT REFERENCES employer_registration(id) ON DELETE CASCADE,
    leave_type TEXT NOT NULL,
    reason TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;

-- Allow read/write for authenticated users (adjust as needed for your auth)
CREATE POLICY "Enable all for authenticated users" ON leave_requests
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Allow anon access (adjust in production)
CREATE POLICY "Enable all for anon" ON leave_requests
    FOR ALL
    TO anon
    USING (true)
    WITH CHECK (true);
