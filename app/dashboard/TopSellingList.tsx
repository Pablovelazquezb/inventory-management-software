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
            <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Top 5 Best Sellers</h3>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
                {sortedItems.map((item: any, index: number) => (
                    <div key={item.name} style={{
                        padding: '1rem',
                        borderBottom: '1px solid var(--border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                background: index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? '#cd7f32' : 'var(--surface)',
                                color: index < 3 ? '#000' : 'inherit',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.75rem',
                                fontWeight: 700
                            }}>
                                {index + 1}
                            </div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{item.name}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 600 }}>{item.quantity}</div>
                            <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>Sold</div>
                        </div>
                    </div>
                ))}
                {sortedItems.length === 0 && (
                    <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.5 }}>No sales data</div>
                )}
            </div>
        </div>
    )
}
