import { createClient } from '@supabase/supabase-js'
import { type Database } from '@/types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        'Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file (see .env.example).'
    )
}

/**
 * Key used to remember the user's "Remember session" preference.
 * When disabled, the auth session is kept in sessionStorage only,
 * so it is cleared once the browser tab is closed.
 */
export const REMEMBER_SESSION_KEY = 'kpi-remember-session'

function isRememberEnabled() {
    return localStorage.getItem(REMEMBER_SESSION_KEY) !== 'false'
}

/**
 * Storage adapter that transparently switches between localStorage
 * (persist across browser restarts) and sessionStorage (cleared when
 * the tab closes) based on the user's "Remember session" choice made
 * at sign-in time.
 */
const dynamicSessionStorage = {
    getItem: (key: string) => {
        const store = isRememberEnabled() ? localStorage : sessionStorage
        return store.getItem(key)
    },
    setItem: (key: string, value: string) => {
        if (isRememberEnabled()) {
            localStorage.setItem(key, value)
            sessionStorage.removeItem(key)
        } else {
            sessionStorage.setItem(key, value)
            localStorage.removeItem(key)
        }
    },
    removeItem: (key: string) => {
        localStorage.removeItem(key)
        sessionStorage.removeItem(key)
    },
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: dynamicSessionStorage,
    },
})
