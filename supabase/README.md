# Supabase setup

This folder contains the SQL migrations for the KPI Application database.

## Files

- `migrations/0001_init_schema.sql` — tables, constraints, indexes
- `migrations/0002_functions_and_triggers.sql` — automatic KPI/evaluation calculation, `updated_at` maintenance, new-user provisioning, activity logging
- `migrations/0003_row_level_security.sql` — RLS policies (admin vs karyawan)

## Applying the migrations

### Option A — Supabase SQL editor

Open the SQL editor in your Supabase project dashboard and run the three files in order (0001, 0002, 0003).

### Option B — psql / Supabase CLI

```bash
psql "$DATABASE_URL" -f supabase/migrations/0001_init_schema.sql
psql "$DATABASE_URL" -f supabase/migrations/0002_functions_and_triggers.sql
psql "$DATABASE_URL" -f supabase/migrations/0003_row_level_security.sql
```

`DATABASE_URL` should be the Postgres connection string from your Supabase
project settings (Settings → Database → Connection string). Never commit this
value or paste it into chat/source control — keep it only in your local
`.env`, which is already gitignored.

## Creating the first admin user

1. In the Supabase dashboard, go to Authentication → Users → Add user, and
   create a user with an email/password.
2. The `on_auth_user_created` trigger automatically inserts a matching row
   into `public.profiles` with `role = 'karyawan'` by default.
3. Promote that user to admin:

   ```sql
   update public.profiles set role = 'admin' where email = 'admin@yourcompany.com';
   ```

From then on, admins can create employee records and invite additional users
from within the app (Employee Management screen), which provisions a
Supabase Auth user tied to each employee.

## Notes on Row Level Security

- Admins (`profiles.role = 'admin'`) have full access to every table.
- Employees (`role = 'karyawan'`) can only read their own `employees` row,
  KPIs assigned to them, their own `employee_kpis` progress (which they may
  update), and their own `evaluations` / `evaluation_history`.
- All policies rely on `public.is_admin()` and `public.current_employee_id()`,
  both `SECURITY DEFINER` functions so they can be safely used inside RLS
  predicates without recursive policy checks.
