'use server'

import { createAdminClient } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'
import { requireSuperAdmin } from '@/utils/supabase/superadmin'
import { revalidatePath } from 'next/cache'

// ──────────────────────────────────────────────
// CREATE USER
// ──────────────────────────────────────────────
export async function createUserAction(prevState: any, formData: FormData) {
    await requireSuperAdmin()
    const admin = createAdminClient()

    const email = (formData.get('email') as string)?.trim()
    const password = (formData.get('password') as string)?.trim()
    const fullName = (formData.get('full_name') as string)?.trim()
    const orgId = (formData.get('org_id') as string)?.trim()
    const role = (formData.get('role') as string) ?? 'member'

    if (!email || !password) return { error: 'Email y contraseña son requeridos' }
    if (password.length < 6) return { error: 'La contraseña debe tener al menos 6 caracteres' }

    // 1. Create the auth user
    const { data: authUser, error: authError } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName },
    })

    if (authError) return { error: authError.message }

    // 2. Upsert into profiles 
    await admin.from('profiles').upsert({
        id: authUser.user.id,
        email,
        full_name: fullName,
    })

    // 3. Assign to org if provided
    if (orgId) {
        await admin.from('organization_members').insert({
            organization_id: orgId,
            user_id: authUser.user.id,
            role,
        })
    }

    revalidatePath('/admin/users')
    return { success: true, userId: authUser.user.id }
}

// ──────────────────────────────────────────────
// UPDATE USER
// ──────────────────────────────────────────────
export async function updateUserAction(prevState: any, formData: FormData) {
    await requireSuperAdmin()
    const admin = createAdminClient()

    const userId = formData.get('user_id') as string
    const email = (formData.get('email') as string)?.trim()
    const password = (formData.get('password') as string)?.trim()
    const fullName = (formData.get('full_name') as string)?.trim()

    if (!userId) return { error: 'user_id es requerido' }

    // Build auth update payload
    const authUpdate: any = {}
    if (email) authUpdate.email = email
    if (password && password.length >= 6) authUpdate.password = password
    if (fullName !== undefined) authUpdate.user_metadata = { full_name: fullName }

    if (Object.keys(authUpdate).length > 0) {
        const { error } = await admin.auth.admin.updateUserById(userId, authUpdate)
        if (error) return { error: error.message }
    }

    // Update profile
    await admin.from('profiles').update({
        ...(email && { email }),
        ...(fullName !== undefined && { full_name: fullName }),
    }).eq('id', userId)

    revalidatePath('/admin/users')
    return { success: true }
}

// ──────────────────────────────────────────────
// DELETE USER
// ──────────────────────────────────────────────
export async function deleteUserAction(userId: string) {
    await requireSuperAdmin()
    const admin = createAdminClient()

    if (!userId) return { error: 'user_id es requerido' }

    const { error } = await admin.auth.admin.deleteUser(userId)

    if (error) return { error: error.message }

    revalidatePath('/admin/users')
    return { success: true }
}

// ──────────────────────────────────────────────
// UPDATE ORG MEMBERSHIP ROLE
// ──────────────────────────────────────────────
export async function updateMemberRoleAction(memberId: string, role: string) {
    await requireSuperAdmin()
    const admin = createAdminClient()

    const { error } = await admin
        .from('organization_members')
        .update({ role })
        .eq('id', memberId)

    if (error) return { error: error.message }
    revalidatePath('/admin/users')
    return { success: true }
}

// ──────────────────────────────────────────────
// REMOVE FROM ORG
// ──────────────────────────────────────────────
export async function removeMemberAction(memberId: string) {
    await requireSuperAdmin()
    const admin = createAdminClient()

    const { error } = await admin
        .from('organization_members')
        .delete()
        .eq('id', memberId)

    if (error) return { error: error.message }
    revalidatePath('/admin/users')
    return { success: true }
}

// ──────────────────────────────────────────────
// ADD USER TO ORG
// ──────────────────────────────────────────────
export async function addMemberAction(userId: string, orgId: string, role: string) {
    await requireSuperAdmin()
    const admin = createAdminClient()

    const { data, error } = await admin
        .from('organization_members')
        .insert({ organization_id: orgId, user_id: userId, role })
        .select('id')
        .single()

    if (error) return { error: error.message }
    revalidatePath('/admin/users')
    return { success: true, memberId: data.id as string }
}
