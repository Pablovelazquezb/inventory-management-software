'use server'

import { createClient } from '@/utils/supabase/server'
import { createOrganization } from '@/utils/supabase/organization'
import { ORG_COOKIE } from '@/utils/supabase/organization'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function createOrganizationAction(prevState: any, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Debes iniciar sesión' }

    const name = (formData.get('name') as string)?.trim()
    if (!name || name.length < 2) {
        return { error: 'El nombre de la empresa debe tener al menos 2 caracteres' }
    }

    const result = await createOrganization(supabase, name)

    if ('error' in result) {
        return { error: result.error }
    }

    // Set the new org as current
    const cookieStore = await cookies()
    cookieStore.set(ORG_COOKIE, result.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
    })

    redirect('/dashboard')
}
