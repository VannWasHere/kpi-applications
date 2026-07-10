/**
 * Translates raw Supabase/Postgres errors into friendly, user-facing
 * messages. Also reports whether the error is a "duplicate / already
 * exists" case (unique-constraint violation, Postgres code 23505), so
 * callers can decide to close a dialog even though the write failed.
 */
export type FriendlyError = {
    message: string
    isDuplicate: boolean
}

export function parseSupabaseError(error: unknown): FriendlyError {
    const raw =
        error && typeof error === 'object'
            ? ((error as { message?: string; code?: string; details?: string })
                .message ?? '')
            : ''
    const code =
        error && typeof error === 'object'
            ? ((error as { code?: string }).code ?? '')
            : ''

    const text = `${code} ${raw}`.toLowerCase()

    // Postgres unique_violation
    if (code === '23505' || text.includes('duplicate key') || text.includes('already exists')) {
        // Try to name the conflicting field for a clearer message.
        if (text.includes('email')) {
            return { message: 'That email is already in use.', isDuplicate: true }
        }
        if (text.includes('employee_code')) {
            return { message: 'That Employee ID is already in use.', isDuplicate: true }
        }
        return { message: 'This record already exists.', isDuplicate: true }
    }

    return {
        message: raw || 'Something went wrong. Please try again.',
        isDuplicate: false,
    }
}
