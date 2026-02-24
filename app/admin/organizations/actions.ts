'use server'

import { createAdminClient } from '@/utils/supabase/admin'
import { requireSuperAdmin } from '@/utils/supabase/superadmin'
import { revalidatePath } from 'next/cache'

// ──────────────────────────────────
// CREATE ORGANIZATION (admin only)
// ──────────────────────────────────
export async function createOrgAction(prevState: any, formData: FormData) {
    await requireSuperAdmin()
    const admin = createAdminClient()

    const name = (formData.get('name') as string)?.trim()
    const ownerUserId = (formData.get('owner_user_id') as string)?.trim()

    if (!name) return { error: 'El nombre de la empresa es requerido' }

    // Generate slug from name
    const slug = name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .slice(0, 50) + '-' + Date.now().toString(36)

    // Create org
    const { data: org, error: orgError } = await admin
        .from('organizations')
        .insert({ name, slug })
        .select()
        .single()

    if (orgError) return { error: orgError.message }

    // Assign owner if provided
    if (ownerUserId) {
        const { error: memberError } = await admin
            .from('organization_members')
            .insert({ organization_id: org.id, user_id: ownerUserId, role: 'owner' })

        if (memberError) return { error: `Empresa creada pero error al asignar owner: ${memberError.message}` }
    }

    revalidatePath('/admin/organizations')
    return { success: true, orgId: org.id, orgName: org.name }
}

// ──────────────────────────────────
// RENAME ORGANIZATION (admin only)
// ──────────────────────────────────
export async function renameOrgAction(prevState: any, formData: FormData) {
    await requireSuperAdmin()
    const admin = createAdminClient()

    const orgId = formData.get('org_id') as string
    const name = (formData.get('name') as string)?.trim()

    if (!orgId || !name) return { error: 'ID y nombre son requeridos' }

    const { error } = await admin
        .from('organizations')
        .update({ name })
        .eq('id', orgId)

    if (error) return { error: error.message }

    revalidatePath('/admin/organizations')
    return { success: true }
}

// ──────────────────────────────────
// DELETE ORGANIZATION (admin only)
// ──────────────────────────────────
export async function deleteOrgAction(orgId: string) {
    await requireSuperAdmin()
    const admin = createAdminClient()

    const { error } = await admin
        .from('organizations')
        .delete()
        .eq('id', orgId)

    if (error) return { error: error.message }

    revalidatePath('/admin/organizations')
    return { success: true }
}

// ──────────────────────────────────
// ASSIGN OWNER TO ORG (admin only)
// ──────────────────────────────────
export async function assignOwnerAction(orgId: string, userId: string) {
    await requireSuperAdmin()
    const admin = createAdminClient()

    const { error } = await admin
        .from('organization_members')
        .upsert(
            { organization_id: orgId, user_id: userId, role: 'owner' },
            { onConflict: 'organization_id,user_id' }
        )

    if (error) return { error: error.message }

    revalidatePath('/admin/organizations')
    return { success: true }
}
