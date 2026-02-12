'use client'

import React from 'react'
import Link from 'next/link'
import { useTranslation } from '@/hooks/useTranslation'

export default function InventoryHeader() {
    const { t } = useTranslation()

    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 700 }}>
                {t.inventory.title}
            </h2>
            <Link href="/inventory/add" className="btn btn-primary">
                {t.inventory.newItem}
            </Link>
        </div>
    )
}
