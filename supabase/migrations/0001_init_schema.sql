-- =====================================================================
-- KPI Application — Initial Schema
-- Employee Performance Evaluation System
-- =====================================================================
-- Run this migration against your Supabase Postgres database, e.g.:
--   supabase db execute -f supabase/migrations/0001_init_schema.sql
-- or paste it into the Supabase SQL editor.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- profiles
-- One row per Supabase auth user. Created automatically by a trigger
-- on auth.users (see handle_new_auth_user below).
--
-- NOTE on "roles" table: the spec suggested a dedicated `roles` table,
-- but since this application only ever has two fixed roles (admin,
-- karyawan), we use a checked enum column instead of a separate table.
-- This keeps joins simpler while still enforcing valid values.
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text not null default '',
  role text not null default 'karyawan' check (role in ('admin', 'karyawan')),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'One row per authenticated user; holds role used for authorization.';

-- ---------------------------------------------------------------------
-- departments
-- ---------------------------------------------------------------------
create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- employees
-- Business record for an employee. Linked to a profile once the
-- employee has an active login (profile_id is nullable so an employee
-- record can exist before the account is provisioned).
-- ---------------------------------------------------------------------
create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique references public.profiles (id) on delete set null,
  employee_code text not null unique,
  full_name text not null,
  email text not null unique,
  department_id uuid references public.departments (id) on delete set null,
  "position" text not null,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists employees_department_id_idx on public.employees (department_id);
create index if not exists employees_profile_id_idx on public.employees (profile_id);
create index if not exists employees_status_idx on public.employees (status);

comment on table public.employees is 'Employee master data. "Role" for display/CRUD is sourced from the linked profile.';

-- ---------------------------------------------------------------------
-- kpis
-- KPI / OKR definitions created by admins.
-- ---------------------------------------------------------------------
create table if not exists public.kpis (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text not null,
  weight numeric(5, 2) not null check (weight > 0 and weight <= 100),
  target numeric(12, 2) not null check (target > 0),
  due_date date not null,
  status text not null default 'draft' check (status in ('draft', 'active', 'completed')),
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists kpis_status_idx on public.kpis (status);
create index if not exists kpis_due_date_idx on public.kpis (due_date);

-- ---------------------------------------------------------------------
-- employee_kpis
-- Assignment of a KPI to an employee, plus the employee's progress
-- input. progress_percent and weighted_score are recalculated
-- automatically (see calculate_employee_kpi_progress trigger).
-- ---------------------------------------------------------------------
create table if not exists public.employee_kpis (
  id uuid primary key default gen_random_uuid(),
  kpi_id uuid not null references public.kpis (id) on delete cascade,
  employee_id uuid not null references public.employees (id) on delete cascade,
  current_value numeric(12, 2) not null default 0 check (current_value >= 0),
  progress_percent numeric(5, 2) not null default 0,
  weighted_score numeric(6, 2) not null default 0,
  notes text,
  status text not null default 'not_started' check (status in ('not_started', 'in_progress', 'completed')),
  assigned_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (kpi_id, employee_id)
);

create index if not exists employee_kpis_employee_id_idx on public.employee_kpis (employee_id);
create index if not exists employee_kpis_kpi_id_idx on public.employee_kpis (kpi_id);

-- ---------------------------------------------------------------------
-- evaluations
-- One aggregated row per employee per period ('YYYY-MM'), recalculated
-- automatically whenever the employee's KPI progress changes.
-- ---------------------------------------------------------------------
create table if not exists public.evaluations (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees (id) on delete cascade,
  period text not null,
  kpi_score numeric(6, 2) not null default 0,
  rating text not null default 'Poor' check (
    rating in ('Excellent', 'Good', 'Average', 'Needs Improvement', 'Poor')
  ),
  comments text,
  status text not null default 'draft' check (status in ('draft', 'submitted', 'finalized')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (employee_id, period)
);

create index if not exists evaluations_employee_id_idx on public.evaluations (employee_id);
create index if not exists evaluations_period_idx on public.evaluations (period);

-- ---------------------------------------------------------------------
-- evaluation_history
-- Immutable snapshot log, one row per recalculation. Powers the
-- "Evaluation History" screen (admin sees all, employee sees own).
-- ---------------------------------------------------------------------
create table if not exists public.evaluation_history (
  id uuid primary key default gen_random_uuid(),
  evaluation_id uuid references public.evaluations (id) on delete cascade,
  employee_id uuid not null references public.employees (id) on delete cascade,
  period text not null,
  kpi_score numeric(6, 2) not null,
  rating text not null,
  comments text,
  status text not null,
  recorded_at timestamptz not null default now()
);

create index if not exists evaluation_history_employee_id_idx on public.evaluation_history (employee_id);
create index if not exists evaluation_history_period_idx on public.evaluation_history (period);

-- ---------------------------------------------------------------------
-- activity_logs
-- Feeds the "Recent Activities" table on the admin dashboard.
-- ---------------------------------------------------------------------
create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  description text not null,
  created_at timestamptz not null default now()
);

create index if not exists activity_logs_created_at_idx on public.activity_logs (created_at desc);
