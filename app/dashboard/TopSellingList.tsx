'use client'

import React from 'react'

export default function TopSellingList({ sales }: { sales: any[] }) {
    // Process top items
    const salesByItem = sales.reduce((acc: any, sale) => {
        const name = sale.item_name
        if (!acc[name]) {
            acc[name] = { name, quantity: 0, revenue: 0 }
        }
        acc[name].quantity += sale.quantity
        acc[name].revenue += sale.total_price
        return acc
    }, {})

    const sortedItems = Object.values(salesByItem)
        .sort((a: any, b: any) => b.quantity - a.quantity)
        .slice(0, 5)

    return (
        <div className="card" style={{ padding: '0', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', background: 'linear-gradient(to right, rgba(255,255,255,0.02), transparent)' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Top 5 Best Sellers</h3>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
                {sortedItems.map((item: any, index: number) => (
                    <div key={item.name} style={{
                        padding: '1.25rem 2rem',
                        borderBottom: '1px solid var(--border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'background 0.2s',
                        cursor: 'default'
                    }} className="hover:bg-[rgba(255,255,255,0.02)]">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '10px',
                                background: index === 0 ? 'linear-gradient(135deg, #fbbf24, #d97706)' :
                                    index === 1 ? 'linear-gradient(135deg, #e2e8f0, #94a3b8)' :
                                        index === 2 ? 'linear-gradient(135deg, #f97316, #c2410c)' :
                                            'rgba(255,255,255,0.05)',
                                color: index < 3 ? '#fff' : 'rgba(255,255,255,0.5)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.9rem',
                                fontWeight: 700,
                                boxShadow: index < 3 ? '0 4px 6px -1px rgba(0,0,0,0.1)' : 'none'
                            }}>
                                {index + 1}
                            </div>
                            <div>
                                <div style={{ fontSize: '1rem', fontWeight: 600 }}>{item.name}</div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.5 }}>Rank #{index + 1}</div>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#f8fafc' }}>{item.quantity}</div>
                            <div style={{ fontSize: '0.75rem', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Units Sold</div>
                        </div>
                    </div>
                ))}
                {sortedItems.length === 0 && (
                    <div style={{ padding: '3rem', textAlign: 'center', opacity: 0.5 }}>
                        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📉</div>
                        No sales data yet
                    </div>
                )}
            </div>
        </div>
    )
}
