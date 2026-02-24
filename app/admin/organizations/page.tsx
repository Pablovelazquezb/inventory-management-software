import { createAdminClient } from '@/utils/supabase/admin'
import { requireSuperAdmin } from '@/utils/supabase/superadmin'
import AdminOrgsClient from './AdminOrgsClient'

export default async function AdminOrganizationsPage() {
    await requireSuperAdmin()
    const admin = createAdminClient()

    const [{ data: orgs }, { data: profiles }] = await Promise.all([
        admin
            .from('organizations')
            .select(`
                id, name, slug, plan, created_at,
                organization_members ( id, user_id, role )
            `)
            .order('created_at', { ascending: false }),
        admin
            .from('profiles')
            .select('id, email, full_name')
            .order('email'),
    ])

    return <AdminOrgsClient orgs={orgs ?? []} profiles={profiles ?? []} />
}
