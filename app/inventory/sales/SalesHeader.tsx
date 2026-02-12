'use client'

import Link from 'next/link'
import { useTranslation } from '@/hooks/useTranslation'

export default function SalesHeader() {
    const { t } = useTranslation()
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
                <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>{t.sales.title}</h1>
                <p style={{ opacity: 0.5, margin: '0.5rem 0 0' }}>{t.sales.subtitle}</p>
            </div>
            <Link href="/inventory/sell" className="btn btn-primary">
                {t.sales.newSale}
            </Link>
        </div>
    )
}
