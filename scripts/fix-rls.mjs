import postgres from 'postgres'

const sql = postgres(
  'postgresql://postgres:kpiapps123_@db.rodftwezojvtlrzacsqi.supabase.co:5432/postgres',
  { ssl: 'require' }
)

// Fix: The "for all" policy doesn't always work well with upserts.
// Split into explicit SELECT/INSERT/UPDATE/DELETE policies for employee_kpis.
// Also ensure evaluation_history allows inserts from trigger functions.
const fixes = `
-- Drop the broad "for all" admin policy on employee_kpis and replace with explicit ones
DROP POLICY IF EXISTS "employee_kpis_admin_all" ON public.employee_kpis;

CREATE POLICY "employee_kpis_admin_select" ON public.employee_kpis
  FOR SELECT USING (public.is_admin());

CREATE POLICY "employee_kpis_admin_insert" ON public.employee_kpis
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "employee_kpis_admin_update" ON public.employee_kpis
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "employee_kpis_admin_delete" ON public.employee_kpis
  FOR DELETE USING (public.is_admin());

-- Same fix for evaluations
DROP POLICY IF EXISTS "evaluations_admin_all" ON public.evaluations;

CREATE POLICY "evaluations_admin_select" ON public.evaluations
  FOR SELECT USING (public.is_admin());

CREATE POLICY "evaluations_admin_insert" ON public.evaluations
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "evaluations_admin_update" ON public.evaluations
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "evaluations_admin_delete" ON public.evaluations
  FOR DELETE USING (public.is_admin());

-- The refresh_employee_evaluation function writes to evaluations and evaluation_history.
-- It needs SECURITY DEFINER to bypass RLS (it already has it, but let's ensure 
-- the function explicitly sets search_path and is marked correctly).
CREATE OR REPLACE FUNCTION public.refresh_employee_evaluation(
  p_employee_id uuid,
  p_period text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_weight numeric;
  v_total_weighted numeric;
  v_score numeric;
  v_rating text;
  v_evaluation_id uuid;
BEGIN
  SELECT
    coalesce(sum(k.weight), 0),
    coalesce(sum(ek.weighted_score), 0)
  INTO v_total_weight, v_total_weighted
  FROM public.employee_kpis ek
  JOIN public.kpis k ON k.id = ek.kpi_id
  WHERE ek.employee_id = p_employee_id
    AND to_char(k.due_date, 'YYYY-MM') = p_period;

  IF v_total_weight = 0 THEN
    v_score := 0;
  ELSE
    v_score := round(v_total_weighted / v_total_weight * 100, 2);
  END IF;

  v_rating := public.rating_from_score(v_score);

  INSERT INTO public.evaluations (employee_id, period, kpi_score, rating, status)
  VALUES (p_employee_id, p_period, v_score, v_rating, 'submitted')
  ON CONFLICT (employee_id, period)
  DO UPDATE SET
    kpi_score = EXCLUDED.kpi_score,
    rating = EXCLUDED.rating,
    status = CASE WHEN public.evaluations.status = 'finalized'
                   THEN public.evaluations.status
                   ELSE EXCLUDED.status END
  RETURNING id INTO v_evaluation_id;

  INSERT INTO public.evaluation_history (
    evaluation_id, employee_id, period, kpi_score, rating, comments, status
  )
  SELECT id, employee_id, period, kpi_score, rating, comments, status
  FROM public.evaluations
  WHERE id = v_evaluation_id;
END;
$$;

-- Also make the trigger that calls refresh_employee_evaluation SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.trg_refresh_evaluation_on_kpi_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_period text;
BEGIN
  SELECT to_char(due_date, 'YYYY-MM') INTO v_period
  FROM public.kpis
  WHERE id = new.kpi_id;

  IF v_period IS NOT NULL THEN
    PERFORM public.refresh_employee_evaluation(new.employee_id, v_period);
  END IF;

  RETURN new;
END;
$$;

-- Make the calculate trigger SECURITY DEFINER too so it can read kpis table
CREATE OR REPLACE FUNCTION public.calculate_employee_kpi_progress()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_target numeric;
  v_weight numeric;
  v_progress numeric;
BEGIN
  SELECT target, weight INTO v_target, v_weight
  FROM public.kpis
  WHERE id = new.kpi_id;

  IF v_target IS NULL OR v_target = 0 THEN
    v_progress := 0;
  ELSE
    v_progress := round(least(new.current_value / v_target, 1) * 100, 2);
  END IF;

  new.progress_percent := v_progress;
  new.weighted_score := round(v_progress * coalesce(v_weight, 0) / 100, 2);

  IF v_progress >= 100 THEN
    new.status := 'completed';
  ELSIF v_progress > 0 THEN
    new.status := 'in_progress';
  ELSE
    new.status := 'not_started';
  END IF;

  RETURN new;
END;
$$;
`

console.log('Applying RLS fixes...')
await sql.unsafe(fixes)
console.log('✓ Done! RLS policies and trigger functions fixed.')
await sql.end()
