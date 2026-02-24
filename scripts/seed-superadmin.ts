/**
 * Seed Script: Creates the initial super admin user
 * Run with: npx tsx scripts/seed-superadmin.ts
 * (requires SUPABASE_SERVICE_ROLE_KEY in .env.local)
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Load .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const SUPER_ADMIN_EMAIL = 'pablo@corlynxai.com'
const SUPER_ADMIN_PASSWORD = '123456'

async function main() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey || serviceRoleKey === 'YOUR_SERVICE_ROLE_KEY_HERE') {
        console.error('❌  Missing or placeholder SUPABASE_SERVICE_ROLE_KEY in .env.local')
        console.error('   Get it from: Supabase Dashboard → Project Settings → API → service_role')
        process.exit(1)
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
    })

    console.log(`\n🔍  Checking if user ${SUPER_ADMIN_EMAIL} already exists...`)

    // Check if user already exists
    const { data: { users }, error: listError } = await admin.auth.admin.listUsers()
    if (listError) {
        console.error('❌  Failed to list users:', listError.message)
        process.exit(1)
    }

    let userId: string

    const existing = users.find(u => u.email === SUPER_ADMIN_EMAIL)

    if (existing) {
        userId = existing.id
        console.log(`✅  User already exists → id: ${userId}`)

        // Update password in case it changed
        await admin.auth.admin.updateUserById(userId, { password: SUPER_ADMIN_PASSWORD })
        console.log(`🔑  Password updated.`)
    } else {
        console.log(`➕  Creating user ${SUPER_ADMIN_EMAIL}...`)
        const { data: newUser, error: createError } = await admin.auth.admin.createUser({
            email: SUPER_ADMIN_EMAIL,
            password: SUPER_ADMIN_PASSWORD,
            email_confirm: true,
            user_metadata: { full_name: 'Pablo (Super Admin)' },
        })

        if (createError) {
            console.error('❌  Failed to create user:', createError.message)
            process.exit(1)
        }

        userId = newUser.user.id
        console.log(`✅  User created → id: ${userId}`)
    }

    // Upsert into profiles
    const { error: profileError } = await admin.from('profiles').upsert({
        id: userId,
        email: SUPER_ADMIN_EMAIL,
        full_name: 'Pablo (Super Admin)',
    })

    if (profileError) {
        console.warn('⚠️   Profile upsert warning (non-fatal):', profileError.message)
    } else {
        console.log(`✅  Profile upserted.`)
    }

    // Add to super_admins
    const { error: superAdminError } = await admin
        .from('super_admins')
        .upsert({ user_id: userId }, { onConflict: 'user_id' })

    if (superAdminError) {
        console.error('❌  Failed to insert super admin:', superAdminError.message)
        process.exit(1)
    }

    console.log(`\n🎉  Done! ${SUPER_ADMIN_EMAIL} is now a Super Admin.`)
    console.log(`   Login at your app with:`)
    console.log(`   Email:    ${SUPER_ADMIN_EMAIL}`)
    console.log(`   Password: ${SUPER_ADMIN_PASSWORD}`)
    console.log(`   Then go to /admin\n`)
}

main().catch(err => {
    console.error('Unexpected error:', err)
    process.exit(1)
})
