import { requireSuperAdmin } from '@/utils/supabase/superadmin'
import Link from 'next/link'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    await requireSuperAdmin()

    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)', display: 'flex' }}>
            {/* Admin Sidebar */}
            <aside style={{
                width: '220px',
                background: '#0f172a',
                color: '#e2e8f0',
                padding: '2rem 1.25rem',
                display: 'flex',
                flexDirection: 'column',
                flexShrink: 0,
            }}>
                <div style={{ marginBottom: '2.5rem' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                        Super Admin
                    </div>
                    <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f1f5f9' }}>
                        Panel de Control
                    </h1>
                </div>

                <nav style={{ flex: 1 }}>
                    <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                        {[
                            { href: '/admin', label: '📊 Resumen', },
                            { href: '/admin/organizations', label: '🏢 Empresas', },
                            { href: '/admin/users', label: '👥 Usuarios', },
                        ].map(item => (
                            <li key={item.href}>
                                <Link href={item.href} style={{
                                    display: 'block',
                                    padding: '0.625rem 0.875rem',
                                    borderRadius: '8px',
                                    color: '#cbd5e1',
                                    fontSize: '0.9rem',
                                    fontWeight: 500,
                                    textDecoration: 'none',
                                    transition: 'all 0.15s',
                                }}>
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div style={{ borderTop: '1px solid #1e293b', paddingTop: '1.25rem' }}>
                    <Link href="/dashboard" style={{
                        display: 'block',
                        padding: '0.625rem 0.875rem',
                        borderRadius: '8px',
                        color: '#64748b',
                        fontSize: '0.85rem',
                        textDecoration: 'none',
                    }}>
                        ← Volver al Dashboard
                    </Link>
                </div>
            </aside>

            {/* Main content */}
            <main style={{ flex: 1, padding: '2.5rem', overflowY: 'auto' }}>
                {children}
            </main>
        </div>
    )
}
