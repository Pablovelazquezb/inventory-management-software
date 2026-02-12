'use client'

import { useTranslation } from '@/hooks/useTranslation'

export default function DashboardHeader() {
    const { t } = useTranslation()

    return (
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
            <div>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0, background: 'linear-gradient(to right, #f8fafc, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {t.dashboard.title}
                </h2>
                <p style={{ color: 'rgba(248,250,252,0.5)', margin: '0.5rem 0 0', fontSize: '1.1rem' }}>
                    {t.dashboard.subtitle}
                </p>
            </div>
            <div style={{ textAlign: 'right', opacity: 0.5, fontSize: '0.875rem', background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '20px' }}>
                {t.dashboard.realTime}
            </div>
        </div>
    )
}
