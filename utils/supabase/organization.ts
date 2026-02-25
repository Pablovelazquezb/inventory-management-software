import { cookies } from 'next/headers'
import { SupabaseClient } from '@supabase/supabase-js'

export const ORG_COOKIE = 'current_org'

/**
 * Returns the current organization ID for a server action or server component.
 * First reads from the `current_org` cookie; if no cookie is set, falls back to
 * querying the first organization the user belongs to (handles super admin case
 * where the org-selection flow may have been skipped).
 * Throws if the user truly has no organization.
 */
export async function getCurrentOrgId(): Promise<string> {
    const cookieStore = await cookies()
    const orgId = cookieStore.get(ORG_COOKIE)?.value
    if (orgId) return orgId

    // Fallback: query the DB for the user's first organization
    const { createClient } = await import('@/utils/supabase/server')
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('NO_ORG: Not authenticated')

    const { data: member } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle()

    if (!member) throw new Error('No active organization')
    return member.organization_id
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
