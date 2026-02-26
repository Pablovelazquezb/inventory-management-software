'use client'

import { useTranslation } from '@/hooks/useTranslation'

export default function DashboardHeader() {
    const { t } = useTranslation()

    return (
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
            <div>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0, color: 'var(--foreground)' }}>
                    {t.dashboard.title}
                </h2>
                <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0', fontSize: '1.1rem' }}>
                    {t.dashboard.subtitle}
                </p>
            </div>
        </div>
    )
}
