'use client'

import Link from 'next/link'
import { useTranslation } from '@/hooks/useTranslation'

export default function PurchasesHeader() {
    const { t } = useTranslation()
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <Link href="/inventory" className="btn" style={{ paddingLeft: 0, color: 'rgba(248,250,252,0.6)' }}>
                {t.purchases.backToInventory}
            </Link>
            <Link href="/inventory/purchases/new" className="btn btn-primary">
                {t.purchases.newPurchase}
            </Link>
        </div>
    )
}
