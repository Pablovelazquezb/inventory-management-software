'use client'

import React from 'react'
import { useTranslation } from '@/hooks/useTranslation'

interface KPIGridProps {
    totalRevenue: number
    totalItemsSold: number
    totalSalesCount: number
    totalStockEntries: number
}

export default function KPIGrid({ totalRevenue, totalItemsSold, totalSalesCount, totalStockEntries }: KPIGridProps) {
    const { t } = useTranslation()

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
            {/* Revenue Card */}
            <div className="card" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(6, 182, 212, 0.05))', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
                <div style={{ position: 'absolute', top: 0, right: 0, padding: '1.5rem', opacity: 0.1, color: 'var(--success)' }}>
                    <svg width="80" height="80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div style={{ fontSize: '0.875rem', opacity: 0.8, marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--success)' }}>
                    {t.dashboard.totalRevenue}
                </div>
                <div style={{ fontSize: '3rem', fontWeight: 700, background: 'var(--success-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    ${totalRevenue.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.85rem', opacity: 0.6, marginTop: '0.5rem' }}>
                    {t.dashboard.allTimeIncome}
                </div>
            </div>

            {/* Items Sold Card */}
            <div className="card" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.05))', borderColor: 'rgba(99, 102, 241, 0.2)' }}>
                <div style={{ position: 'absolute', top: 0, right: 0, padding: '1.5rem', opacity: 0.1, color: 'var(--primary)' }}>
                    <svg width="80" height="80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                </div>
                <div style={{ fontSize: '0.875rem', opacity: 0.8, marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#8b5cf6' }}>
                    {t.dashboard.itemsSold}
                </div>
                <div style={{ fontSize: '3rem', fontWeight: 700, color: '#f8fafc' }}>
                    {totalItemsSold.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.85rem', opacity: 0.6, marginTop: '0.5rem' }}>
                    {t.dashboard.unitsDelivered}
                </div>
            </div>

            {/* Activity Card */}
            <div className="card" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(244, 63, 94, 0.05))', borderColor: 'rgba(236, 72, 153, 0.2)' }}>
                <div style={{ position: 'absolute', top: 0, right: 0, padding: '1.5rem', opacity: 0.1, color: '#ec4899' }}>
                    <svg width="80" height="80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                </div>
                <div style={{ fontSize: '0.875rem', opacity: 0.8, marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#ec4899' }}>
                    {t.dashboard.activity}
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 600, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.75rem', fontWeight: 700 }}>{totalSalesCount}</span>
                        <span style={{ fontSize: '0.875rem', opacity: 0.6 }}>{t.dashboard.salesOrders}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.75rem', fontWeight: 700 }}>{totalStockEntries}</span>
                        <span style={{ fontSize: '0.875rem', opacity: 0.6 }}>{t.dashboard.stockEntries}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
