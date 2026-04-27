-- RBAC: link Supabase auth users to employer_registration; split leave_requests and
-- payroll_records policies so staff (admin/hr/payroll_*) retain full access while
-- employees see only their own rows via auth_user_id.

-- ---------------------------------------------------------------------------
-- 1) Employee ↔ auth user (nullable for legacy rows; HR sets when onboarding)
-- ---------------------------------------------------------------------------
ALTER TABLE public.employer_registration
  ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users (id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_employer_registration_auth_user_id
  ON public.employer_registration (auth_user_id)
  WHERE auth_user_id IS NOT NULL;

COMMENT ON COLUMN public.employer_registration.auth_user_id IS
  'Supabase auth user id for this employee; used for employee-scoped RLS.';

-- ---------------------------------------------------------------------------
-- 2) Payroll / HR JWT helper — include hr (and keep legacy checks)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_payroll_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT
    COALESCE(auth.role() = 'service_role', FALSE)
    OR COALESCE(auth.jwt()->>'role' IN ('admin', 'hr', 'payroll_admin', 'payroll_manager'), FALSE)
    OR COALESCE(auth.jwt()->'app_metadata'->>'role' IN ('admin', 'hr', 'payroll_admin', 'payroll_manager'), FALSE)
    OR EXISTS (
      SELECT 1
      FROM jsonb_array_elements_text(COALESCE(auth.jwt()->'app_metadata'->'roles', '[]'::jsonb)) AS r(role_name)
      WHERE r.role_name IN ('admin', 'hr', 'payroll_admin', 'payroll_manager')
    );
$$;

-- ---------------------------------------------------------------------------
-- 3) Compatibility guard for older leave_requests schema
-- ---------------------------------------------------------------------------
ALTER TABLE public.leave_requests
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS applied BOOLEAN DEFAULT FALSE;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'leave_requests_status_check'
      AND conrelid = 'public.leave_requests'::regclass
  ) THEN
    ALTER TABLE public.leave_requests
      ADD CONSTRAINT leave_requests_status_check
      CHECK (status IN ('pending', 'approved', 'rejected'));
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 4) leave_requests — replace single admin-only policy with staff + employee
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS payroll_admin_only_leave_requests ON public.leave_requests;

CREATE POLICY leave_requests_staff_all ON public.leave_requests
  FOR ALL
  TO authenticated
  USING (public.is_payroll_admin())
  WITH CHECK (public.is_payroll_admin());

CREATE POLICY leave_requests_owner_select ON public.leave_requests
  FOR SELECT
  TO authenticated
  USING (
    employer_registration_id IN (
      SELECT er.id FROM public.employer_registration er WHERE er.auth_user_id = auth.uid()
    )
  );

CREATE POLICY leave_requests_owner_insert ON public.leave_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (
    employer_registration_id IN (
      SELECT er.id FROM public.employer_registration er WHERE er.auth_user_id = auth.uid()
    )
  );

CREATE POLICY leave_requests_owner_update_pending ON public.leave_requests
  FOR UPDATE
  TO authenticated
  USING (
    employer_registration_id IN (
      SELECT er.id FROM public.employer_registration er WHERE er.auth_user_id = auth.uid()
    )
    AND status = 'pending'
  )
  WITH CHECK (
    employer_registration_id IN (
      SELECT er.id FROM public.employer_registration er WHERE er.auth_user_id = auth.uid()
    )
    AND status = 'pending'
  );

CREATE POLICY leave_requests_owner_delete_pending ON public.leave_requests
  FOR DELETE
  TO authenticated
  USING (
    employer_registration_id IN (
      SELECT er.id FROM public.employer_registration er WHERE er.auth_user_id = auth.uid()
    )
    AND status = 'pending'
  );

-- ---------------------------------------------------------------------------
-- 5) payroll_records — keep staff ALL; add employee read own
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS payroll_admin_only_payroll_records ON public.payroll_records;

CREATE POLICY payroll_records_staff_all ON public.payroll_records
  FOR ALL
  TO authenticated
  USING (public.is_payroll_admin())
  WITH CHECK (public.is_payroll_admin());

CREATE POLICY payroll_records_owner_select ON public.payroll_records
  FOR SELECT
  TO authenticated
  USING (
    employer_registration_id IN (
      SELECT er.id FROM public.employer_registration er WHERE er.auth_user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- 6) employer_registration — staff manage all; linked employees read own row
--     (needed so leave/payroll subqueries on auth_user_id work under RLS)
-- ---------------------------------------------------------------------------
CREATE POLICY employer_registration_staff_all ON public.employer_registration
  FOR ALL
  TO authenticated
  USING (public.is_payroll_admin())
  WITH CHECK (public.is_payroll_admin());

CREATE POLICY employer_registration_owner_select ON public.employer_registration
  FOR SELECT
  TO authenticated
  USING (auth_user_id IS NOT NULL AND auth_user_id = auth.uid());
