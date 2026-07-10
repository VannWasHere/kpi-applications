import postgres from 'postgres'

const SUPABASE_URL = 'https://rodftwezojvtlrzacsqi.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvZGZ0d2V6b2p2dGxyemFjc3FpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzY1NjIzNiwiZXhwIjoyMDk5MjMyMjM2fQ.WwAVt5xkTELE4YGDSDHJe7K7vHk-a-7Y9Qe76ScL7SI'
const PASSWORD = 'Kpi@2026'

const sql = postgres(
  'postgresql://postgres:kpiapps123_@db.rodftwezojvtlrzacsqi.supabase.co:5432/postgres',
  { ssl: 'require' }
)

const headers = {
  'Content-Type': 'application/json',
  'apikey': SERVICE_ROLE_KEY,
  'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
}

// Get all employees without a linked profile (no auth account)
const employees = await sql`
  SELECT id, email, full_name FROM public.employees WHERE profile_id IS NULL
`

console.log(`Found ${employees.length} employee(s) without login accounts.\n`)

for (const emp of employees) {
  // Create auth user
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      email: emp.email,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: emp.full_name, role: 'karyawan' },
    }),
  })
  const result = await res.json()

  if (result.id) {
    // Link profile_id to employee
    await sql`UPDATE public.employees SET profile_id = ${result.id} WHERE id = ${emp.id}`
    console.log(`  ✓ ${emp.email} → ${result.id}`)
  } else {
    console.log(`  ✗ ${emp.email} — ${result.msg || result.message || JSON.stringify(result)}`)
  }
}

console.log(`\nDone! All employees can now login with their email + password: ${PASSWORD}`)
await sql.end()
