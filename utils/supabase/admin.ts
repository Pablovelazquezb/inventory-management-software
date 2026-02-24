import { createClient as createServerClient } from '@supabase/supabase-js'

/**
 * Creates a Supabase client with the SERVICE ROLE key.
 * This bypasses Row Level Security (RLS) entirely.
 * ⚠️ ONLY use this in server actions / API routes — NEVER in client code.
 */
export function createAdminClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
        throw new Error(
            'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables'
        )
    }

    return createServerClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    })
}
