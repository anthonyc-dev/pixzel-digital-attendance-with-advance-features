-- Align payroll RLS helper with current app auth model.
-- Current app has Supabase authenticated sessions but may not yet set role claims.
-- This keeps anon blocked while allowing authenticated users until full RBAC claims are wired.

CREATE OR REPLACE FUNCTION public.is_payroll_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT
    COALESCE(auth.role() = 'service_role', FALSE)
    OR COALESCE(auth.role() = 'authenticated', FALSE)
    OR COALESCE(auth.jwt()->>'role' IN ('admin', 'payroll_admin', 'payroll_manager'), FALSE)
    OR COALESCE(auth.jwt()->'app_metadata'->>'role' IN ('admin', 'payroll_admin', 'payroll_manager'), FALSE)
    OR EXISTS (
      SELECT 1
      FROM jsonb_array_elements_text(COALESCE(auth.jwt()->'app_metadata'->'roles', '[]'::jsonb)) AS r(role_name)
      WHERE r.role_name IN ('admin', 'payroll_admin', 'payroll_manager')
    );
$$;
