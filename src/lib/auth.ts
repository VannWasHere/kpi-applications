import { REMEMBER_SESSION_KEY, supabase } from '@/lib/supabase'
import type { AuthProfile } from '@/stores/auth-store'

/**
 * Fetches the profile row (id/email/full_name/role/avatar_url) for a
 * given Supabase Auth user id. Returns null if not found or on error.
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
 * Signs a user in with email/password. When `remember` is false, the
 * session is stored in sessionStorage only (cleared when the tab closes).
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

export async function sendPasswordResetEmail(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/sign-in`,
    })
    if (error) throw error
}

export async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
}
