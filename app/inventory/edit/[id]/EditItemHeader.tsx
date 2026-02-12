'use client'

import React from 'react'
import Link from 'next/link'
import { useTranslation } from '@/hooks/useTranslation'

export default function EditItemHeader() {
    const { t } = useTranslation()

    return (
        <div style={{ marginBottom: '2rem' }}>
            <Link href="/inventory" style={{ fontSize: '0.875rem', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                {t.inventory.backToInventory}
            </Link>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.875rem', fontWeight: 700 }}>{t.inventory.editHeader}</h2>
            </div>
        </div>
    )
}
