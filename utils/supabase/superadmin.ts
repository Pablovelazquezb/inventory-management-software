import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

/**
 * Checks if the current user is a super admin.
 * Returns the user if they are, redirects to /dashboard if not.
 */
export async function requireSuperAdmin() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/auth/login')

    // Check super_admins table via the is_super_admin() function
    const { data } = await supabase.rpc('is_super_admin')

    if (!data) {
        redirect('/dashboard')
    }

    return user
}
