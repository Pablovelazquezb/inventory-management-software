import { createClient } from '@/utils/supabase/server'
import { getUserOrganizations } from '@/utils/supabase/organization'
import { redirect } from 'next/navigation'
import OrgSettingsClient from './OrgSettingsClient'

export default async function OrgSettingsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/auth/login')

    const orgs = await getUserOrganizations(supabase)

    return <OrgSettingsClient user={user} orgs={orgs} />
}
