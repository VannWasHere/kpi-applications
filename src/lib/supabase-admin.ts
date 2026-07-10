import { createClient } from '@supabase/supabase-js'
import { type Database } from '@/types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY

/**
 * Admin client using the service_role key. Only used for user management
 * operations (creating auth accounts for employees). Never expose this
 * client to non-admin code paths.
 */
export const supabaseAdmin = serviceRoleKey
    ? createClient<Database>(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false },
    })
    : null
