
import Sidebar from '@/components/Sidebar'
import { createClient } from '@/utils/supabase/server'
import { getUserOrganizations, ORG_COOKIE } from '@/utils/supabase/organization'
import { OrganizationProvider } from '@/context/OrganizationContext'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth/login')
    }

    // Check super admin status
    const { data: isSuperAdmin } = await supabase.rpc('is_super_admin')

    // Fetch user's organizations
    const orgs = await getUserOrganizations(supabase)

    // No orgs → show pending screen (super admins skip this)
    if (orgs.length === 0 && !isSuperAdmin) {
        redirect('/pending')
    }

    // Determine current org from cookie (or default to first)
    const cookieStore = await cookies()
    const cookieOrgId = cookieStore.get(ORG_COOKIE)?.value
    const currentOrgId = orgs.find(o => o.id === cookieOrgId)?.id ?? orgs[0]?.id ?? null

    return (
        <OrganizationProvider initialOrgs={orgs} initialOrgId={currentOrgId}>
            <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)' }}>
                <Sidebar user={user} isSuperAdmin={!!isSuperAdmin} />
                <main style={{ flex: 1, padding: '2rem' }}>
                    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        {children}
                    </div>
                </main>
            </div>
        </OrganizationProvider>
    )
}
