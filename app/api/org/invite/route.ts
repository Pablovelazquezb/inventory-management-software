import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function POST(request: NextRequest) {
    const { email, role, orgId } = await request.json()

    if (!email || !orgId) {
        return NextResponse.json({ error: 'email y orgId son requeridos' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verify caller is owner or admin of the target org
    const { data: callerMembership } = await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', orgId)
        .eq('user_id', user.id)
        .single()

    if (!callerMembership || !['owner', 'admin'].includes(callerMembership.role)) {
        return NextResponse.json({ error: 'No tienes permiso para invitar miembros' }, { status: 403 })
    }

    const adminSupabase = createAdminClient()

    // 1. Enforce Plan Limits
    // First, get the organization's plan and current member count
    const { data: orgData, error: orgError } = await adminSupabase
        .from('organizations')
        .select('plan, organization_members(count)')
        .eq('id', orgId)
        .single()

    if (orgError || !orgData) {
        return NextResponse.json({ error: 'No se pudo obtener la información de la empresa.' }, { status: 500 })
    }

    const plan = orgData.plan || 'free'
    const memberCount = orgData.organization_members[0].count

    const limits: Record<string, number> = {
        free: 3,
        pro: 10,
        enterprise: Infinity
    }

    const currentLimit = limits[plan.toLowerCase()] ?? 3

    if (memberCount >= currentLimit) {
        return NextResponse.json({
            error: `Límite de miembros alcanzado para plan ${plan}. Contacta a soporte para mejorar tu plan.`
        }, { status: 403 })
    }

    // 2. Find or Invite User
    // Using Admin Client to bypass RLS when searching for a user by email
    const { data: profiles, error: profileErr } = await adminSupabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single()

    let targetUserId = profiles?.id

    if (profileErr || !profiles) {
        // User not found in profiles, attempt to invite them via Supabase Auth Admin
        const { data: inviteData, error: inviteError } = await adminSupabase.auth.admin.inviteUserByEmail(email, {
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`
        })

        if (inviteError || !inviteData.user) {
            return NextResponse.json(
                { error: `Error al invitar usuario: ${inviteError?.message || 'Desconocido'}` },
                { status: 500 }
            )
        }

        targetUserId = inviteData.user.id
    }

    // 3. Add to organization_members
    const { error: memberError } = await adminSupabase
        .from('organization_members')
        .insert({
            organization_id: orgId,
            user_id: targetUserId,
            role: role ?? 'member',
        })

    if (memberError) {
        if (memberError.code === '23505') {
            return NextResponse.json({ error: 'Este usuario ya es miembro de la empresa' }, { status: 409 })
        }
        return NextResponse.json({ error: memberError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: profileErr ? 'Invitación enviada' : 'Miembro añadido' })
}
