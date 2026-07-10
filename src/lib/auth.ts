import { REMEMBER_SESSION_KEY, supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import type { AuthProfile } from '@/stores/auth-store'

/** Default password assigned to new employee accounts. */
export const DEFAULT_PASSWORD = 'Kpi@2026'

/**
 * Fetches the profile row for a given Supabase Auth user id.
 */
export async function fetchProfile(userId: string): Promise<AuthProfile | null> {
    const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, avatar_url')
        .eq('id', userId)
        .single()

    if (error || !data) return null

    return {
        id: data.id,
        email: data.email,
        fullName: data.full_name,
        role: data.role,
        avatarUrl: data.avatar_url,
    }
}

/**
 * Signs a user in with email/password.
 */
export async function signInWithPassword(
    email: string,
    password: string,
    remember: boolean
) {
    localStorage.setItem(REMEMBER_SESSION_KEY, remember ? 'true' : 'false')
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })
    if (error) throw error
    return data
}

/**
 * Changes the current user's own password (requires being signed in).
 */
export async function changeOwnPassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw error
}

/**
 * Admin resets another user's password by their user ID (uses service_role).
 */
export async function adminResetPassword(userId: string, newPassword: string) {
    if (!supabaseAdmin) throw new Error('Service role key not configured.')
    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: newPassword,
    })
    if (error) throw error
}

/**
 * Admin creates an auth account for an employee with a default password.
 * Returns the new user ID.
 */
export async function adminCreateAuthUser(
    email: string,
    fullName: string,
    role: 'admin' | 'karyawan'
): Promise<string> {
    if (!supabaseAdmin) throw new Error('Service role key not configured.')
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: DEFAULT_PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: fullName, role },
    })
    if (error) throw error
    return data.user.id
}

export async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
}
