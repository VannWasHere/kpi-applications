-- =====================================================================
-- KPI Application — Functions & Triggers
-- Automatic KPI calculation, evaluation rollups, and bookkeeping.
-- =====================================================================

-- ---------------------------------------------------------------------
-- generic updated_at maintenance
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_updated_at on public.profiles;
create trigger set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.employees;
create trigger set_updated_at before update on public.employees
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.kpis;
create trigger set_updated_at before update on public.kpis
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.employee_kpis;
create trigger set_updated_at before update on public.employee_kpis
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.evaluations;
create trigger set_updated_at before update on public.evaluations
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- handle_new_auth_user
-- Automatically creates a profile row whenever a new Supabase Auth
-- user is created. Role defaults to 'karyawan' unless explicitly
-- passed in user metadata (e.g. by an admin-only invite flow).
-- ---------------------------------------------------------------------
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'role', 'karyawan')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- ---------------------------------------------------------------------
-- rating_from_score
-- Maps a 0-100 score to a performance rating label per the spec:
--   90-100 Excellent | 80-89 Good | 70-79 Average
--   60-69 Needs Improvement | <60 Poor
-- ---------------------------------------------------------------------
create or replace function public.rating_from_score(score numeric)
returns text
language sql
immutable
as $$
  select case
    when score >= 90 then 'Excellent'
    when score >= 80 then 'Good'
    when score >= 70 then 'Average'
    when score >= 60 then 'Needs Improvement'
    else 'Poor'
  end;
$$;

-- ---------------------------------------------------------------------
-- calculate_employee_kpi_progress
-- Recalculates progress_percent and weighted_score for an
-- employee_kpis row whenever current_value, or the parent KPI's
-- target/weight, changes.
-- ---------------------------------------------------------------------
create or replace function public.calculate_employee_kpi_progress()
returns trigger
language plpgsql
as $$
declare
  v_target numeric;
  v_weight numeric;
  v_progress numeric;
begin
  select target, weight into v_target, v_weight
  from public.kpis
  where id = new.kpi_id;

  if v_target is null or v_target = 0 then
    v_progress := 0;
  else
    v_progress := round(least(new.current_value / v_target, 1) * 100, 2);
  end if;

  new.progress_percent := v_progress;
  new.weighted_score := round(v_progress * coalesce(v_weight, 0) / 100, 2);

  if v_progress >= 100 then
    new.status := 'completed';
  elsif v_progress > 0 then
    new.status := 'in_progress';
  else
    new.status := 'not_started';
  end if;

  return new;
end;
$$;

drop trigger if exists calculate_employee_kpi_progress on public.employee_kpis;
create trigger calculate_employee_kpi_progress
  before insert or update of current_value, kpi_id
  on public.employee_kpis
  for each row execute function public.calculate_employee_kpi_progress();

-- ---------------------------------------------------------------------
-- recalculate_kpi_dependents
-- When a KPI's target/weight changes, re-touch dependent employee_kpis
-- rows so their scores are recalculated against the new values.
-- ---------------------------------------------------------------------
create or replace function public.recalculate_kpi_dependents()
returns trigger
language plpgsql
as $$
begin
  if new.target is distinct from old.target or new.weight is distinct from old.weight then
    update public.employee_kpis
    set current_value = current_value
    where kpi_id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists recalculate_kpi_dependents on public.kpis;
create trigger recalculate_kpi_dependents
  after update of target, weight on public.kpis
  for each row execute function public.recalculate_kpi_dependents();

-- ---------------------------------------------------------------------
-- refresh_employee_evaluation
-- Recomputes the overall evaluation for an employee for the period
-- matching the KPI's due date (YYYY-MM), based on the weighted average
-- of all their assigned KPIs' weighted_score for that period. Also
-- appends a snapshot row to evaluation_history.
-- ---------------------------------------------------------------------
create or replace function public.refresh_employee_evaluation(
  p_employee_id uuid,
  p_period text
)
returns void
language plpgsql
as $$
declare
  v_total_weight numeric;
  v_total_weighted numeric;
  v_score numeric;
  v_rating text;
  v_evaluation_id uuid;
begin
  select
    coalesce(sum(k.weight), 0),
    coalesce(sum(ek.weighted_score), 0)
  into v_total_weight, v_total_weighted
  from public.employee_kpis ek
  join public.kpis k on k.id = ek.kpi_id
  where ek.employee_id = p_employee_id
    and to_char(k.due_date, 'YYYY-MM') = p_period;

  if v_total_weight = 0 then
    v_score := 0;
  else
    v_score := round(v_total_weighted / v_total_weight * 100, 2);
  end if;

  v_rating := public.rating_from_score(v_score);

  insert into public.evaluations (employee_id, period, kpi_score, rating, status)
  values (p_employee_id, p_period, v_score, v_rating, 'submitted')
  on conflict (employee_id, period)
  do update set
    kpi_score = excluded.kpi_score,
    rating = excluded.rating,
    status = case when public.evaluations.status = 'finalized'
                   then public.evaluations.status
                   else excluded.status end
  returning id into v_evaluation_id;

  insert into public.evaluation_history (
    evaluation_id, employee_id, period, kpi_score, rating, comments, status
  )
  select id, employee_id, period, kpi_score, rating, comments, status
  from public.evaluations
  where id = v_evaluation_id;
end;
$$;

-- ---------------------------------------------------------------------
-- trg_refresh_evaluation_on_kpi_change
-- Fires refresh_employee_evaluation whenever an employee_kpis row's
-- score-relevant fields change.
-- ---------------------------------------------------------------------
create or replace function public.trg_refresh_evaluation_on_kpi_change()
returns trigger
language plpgsql
as $$
declare
  v_period text;
begin
  select to_char(due_date, 'YYYY-MM') into v_period
  from public.kpis
  where id = new.kpi_id;

  if v_period is not null then
    perform public.refresh_employee_evaluation(new.employee_id, v_period);
  end if;

  return new;
end;
$$;

drop trigger if exists refresh_evaluation_on_kpi_change on public.employee_kpis;
create trigger refresh_evaluation_on_kpi_change
  after insert or update of current_value, progress_percent, weighted_score
  on public.employee_kpis
  for each row execute function public.trg_refresh_evaluation_on_kpi_change();

-- ---------------------------------------------------------------------
-- log_activity helper + convenience triggers for the activity feed
-- ---------------------------------------------------------------------
create or replace function public.log_activity(
  p_actor_id uuid,
  p_action text,
  p_entity_type text,
  p_entity_id uuid,
  p_description text
)
returns void
language sql
as $$
  insert into public.activity_logs (actor_id, action, entity_type, entity_id, description)
  values (p_actor_id, p_action, p_entity_type, p_entity_id, p_description);
$$;

create or replace function public.trg_log_kpi_activity()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    perform public.log_activity(new.created_by, 'created', 'kpi', new.id, 'KPI "' || new.title || '" was created');
  elsif tg_op = 'UPDATE' then
    perform public.log_activity(new.created_by, 'updated', 'kpi', new.id, 'KPI "' || new.title || '" was updated');
  end if;
  return new;
end;
$$;

drop trigger if exists log_kpi_activity on public.kpis;
create trigger log_kpi_activity
  after insert or update on public.kpis
  for each row execute function public.trg_log_kpi_activity();

create or replace function public.trg_log_employee_kpi_activity()
returns trigger
language plpgsql
as $$
declare
  v_employee_name text;
  v_kpi_title text;
begin
  select full_name into v_employee_name from public.employees where id = new.employee_id;
  select title into v_kpi_title from public.kpis where id = new.kpi_id;

  perform public.log_activity(
    null,
    'progress_update',
    'employee_kpi',
    new.id,
    coalesce(v_employee_name, 'An employee') || ' updated progress on "' || coalesce(v_kpi_title, 'a KPI') || '"'
  );
  return new;
end;
$$;

drop trigger if exists log_employee_kpi_activity on public.employee_kpis;
create trigger log_employee_kpi_activity
  after update of current_value on public.employee_kpis
  for each row execute function public.trg_log_employee_kpi_activity();
