# KPI Application

Employee Performance Evaluation System. Admins define KPIs, assign them to
employees, and track automatically calculated scores and ratings. Employees
log in to update their own KPI progress and review their evaluation history.

Built on top of the [shadcn-admin](https://github.com/satnaing/shadcn-admin)
dashboard template (React + Vite + TanStack Router + shadcn/ui), with
Supabase for authentication and data.

## Tech stack

- **UI:** [shadcn/ui](https://ui.shadcn.com) (Tailwind CSS + Radix UI)
- **Build tool:** [Vite](https://vitejs.dev/)
- **Routing:** [TanStack Router](https://tanstack.com/router/latest)
- **Data:** [Supabase](https://supabase.com) (Postgres, Auth, Row Level Security)
- **Server state:** [TanStack Query](https://tanstack.com/query/latest)
- **Type checking:** TypeScript
- **Linting/formatting:** ESLint & Prettier
- **Testing:** Vitest + Playwright (browser mode)

## Features

- Supabase Authentication with persistent/"remember me" sessions
- Role-based access (Admin / Karyawan) enforced by route guards and RLS
- Employee management (CRUD, search, sort, pagination)
- KPI / OKR management (create, edit, delete, assign to employees)
- KPI progress input for employees, with automatic score calculation
- Automatic weighted score, overall performance score, and rating
- Admin dashboard (totals, KPI progress, department/employee performance, activity feed)
- Employee dashboard (assigned/completed KPIs, current score, progress history, upcoming KPIs)
- Evaluation history with admin (all employees) and employee (own) views, filterable by employee/year/month
- Light/dark mode, responsive layout, RTL support

## Getting started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in your Supabase project's URL and
anon key (Project Settings → API in the Supabase dashboard):

```bash
cp .env.example .env
```

```dotenv
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
DATABASE_URL=postgresql://postgres:<password>@db.your-project.supabase.co:5432/postgres
```

`DATABASE_URL` is only needed locally if you plan to run the SQL migrations
via `psql` (see below); it is never read by the frontend build. `.env` is
gitignored — never commit real credentials.

### 3. Set up the database

Run the SQL migrations in `supabase/migrations/` in order (0001, 0002, 0003)
using the Supabase SQL editor or `psql`. See `supabase/README.md` for full
instructions, including how to create and promote the first admin user.

### 4. (Optional) Deploy the employee-invite Edge Function

Creating an employee with "create a login" enabled calls the
`create-employee-account` Supabase Edge Function (see `supabase/functions/`),
which needs the service role key and therefore must run server-side. Deploy
it with the Supabase CLI:

```bash
supabase functions deploy create-employee-account
```

If you skip this, you can still create employee records — just uncheck
"Create a login" and provision their Supabase Auth user manually.

### 5. Run the app

```bash
pnpm dev
```

## Scripts

```bash
pnpm dev             # start the dev server
pnpm build           # type-check and build for production
pnpm lint            # run ESLint
pnpm format          # run Prettier
pnpm test            # run the test suite (headless)
```

## Deployment

The app is a static Vite build (`pnpm build` outputs to `dist/`) and can be
deployed to any static host (Netlify config is included via `netlify.toml`).
Set the same `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` environment
variables in your hosting provider's dashboard before deploying.

## License

Licensed under the [MIT License](https://choosealicense.com/licenses/mit/).
