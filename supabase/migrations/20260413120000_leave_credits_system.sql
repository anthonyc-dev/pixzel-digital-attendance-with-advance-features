-- Leave credits, transactions, leave request extensions, payroll adjustment link

-- ---------------------------------------------------------------------------
-- Helpers: working days (Mon–Fri), consistent with lib/payroll/processor UTC logic
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.count_working_days(p_start date, p_end date)
RETURNS integer
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT COUNT(*)::integer
  FROM generate_series(p_start, p_end, '1 day'::interval) AS d(dt)
  WHERE EXTRACT(DOW FROM d.dt::date) NOT IN (0, 6);
$$;

-- Credit need per calendar year for a leave span (handles cross-year leaves)
CREATE OR REPLACE FUNCTION public.leave_credit_need_by_year(p_start date, p_end date, p_per_day numeric)
RETURNS TABLE(yr integer, need numeric)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  y_lo integer;
  y_hi integer;
  y integer;
  seg_start date;
  seg_end date;
  n numeric;
BEGIN
  y_lo := EXTRACT(YEAR FROM p_start)::integer;
  y_hi := EXTRACT(YEAR FROM p_end)::integer;
  FOR y IN y_lo..y_hi LOOP
    seg_start := GREATEST(p_start, make_date(y, 1, 1));
    seg_end := LEAST(p_end, make_date(y, 12, 31));
    IF seg_end < seg_start THEN
      CONTINUE;
    END IF;
    n := public.count_working_days(seg_start, seg_end) * p_per_day;
    IF n > 0 THEN
      yr := y;
      need := n;
      RETURN NEXT;
    END IF;
  END LOOP;
END;
$$;

-- ---------------------------------------------------------------------------
-- employee_leave_credits
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.employee_leave_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_registration_id bigint NOT NULL REFERENCES public.employer_registration(id) ON DELETE CASCADE,
  year integer NOT NULL CHECK (year >= 2000 AND year <= 2100),
  total_credits numeric(6, 2) NOT NULL DEFAULT 10 CHECK (total_credits >= 0),
  used_credits numeric(6, 2) NOT NULL DEFAULT 0 CHECK (used_credits >= 0),
  remaining_credits numeric(6, 2) GENERATED ALWAYS AS (total_credits - used_credits) STORED,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT employee_leave_credits_used_lte_total CHECK (used_credits <= total_credits),
  CONSTRAINT employee_leave_credits_employee_year UNIQUE (employer_registration_id, year)
);

CREATE INDEX IF NOT EXISTS idx_employee_leave_credits_employer
  ON public.employee_leave_credits (employer_registration_id);

ALTER TABLE public.employee_leave_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "employee_leave_credits authenticated"
  ON public.employee_leave_credits FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "employee_leave_credits anon"
  ON public.employee_leave_credits FOR ALL TO anon USING (true) WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- leave_credit_transactions
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.leave_credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_registration_id bigint NOT NULL REFERENCES public.employer_registration(id) ON DELETE CASCADE,
  leave_id integer NOT NULL REFERENCES public.leave_requests(id) ON DELETE CASCADE,
  change numeric(6, 2) NOT NULL,
  reason text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_leave_credit_tx_employee
  ON public.leave_credit_transactions (employer_registration_id, created_at DESC);

ALTER TABLE public.leave_credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "leave_credit_transactions authenticated"
  ON public.leave_credit_transactions FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "leave_credit_transactions anon"
  ON public.leave_credit_transactions FOR ALL TO anon USING (true) WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- leave_requests: duration, payment outcome, approval metadata
-- ---------------------------------------------------------------------------
ALTER TABLE public.leave_requests
  ADD COLUMN IF NOT EXISTS duration text NOT NULL DEFAULT 'FULL_DAY'
    CHECK (duration IN ('FULL_DAY', 'HALF_DAY')),
  ADD COLUMN IF NOT EXISTS leave_payment_kind text
    CHECK (leave_payment_kind IS NULL OR leave_payment_kind IN ('PAID', 'UNPAID')),
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS credits_consumed numeric(6, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payroll_adjustment_created boolean NOT NULL DEFAULT false;

-- ---------------------------------------------------------------------------
-- payroll_adjustments: late paid leave + link to leave row (idempotency)
-- ---------------------------------------------------------------------------
ALTER TABLE public.payroll_adjustments
  ADD COLUMN IF NOT EXISTS leave_request_id integer REFERENCES public.leave_requests(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_payroll_adjustments_one_per_leave
  ON public.payroll_adjustments (leave_request_id)
  WHERE leave_request_id IS NOT NULL;

ALTER TABLE public.payroll_adjustments DROP CONSTRAINT IF EXISTS payroll_adjustments_type_check;

ALTER TABLE public.payroll_adjustments ADD CONSTRAINT payroll_adjustments_type_check
  CHECK (type IN (
    'unpaid_late',
    'unprocessed_leave',
    'correction',
    'manual',
    'late_paid_leave_addition'
  ));

-- ---------------------------------------------------------------------------
-- RPC: atomic approve + credit deduction (never negative credits)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.approve_leave_request_with_credits(p_leave_id integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r public.leave_requests%ROWTYPE;
  v_consumes boolean;
  v_per_day numeric;
  rec record;
  ec public.employee_leave_credits%ROWTYPE;
  all_ok boolean := true;
BEGIN
  SELECT * INTO r FROM public.leave_requests WHERE id = p_leave_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_found');
  END IF;
  IF r.status <> 'pending' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'already_resolved', 'status', r.status);
  END IF;

  v_consumes := r.leave_type NOT ILIKE '%unpaid%';
  v_per_day := CASE WHEN r.duration = 'HALF_DAY' THEN 0.5 ELSE 1 END;

  IF NOT v_consumes THEN
    UPDATE public.leave_requests
    SET
      status = 'approved',
      approved_at = now(),
      leave_payment_kind = 'UNPAID',
      credits_consumed = 0
    WHERE id = p_leave_id;

    RETURN jsonb_build_object(
      'ok', true,
      'leave_payment_kind', 'UNPAID',
      'credits_consumed', 0,
      'consumes_credits', false
    );
  END IF;

  -- Ensure rows exist for every year we need
  FOR rec IN
    SELECT * FROM public.leave_credit_need_by_year(r.start_date, r.end_date, v_per_day) ORDER BY yr
  LOOP
    INSERT INTO public.employee_leave_credits (employer_registration_id, year, total_credits, used_credits)
    VALUES (r.employer_registration_id, rec.yr, 10, 0)
    ON CONFLICT (employer_registration_id, year) DO NOTHING;
  END LOOP;

  -- Pre-check all years have enough remaining
  FOR rec IN
    SELECT * FROM public.leave_credit_need_by_year(r.start_date, r.end_date, v_per_day) ORDER BY yr
  LOOP
    SELECT * INTO ec
    FROM public.employee_leave_credits
    WHERE employer_registration_id = r.employer_registration_id AND year = rec.yr
    FOR UPDATE;

    IF ec.total_credits - ec.used_credits < rec.need THEN
      all_ok := false;
      EXIT;
    END IF;
  END LOOP;

  IF NOT all_ok THEN
    UPDATE public.leave_requests
    SET
      status = 'approved',
      approved_at = now(),
      leave_payment_kind = 'UNPAID',
      credits_consumed = 0
    WHERE id = p_leave_id;

    RETURN jsonb_build_object(
      'ok', true,
      'leave_payment_kind', 'UNPAID',
      'credits_consumed', 0,
      'note', 'insufficient_credits'
    );
  END IF;

  -- Deduct per year
  FOR rec IN
    SELECT * FROM public.leave_credit_need_by_year(r.start_date, r.end_date, v_per_day) ORDER BY yr
  LOOP
    SELECT * INTO ec
    FROM public.employee_leave_credits
    WHERE employer_registration_id = r.employer_registration_id AND year = rec.yr
    FOR UPDATE;

    UPDATE public.employee_leave_credits
    SET used_credits = used_credits + rec.need
    WHERE id = ec.id;

    INSERT INTO public.leave_credit_transactions (employer_registration_id, leave_id, change, reason)
    VALUES (r.employer_registration_id, p_leave_id, -rec.need, 'leave_approval_year_' || rec.yr::text);
  END LOOP;

  UPDATE public.leave_requests
  SET
    status = 'approved',
    approved_at = now(),
    leave_payment_kind = 'PAID',
    credits_consumed = (
      SELECT COALESCE(SUM(lcn.need), 0)
      FROM public.leave_credit_need_by_year(r.start_date, r.end_date, v_per_day) lcn
    )
  WHERE id = p_leave_id;

  RETURN jsonb_build_object(
    'ok', true,
    'leave_payment_kind', 'PAID',
    'credits_consumed', (
      SELECT COALESCE(SUM(lcn.need), 0)
      FROM public.leave_credit_need_by_year(r.start_date, r.end_date, v_per_day) lcn
    ),
    'consumes_credits', true
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.count_working_days(date, date) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.leave_credit_need_by_year(date, date, numeric) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.approve_leave_request_with_credits(integer) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reset_employee_leave_credits_year(integer) TO anon, authenticated;

-- Reset all active employees to 10 credits for a given year (used_credits = 0)
CREATE OR REPLACE FUNCTION public.reset_employee_leave_credits_year(p_year integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  n integer := 0;
BEGIN
  INSERT INTO public.employee_leave_credits (employer_registration_id, year, total_credits, used_credits)
  SELECT id, p_year, 10, 0
  FROM public.employer_registration
  WHERE status = 'active'
  ON CONFLICT (employer_registration_id, year) DO UPDATE
  SET total_credits = 10, used_credits = 0;

  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END;
$$;
