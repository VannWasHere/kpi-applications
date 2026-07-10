// Supabase Edge Function: create-employee-account
//
// Creates a Supabase Auth user for a new employee and links it to the
// employees.profile_id column. Runs with the service role key, which is
// only ever available inside the Supabase Edge Functions runtime
// (configured via `supabase secrets set`), never shipped to the browser.
//
// Deploy with:
//   supabase functions deploy create-employee-account
//
// Invoke from the client with:
//   supabase.functions.invoke('create-employee-account', { body: { employeeId, email, fullName, role } })
//
// Only callers with a valid admin session may use this function; it
// re-checks the caller's role server-side before doing anything.

import { createClient } from 'jsr:@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

Deno.serve(async (req) => {
    if (req.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 })
    }

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
        return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

    // Verify the caller is authenticated and is an admin before proceeding.
    const callerClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
        global: { headers: { Authorization: authHeader } },
    })
    const {
        data: { user: callerUser },
        error: callerError,
    } = await callerClient.auth.getUser()

    if (callerError || !callerUser) {
        return new Response(JSON.stringify({ error: 'Not authenticated' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    const { data: callerProfile } = await adminClient
        .from('profiles')
        .select('role')
        .eq('id', callerUser.id)
        .single()

    if (callerProfile?.role !== 'admin') {
        return new Response(JSON.stringify({ error: 'Forbidden: admin role required' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    const body = await req.json().catch(() => null)
    const employeeId = body?.employeeId as string | undefined
    const email = body?.email as string | undefined
    const fullName = (body?.fullName as string | undefined) ?? ''
    const role = (body?.role as string | undefined) ?? 'karyawan'

    if (!employeeId || !email) {
        return new Response(
            JSON.stringify({ error: 'employeeId and email are required' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
    }

    if (role !== 'admin' && role !== 'karyawan') {
        return new Response(JSON.stringify({ error: 'Invalid role' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    // Create the auth user with a random temporary password and send an
    // invite/reset email so the employee can set their own password.
    const tempPassword = crypto.randomUUID()

    const { data: created, error: createError } =
        await adminClient.auth.admin.createUser({
            email,
            password: tempPassword,
            email_confirm: true,
            user_metadata: { full_name: fullName, role },
        })

    if (createError || !created.user) {
        return new Response(
            JSON.stringify({ error: createError?.message ?? 'Failed to create user' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
    }

    // The on_auth_user_created trigger inserts into public.profiles
    // automatically; here we just link the employee record and send the
    // password-setup email.
    const { error: linkError } = await adminClient
        .from('employees')
        .update({ profile_id: created.user.id })
        .eq('id', employeeId)

    if (linkError) {
        return new Response(JSON.stringify({ error: linkError.message }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    await adminClient.auth.resetPasswordForEmail(email)

    return new Response(JSON.stringify({ userId: created.user.id }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    })
})
