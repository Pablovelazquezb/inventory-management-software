import { createAdminClient } from '@/utils/supabase/admin'
import { requireSuperAdmin } from '@/utils/supabase/superadmin'

export default async function AdminPage() {
    await requireSuperAdmin()
    const admin = createAdminClient()

    const [
        { count: orgCount },
        { count: userCount },
        { count: itemCount },
    ] = await Promise.all([
        admin.from('organizations').select('*', { count: 'exact', head: true }),
        admin.from('profiles').select('*', { count: 'exact', head: true }),
        admin.from('inventory_items').select('*', { count: 'exact', head: true }),
    ])

    const stats = [
        { label: 'Empresas', value: orgCount ?? 0, icon: '🏢', color: '#6366f1' },
        { label: 'Usuarios', value: userCount ?? 0, icon: '👥', color: '#0ea5e9' },
        { label: 'Artículos en inventario', value: itemCount ?? 0, icon: '📦', color: '#10b981' },
    ]

    return (
        <div>
            <div style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                    Resumen General
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                    Vista global de todas las empresas y usuarios de la plataforma.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
                {stats.map(stat => (
                    <div key={stat.label} style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: '12px',
                        padding: '1.75rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                    }}>
                        <div style={{ fontSize: '2rem' }}>{stat.icon}</div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 800, color: stat.color, lineHeight: 1 }}>
                            {stat.value.toLocaleString()}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {stat.label}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
