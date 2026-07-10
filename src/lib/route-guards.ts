import { redirect } from '@tanstack/react-router'
import { getCurrentUserRole, useAuthStore } from '@/stores/auth-store'
import type { AppRole } from '@/types/database'

/**
 * Throws a redirect to /sign-in (preserving the attempted URL) when
 * there is no active Supabase session. Intended for use in a route's
 * `beforeLoad`.
 */
export function requireAuth(href: string) {
    const { session } = useAuthStore.getState().auth
    if (!session) {
        throw redirect({ to: '/sign-in', search: { redirect: href } })
    }
}

/**
 * Throws a redirect to /403 when the signed-in user's role is not in
 * `allowedRoles`. Must be called after `requireAuth`.
 */
export function requireRole(allowedRoles: AppRole[]) {
    const role = getCurrentUserRole()
    if (!role || !allowedRoles.includes(role)) {
        throw redirect({ to: '/403' })
    }
}
