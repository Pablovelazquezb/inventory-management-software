'use client'

import React from 'react'

export default function RecentSalesList({ sales }: { sales: any[] }) {
    // Sort logic is already done in parent (sold_at descending)
    const recentSales = sales.slice(0, 5)

    const formatTimeAgo = (dateString: string) => {
        const saleDate = new Date(dateString)
        const now = new Date()
        const diffMs = now.getTime() - saleDate.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMins / 60)
        const diffDays = Math.floor(diffHours / 24)

        if (diffMins < 1) return 'Just now'
        if (diffMins < 60) return `${diffMins} min ago`
        if (diffHours < 24) return `${diffHours} hr ago`
        if (diffDays === 1) return 'Yesterday'
        return `${diffDays} days ago`
    }

    return (
        <div className="card" style={{ padding: '0', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', background: 'linear-gradient(to right, rgba(255,255,255,0.02), transparent)' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Recent Activity</h3>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
                {recentSales.map((sale: any, index: number) => {
                    const customerName = sale.customers?.name || 'Walk-in Customer'
                    // For batch logic, quantity and item name might be null or multiple
                    // We'll use the item_name and quantity stored in sales directly.
                    return (
                        <div key={sale.id} style={{
                            padding: '1.25rem 2rem',
                            borderBottom: '1px solid var(--border)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'default',
                            animationDelay: `${index * 0.1 + 0.4}s`
                        }} className="hover-bg hover-slide animate-slide-up">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    background: 'var(--surface-highlight)',
                                    color: 'var(--primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.2rem',
                                    fontWeight: 700,
                                    border: '1px solid var(--border)'
                                }}>
                                    {customerName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div style={{ fontSize: '1rem', fontWeight: 600 }}>{customerName}</div>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>
                                        Bought {sale.quantity}x {sale.item_name || 'Items'}
                                    </div>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--success)' }}>
                                    +${(sale.total_price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                                <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>
                                    {formatTimeAgo(sale.sold_at || sale.created_at)}
                                </div>
                            </div>
                        </div>
                    )
                })}
                {recentSales.length === 0 && (
                    <div style={{ padding: '3rem', textAlign: 'center', opacity: 0.5 }}>
                        No recent activity
                    </div>
                )}
            </div>
        </div>
    )
}
