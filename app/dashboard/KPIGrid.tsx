'use client'

import React from 'react'

interface KPIGridProps {
    totalRevenue: number
    totalItemsSold: number
    totalSalesCount: number
    totalStockEntries: number
}

export default function KPIGrid({ totalRevenue, totalItemsSold, totalSalesCount, totalStockEntries }: KPIGridProps) {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
            <div className="card" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, right: 0, padding: '1.5rem', opacity: 0.1 }}>
                    <svg width="60" height="60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div style={{ fontSize: '0.875rem', opacity: 0.6, marginBottom: '0.5rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Revenue</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--success)' }}>
                    ${totalRevenue.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.8rem', opacity: 0.5, marginTop: '0.5rem' }}>
                    All time
                </div>
            </div>

            <div className="card" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, right: 0, padding: '1.5rem', opacity: 0.1 }}>
                    <svg width="60" height="60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                </div>
                <div style={{ fontSize: '0.875rem', opacity: 0.6, marginBottom: '0.5rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Items Sold</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 700 }}>
                    {totalItemsSold.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.8rem', opacity: 0.5, marginTop: '0.5rem' }}>
                    Units
                </div>
            </div>

            <div className="card" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, right: 0, padding: '1.5rem', opacity: 0.1 }}>
                    <svg width="60" height="60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                </div>
                <div style={{ fontSize: '0.875rem', opacity: 0.6, marginBottom: '0.5rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Activity</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 600, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div>{totalSalesCount} <span style={{ fontSize: '0.875rem', opacity: 0.5, fontWeight: 400 }}>Sales Orders</span></div>
                    <div>{totalStockEntries} <span style={{ fontSize: '0.875rem', opacity: 0.5, fontWeight: 400 }}>Stock Entries</span></div>
                </div>
            </div>
        </div>
    )
}
