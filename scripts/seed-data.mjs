import postgres from 'postgres'

const sql = postgres(
  'postgresql://postgres:kpiapps123_@db.rodftwezojvtlrzacsqi.supabase.co:5432/postgres',
  { ssl: 'require' }
)

const positions = [
  'Software Engineer',
  'Senior Engineer',
  'Product Manager',
  'HR Specialist',
  'Sales Executive',
  'Marketing Lead',
  'Accountant',
  'QA Analyst',
]

const firstNames = [
  'Andi', 'Budi', 'Citra', 'Dewi', 'Eko', 'Fitri', 'Gita', 'Hadi',
  'Indah', 'Joko', 'Kartika', 'Lestari', 'Made', 'Nadia', 'Oki', 'Putri',
]
const lastNames = [
  'Santoso', 'Wijaya', 'Pratama', 'Halim', 'Kusuma', 'Saputra', 'Utami', 'Nugroho',
]

const categories = ['Sales', 'Productivity', 'Quality', 'Customer Satisfaction', 'Attendance']

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

const departments = await sql`SELECT id, name FROM public.departments`
if (departments.length === 0) {
  console.error('No departments found. Run run-migrations.mjs first.')
  process.exit(1)
}

// --- Employees ---
console.log('Seeding employees...')
const employeeIds = []
for (let i = 1; i <= 20; i++) {
  const first = pick(firstNames)
  const last = pick(lastNames)
  const code = `EMP-${String(i).padStart(4, '0')}`
  const email = `${first.toLowerCase()}.${last.toLowerCase()}${i}@kpi.app`
  const dept = pick(departments)
  const [row] = await sql`
    INSERT INTO public.employees (employee_code, full_name, email, department_id, position, status)
    VALUES (${code}, ${first + ' ' + last}, ${email}, ${dept.id}, ${pick(positions)}, ${pick(['active', 'active', 'active', 'inactive'])})
    ON CONFLICT (employee_code) DO UPDATE SET full_name = EXCLUDED.full_name
    RETURNING id
  `
  employeeIds.push(row.id)
}
console.log(`  ✓ ${employeeIds.length} employees`)

// --- KPIs ---
console.log('Seeding KPIs...')
const kpiTitles = [
  'Increase quarterly sales',
  'Reduce customer response time',
  'Improve code review turnaround',
  'Achieve 95% attendance',
  'Boost customer satisfaction score',
  'Reduce defect rate',
  'Complete training certification',
  'Grow social media engagement',
]
const kpiIds = []
for (let i = 0; i < kpiTitles.length; i++) {
  const dueMonth = 1 + Math.floor(Math.random() * 12)
  const year = 2026
  const dueDate = `${year}-${String(dueMonth).padStart(2, '0')}-28`
  const [row] = await sql`
    INSERT INTO public.kpis (title, description, category, weight, target, due_date, status)
    VALUES (
      ${kpiTitles[i]},
      ${'Auto-seeded KPI for testing purposes.'},
      ${pick(categories)},
      ${[10, 15, 20, 25][Math.floor(Math.random() * 4)]},
      ${[100, 200, 500, 1000][Math.floor(Math.random() * 4)]},
      ${dueDate},
      ${pick(['draft', 'active', 'active', 'completed'])}
    )
    RETURNING id, target
  `
  kpiIds.push(row)
}
console.log(`  ✓ ${kpiIds.length} KPIs`)

// --- Assignments with progress (triggers auto-calc score + evaluations) ---
console.log('Seeding KPI assignments + progress...')
let assignmentCount = 0
for (const empId of employeeIds) {
  // assign 2-4 random KPIs to each employee
  const shuffled = [...kpiIds].sort(() => Math.random() - 0.5)
  const count = 2 + Math.floor(Math.random() * 3)
  for (const kpi of shuffled.slice(0, count)) {
    const currentValue = Math.round(kpi.target * Math.random() * 100) / 100
    await sql`
      INSERT INTO public.employee_kpis (kpi_id, employee_id, current_value)
      VALUES (${kpi.id}, ${empId}, ${currentValue})
      ON CONFLICT (kpi_id, employee_id) DO UPDATE SET current_value = EXCLUDED.current_value
    `
    assignmentCount++
  }
}
console.log(`  ✓ ${assignmentCount} assignments (evaluations auto-generated via triggers)`)

const [{ count: evalCount }] = await sql`SELECT count(*)::int FROM public.evaluations`
const [{ count: histCount }] = await sql`SELECT count(*)::int FROM public.evaluation_history`
console.log(`  ✓ ${evalCount} evaluations, ${histCount} history records`)

console.log('\nSeed complete!')
await sql.end()
