import postgres from 'postgres'

const sql = postgres('postgresql://postgres:kpiapps123_@db.rodftwezojvtlrzacsqi.supabase.co:5432/postgres', { ssl: 'require' })

const rows = await sql`SELECT id, email, role, full_name FROM public.profiles WHERE email = 'admin@kpi.app'`
console.log('Profile:', rows[0] ?? 'NOT FOUND')

if (rows[0] && rows[0].role !== 'admin') {
  await sql`UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@kpi.app'`
  console.log('Promoted to admin!')
} else if (rows[0]) {
  console.log('Already admin.')
}

await sql.end()
