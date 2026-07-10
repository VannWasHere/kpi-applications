-- =====================================================================
-- KPI Application — Row Level Security
-- Admin: full access to everything.
-- Karyawan (employee): can only read/update their own records.
-- =====================================================================

-- ---------------------------------------------------------------------
-- helper: is_admin()
-- SECURITY DEFINER so it can read public.profiles regardless of the
-- calling user's own row-level policies (avoids recursive RLS checks).
-- ---------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ---------------------------------------------------------------------
-- helper: current_employee_id()
-- Resolves the employees.id row linked to the calling auth user.
-- ---------------------------------------------------------------------
create or replace function public.current_employee_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select id from public.employees where profile_id = auth.uid();
$$;

alter table public.profiles enable row level security;
alter table public.departments enable row level security;
alter table public.employees enable row level security;
alter table public.kpis enable row level security;
alter table public.employee_kpis enable row level security;
alter table public.evaluations enable row level security;
alter table public.evaluation_history enable row level security;
alter table public.activity_logs enable row level security;

-- ---------------------------------------------------------------------
-- profiles
-- Everyone can read their own profile; admins can read/manage all.
-- ---------------------------------------------------------------------
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin" on public.profiles
  for update using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_admin_insert" on public.profiles;
create policy "profiles_admin_insert" on public.profiles
  for insert with check (public.is_admin() or id = auth.uid());

drop policy if exists "profiles_admin_delete" on public.profiles;
create policy "profiles_admin_delete" on public.profiles
  for delete using (public.is_admin());

-- ---------------------------------------------------------------------
-- departments — readable by any authenticated user, writable by admin
-- ---------------------------------------------------------------------
drop policy if exists "departments_select_authenticated" on public.departments;
create policy "departments_select_authenticated" on public.departments
  for select using (auth.role() = 'authenticated');

drop policy if exists "departments_admin_write" on public.departments;
create policy "departments_admin_write" on public.departments
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- employees
-- Admin: full access. Employee: can read their own record only, and
-- may update a small set of self-service fields is intentionally NOT
-- granted here (HR data is admin-managed).
-- ---------------------------------------------------------------------
drop policy if exists "employees_admin_all" on public.employees;
create policy "employees_admin_all" on public.employees
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "employees_select_own" on public.employees;
create policy "employees_select_own" on public.employees
  for select using (profile_id = auth.uid());

-- ---------------------------------------------------------------------
-- kpis
-- Admin: full access. Employee: may only read KPIs actually assigned
-- to them (join via employee_kpis).
-- ---------------------------------------------------------------------
drop policy if exists "kpis_admin_all" on public.kpis;
create policy "kpis_admin_all" on public.kpis
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "kpis_select_assigned" on public.kpis;
create policy "kpis_select_assigned" on public.kpis
  for select using (
    exists (
      select 1 from public.employee_kpis ek
      where ek.kpi_id = kpis.id
        and ek.employee_id = public.current_employee_id()
    )
  );

-- ---------------------------------------------------------------------
-- employee_kpis
-- Admin: full access (create/assign/edit/delete).
-- Employee: can read and update progress fields only on their own
-- assignments (enforced by using + with check on the same predicate;
-- field-level restriction is enforced in the application layer since
-- Postgres RLS is row-level, not column-level).
-- ---------------------------------------------------------------------
drop policy if exists "employee_kpis_admin_all" on public.employee_kpis;
create policy "employee_kpis_admin_all" on public.employee_kpis
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "employee_kpis_select_own" on public.employee_kpis;
create policy "employee_kpis_select_own" on public.employee_kpis
  for select using (employee_id = public.current_employee_id());

drop policy if exists "employee_kpis_update_own_progress" on public.employee_kpis;
create policy "employee_kpis_update_own_progress" on public.employee_kpis
  for update using (employee_id = public.current_employee_id())
  with check (employee_id = public.current_employee_id());

-- ---------------------------------------------------------------------
-- evaluations
-- Admin: full access. Employee: read-only on their own evaluations.
-- ---------------------------------------------------------------------
drop policy if exists "evaluations_admin_all" on public.evaluations;
create policy "evaluations_admin_all" on public.evaluations
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "evaluations_select_own" on public.evaluations;
create policy "evaluations_select_own" on public.evaluations
  for select using (employee_id = public.current_employee_id());

-- ---------------------------------------------------------------------
-- evaluation_history
-- Admin: full read access. Employee: read-only on their own history.
-- This table is written to only via the refresh_employee_evaluation()
-- SECURITY DEFINER function, so no direct insert/update policies are
-- needed for regular users.
-- ---------------------------------------------------------------------
drop policy if exists "evaluation_history_admin_select" on public.evaluation_history;
create policy "evaluation_history_admin_select" on public.evaluation_history
  for select using (public.is_admin());

drop policy if exists "evaluation_history_select_own" on public.evaluation_history;
create policy "evaluation_history_select_own" on public.evaluation_history
  for select using (employee_id = public.current_employee_id());

-- ---------------------------------------------------------------------
-- activity_logs — admin dashboard only
-- ---------------------------------------------------------------------
drop policy if exists "activity_logs_admin_select" on public.activity_logs;
create policy "activity_logs_admin_select" on public.activity_logs
  for select using (public.is_admin());
