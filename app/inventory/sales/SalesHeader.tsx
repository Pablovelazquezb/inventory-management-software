'use client'

import Link from 'next/link'
import { useTranslation } from '@/hooks/useTranslation'

export default function SalesHeader() {
    const { t } = useTranslation()
    return (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
            <Link href="/inventory/sell" className="btn btn-primary">
                {t.sales.newSale}
            </Link>
        </div>
    )
}
