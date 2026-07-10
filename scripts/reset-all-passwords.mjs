const SUPABASE_URL = 'https://rodftwezojvtlrzacsqi.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvZGZ0d2V6b2p2dGxyemFjc3FpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzY1NjIzNiwiZXhwIjoyMDk5MjMyMjM2fQ.WwAVt5xkTELE4YGDSDHJe7K7vHk-a-7Y9Qe76ScL7SI'
const NEW_PASSWORD = 'Kpi@2026'

const headers = {
  'Content-Type': 'application/json',
  'apikey': SERVICE_ROLE_KEY,
  'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
}

// List all users
const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?per_page=1000`, { headers })
const { users } = await res.json()

console.log(`Found ${users.length} user(s). Resetting all passwords to "${NEW_PASSWORD}"...\n`)

for (const user of users) {
  const updateRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${user.id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ password: NEW_PASSWORD }),
  })
  const result = await updateRes.json()
  if (result.id) {
    console.log(`  ✓ ${user.email}`)
  } else {
    console.log(`  ✗ ${user.email} — ${JSON.stringify(result)}`)
  }
}

console.log('\nDone! All users can now login with their email + password: Kpi@2026')
