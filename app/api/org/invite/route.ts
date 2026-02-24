import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

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

    // Look up the target user by email via auth.users (requires service role in production)
    // With anon key we can only check the public profiles if you have one.
    // Workaround: use a "pending invitations" table, or require service-role key.
    // For now we attempt to find user via a public profiles table or fallback gracefully.
    const { data: profiles, error: profileErr } = await supabase
        .from('profiles')        // assumes a public profiles table with email column
        .select('id')
        .eq('email', email)
        .single()

    if (profileErr || !profiles) {
        return NextResponse.json(
            { error: 'No se encontró ningún usuario con ese email. El usuario debe estar registrado primero.' },
            { status: 404 }
        )
    }

    const targetUserId = profiles.id

    // Add to organization_members
    const { error: memberError } = await supabase
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

    return NextResponse.json({ success: true })
}
