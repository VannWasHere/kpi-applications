import { readFileSync } from 'fs'
import postgres from 'postgres'

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:kpiapps123_@db.rodftwezojvtlrzacsqi.supabase.co:5432/postgres'

const sql = postgres(DATABASE_URL, { ssl: 'require' })

const migrations = [
  'supabase/migrations/0001_init_schema.sql',
  'supabase/migrations/0002_functions_and_triggers.sql',
  'supabase/migrations/0003_row_level_security.sql',
]

async function run() {
  for (const file of migrations) {
    console.log(`Running ${file}...`)
    const content = readFileSync(file, 'utf-8')
    await sql.unsafe(content)
    console.log(`  ✓ ${file}`)
  }

  // Create admin user via Supabase Auth (we'll do this separately via the app's signUp)
  console.log('\nMigrations complete!')
  console.log('\nNow creating admin test user...')
  
  // Insert a test admin directly into auth.users + profiles
  // Using Supabase's auth.users table format
  const adminEmail = 'admin@kpi.app'
  const adminPassword = 'admin123'
  
  // We can't easily create auth.users directly (needs password hashing via Supabase internals)
  // Instead, let's use the Supabase Auth Admin API
  
  const SUPABASE_URL = 'https://rodftwezojvtlrzacsqi.supabase.co'
  // We need the service_role key for admin user creation
  // Let's check if we can get it from the secret key
  console.log('\n⚠️  To create an admin user, go to:')
  console.log('   Supabase Dashboard → Authentication → Users → Add user')
  console.log(`   Email: ${adminEmail}`)
  console.log(`   Password: ${adminPassword}`)
  console.log('\n   Then run this SQL in the Supabase SQL editor:')
  console.log(`   UPDATE public.profiles SET role = 'admin' WHERE email = '${adminEmail}';`)
  console.log('\n   Or paste your service_role key and I can do it automatically.')

  // Insert some seed departments
  console.log('\nInserting seed departments...')
  await sql`
    INSERT INTO public.departments (name, description) VALUES
      ('Engineering', 'Software development team'),
      ('Human Resources', 'HR and people operations'),
      ('Sales', 'Sales and business development'),
      ('Marketing', 'Marketing and communications'),
      ('Finance', 'Finance and accounting')
    ON CONFLICT (name) DO NOTHING
  `
  console.log('  ✓ Seed departments inserted')

  await sql.end()
}

run().catch((err) => {
  console.error('Migration failed:', err.message)
  process.exit(1)
})
