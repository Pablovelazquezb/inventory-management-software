
import Sidebar from '@/components/Sidebar'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

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

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)' }}>
            <Sidebar />
            <main style={{ flex: 1, padding: '2rem' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    {children}
                </div>
            </main>
        </div>
    )
}
