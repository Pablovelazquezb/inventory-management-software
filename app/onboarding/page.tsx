import { createClient } from '@/utils/supabase/server'
import { getUserOrganizations } from '@/utils/supabase/organization'
import { redirect } from 'next/navigation'
import { createOrganizationAction } from './actions'
import OnboardingForm from './OnboardingForm'

export default async function OnboardingPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/auth/login')

    // If user already has an org, send them to dashboard
    const orgs = await getUserOrganizations(supabase)
    if (orgs.length > 0) {
        redirect('/dashboard')
    }

    return <OnboardingForm />
}
