import { createAdminClient } from '@/utils/supabase/admin'
import { requireSuperAdmin } from '@/utils/supabase/superadmin'
import AdminUsersClient from './AdminUsersClient'

export default async function AdminUsersPage() {
    await requireSuperAdmin()
    const admin = createAdminClient()

    const [
        { data: profiles },
        { data: orgs },
        { data: members },
    ] = await Promise.all([
        admin.from('profiles').select('id, email, full_name, created_at').order('created_at', { ascending: false }),
        admin.from('organizations').select('id, name, slug'),
        admin.from('organization_members').select('id, user_id, organization_id, role'),
    ])

    // Build enriched user list
    const users = (profiles ?? []).map(p => ({
        ...p,
        memberships: (members ?? [])
            .filter(m => m.user_id === p.id)
            .map(m => ({
                ...m,
                orgName: (orgs ?? []).find(o => o.id === m.organization_id)?.name ?? '—',
            })),
    }))

    return <AdminUsersClient users={users} orgs={orgs ?? []} />
}
