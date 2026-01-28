
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth/login')
    }

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)' }}>
            {/* Sidebar */}
            <aside style={{
                width: '260px',
                background: 'var(--surface)',
                borderRight: '1px solid var(--border)',
                padding: '2rem 1.5rem',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div style={{ marginBottom: '3rem' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.025em' }}>
                        Inventory<span style={{ color: 'var(--primary)' }}>.</span>
                    </h1>
                </div>

                <nav style={{ flex: 1 }}>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <li>
                            <Link href="/inventory" style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '0.75rem 1rem',
                                borderRadius: '8px',
                                color: 'var(--foreground)',
                                fontWeight: 500,
                                transition: 'all 0.2s',
                                background: 'rgba(255,255,255,0.03)'
                            }}>
                                Dashboard
                            </Link>
                        </li>
                        <li>
                            <Link href="/inventory/add" style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '0.75rem 1rem',
                                borderRadius: '8px',
                                color: 'rgba(255,255,255,0.6)',
                                fontWeight: 500,
                                transition: 'all 0.2s'
                            }} className="nav-item">
                                Add Item
                            </Link>
                        </li>
                    </ul>
                </nav>

                <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                    <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', marginBottom: '1rem' }}>
                        {user.email}
                    </p>
                    <form action="/auth/signout" method="post">
                        <button className="btn" style={{
                            width: '100%',
                            background: 'rgba(239, 68, 68, 0.1)',
                            color: 'var(--error)',
                            fontSize: '0.875rem'
                        }}>
                            Sign Out
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '2rem' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    {children}
                </div>
            </main>
        </div>
    )
}
