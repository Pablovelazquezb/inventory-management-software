'use client'

import Link from 'next/link'
import { useTranslation } from '@/hooks/useTranslation'

export default function PurchasesHeader() {
    const { t } = useTranslation()
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
                <Link href="/inventory" className="btn" style={{ paddingLeft: 0, color: 'rgba(248,250,252,0.6)' }}>
                    {t.purchases.backToInventory}
                </Link>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0, background: 'linear-gradient(to right, #f8fafc, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{t.purchases.title}</h2>
            </div>
            <Link href="/inventory/purchases/new" className="btn btn-primary">
                {t.purchases.newPurchase}
            </Link>
        </div>
    )
}
