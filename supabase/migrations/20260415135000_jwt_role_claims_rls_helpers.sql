-- JWT app role claims for RLS (Supabase Auth).
--
-- Set roles via Supabase Dashboard → Authentication → Users → user → App metadata, e.g.:
--   { "role": "admin" }
-- or
--   { "roles": ["payroll_admin"] }
--
-- Prefer app_metadata (not user_metadata) for authorization — only service role / admin API should change it.
-- After changing metadata, the user may need to refresh the session (re-login or refreshSession) for JWT to include new claims.

-- ---------------------------------------------------------------------------
-- Single primary role from JWT app_metadata (string).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.jwt_app_role()
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(TRIM(LOWER(COALESCE(
    auth.jwt()->'app_metadata'->>'role',
    ''
  ))), '');
$$;

-- ---------------------------------------------------------------------------
-- True if JWT includes a given role via app_metadata.role OR app_metadata.roles[].
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.has_app_role(check_role TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT
    check_role IS NOT NULL
    AND TRIM(LOWER(check_role)) <> ''
    AND (
      public.jwt_app_role() = TRIM(LOWER(check_role))
      OR EXISTS (
        SELECT 1
        FROM jsonb_array_elements_text(COALESCE(auth.jwt()->'app_metadata'->'roles', '[]'::jsonb)) AS r(role_name)
        WHERE TRIM(LOWER(role_name)) = TRIM(LOWER(check_role))
      )
    );
$$;

-- ---------------------------------------------------------------------------
-- Employee role — use in future policies (e.g. read own rows only).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_employee_role()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT public.has_app_role('employee');
$$;

-- ---------------------------------------------------------------------------
-- Payroll / admin access — JWT claims only (no blanket "authenticated").
-- service_role still bypasses for server-side jobs using the service key.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_payroll_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT
    COALESCE(auth.role() = 'service_role', FALSE)
    OR public.has_app_role('admin')
    OR public.has_app_role('payroll_admin')
    OR public.has_app_role('payroll_manager')
    -- Legacy: some projects set top-level JWT role (not recommended; prefer app_metadata)
    OR COALESCE(auth.jwt()->>'role' IN ('admin', 'payroll_admin', 'payroll_manager'), FALSE);
$$;

COMMENT ON FUNCTION public.jwt_app_role() IS 'Lowercased app_metadata.role from JWT, or empty if unset.';
COMMENT ON FUNCTION public.has_app_role(TEXT) IS 'True if app_metadata.role or app_metadata.roles[] matches.';
COMMENT ON FUNCTION public.is_employee_role() IS 'True if JWT app role is employee (for future employee-scoped RLS).';
COMMENT ON FUNCTION public.is_payroll_admin() IS 'True for service_role or admin/payroll roles in JWT app_metadata.';
