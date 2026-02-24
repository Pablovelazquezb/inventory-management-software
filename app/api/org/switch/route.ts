import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { ORG_COOKIE } from '@/utils/supabase/organization'

export async function POST(request: NextRequest) {
    const { orgId } = await request.json()

    if (!orgId) {
        return NextResponse.json({ error: 'orgId is required' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is actually a member of this org
    const { data: member } = await supabase
        .from('organization_members')
        .select('id')
        .eq('organization_id', orgId)
        .eq('user_id', user.id)
        .single()

    if (!member) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const response = NextResponse.json({ success: true })
    response.cookies.set(ORG_COOKIE, orgId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
    })

    return response
}
