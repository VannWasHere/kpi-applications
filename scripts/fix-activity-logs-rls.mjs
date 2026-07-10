import postgres from 'postgres'

const sql = postgres(
  'postgresql://postgres:kpiapps123_@db.rodftwezojvtlrzacsqi.supabase.co:5432/postgres',
  { ssl: 'require' }
)

const fixes = `
-- Allow authenticated users to INSERT into activity_logs (triggers write here)
DROP POLICY IF EXISTS "activity_logs_insert_authenticated" ON public.activity_logs;
CREATE POLICY "activity_logs_insert_authenticated" ON public.activity_logs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Make the log_activity function SECURITY DEFINER so it bypasses RLS
CREATE OR REPLACE FUNCTION public.log_activity(
  p_actor_id uuid,
  p_action text,
  p_entity_type text,
  p_entity_id uuid,
  p_description text
)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO public.activity_logs (actor_id, action, entity_type, entity_id, description)
  VALUES (p_actor_id, p_action, p_entity_type, p_entity_id, p_description);
$$;

-- Make trigger functions that call log_activity also SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.trg_log_kpi_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF tg_op = 'INSERT' THEN
    PERFORM public.log_activity(new.created_by, 'created', 'kpi', new.id, 'KPI "' || new.title || '" was created');
  ELSIF tg_op = 'UPDATE' THEN
    PERFORM public.log_activity(new.created_by, 'updated', 'kpi', new.id, 'KPI "' || new.title || '" was updated');
  END IF;
  RETURN new;
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_log_employee_kpi_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_employee_name text;
  v_kpi_title text;
BEGIN
  SELECT full_name INTO v_employee_name FROM public.employees WHERE id = new.employee_id;
  SELECT title INTO v_kpi_title FROM public.kpis WHERE id = new.kpi_id;

  PERFORM public.log_activity(
    null,
    'progress_update',
    'employee_kpi',
    new.id,
    coalesce(v_employee_name, 'An employee') || ' updated progress on "' || coalesce(v_kpi_title, 'a KPI') || '"'
  );
  RETURN new;
END;
$$;
`

console.log('Fixing activity_logs RLS and trigger functions...')
await sql.unsafe(fixes)
console.log('✓ Done!')
await sql.end()
