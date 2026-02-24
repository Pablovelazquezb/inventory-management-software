import { cookies } from 'next/headers'
import { SupabaseClient } from '@supabase/supabase-js'

export const ORG_COOKIE = 'current_org'

/**
 * Returns the current organization ID for a server action or server component.
 * Reads from the `current_org` cookie set when the user logs in or switches org.
 * Throws if no org is active (user should have been redirected to /onboarding).
 */
export async function getCurrentOrgId(): Promise<string> {
    const cookieStore = await cookies()
    const orgId = cookieStore.get(ORG_COOKIE)?.value

    if (!orgId) {
        throw new Error('NO_ORG: User has no active organization. Redirect to /onboarding.')
    }

    return orgId
}

/**
 * Fetches all organizations the current user belongs to.
 */
export async function getUserOrganizations(supabase: SupabaseClient) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: members, error } = await supabase
        .from('organization_members')
        .select(`
            role,
            organizations (
                id,
                name,
                slug,
                logo_url,
                plan
            )
        `)
        .eq('user_id', user.id)

    if (error) {
        console.error('Error fetching user organizations:', error)
        return []
    }

    return (members ?? []).map((m: any) => ({
        ...m.organizations,
        role: m.role,
    }))
}

/**
 * Creates a new organization and makes the current user the owner.
 * Returns the new org id or an error.
 */
export async function createOrganization(
    supabase: SupabaseClient,
    name: string
): Promise<{ id: string } | { error: string }> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        + '-' + Math.random().toString(36).substring(2, 6)

    const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({ name, slug })
        .select()
        .single()

    if (orgError) return { error: orgError.message }

    const { error: memberError } = await supabase
        .from('organization_members')
        .insert({ organization_id: org.id, user_id: user.id, role: 'owner' })

    if (memberError) return { error: memberError.message }

    return { id: org.id }
}
