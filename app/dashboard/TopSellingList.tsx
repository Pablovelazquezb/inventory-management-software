'use client'

import React from 'react'
import Link from 'next/link'
import { useTranslation } from '@/hooks/useTranslation'

export default function TopSellingList({ sales }: { sales: any[] }) {
    const { t } = useTranslation()
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
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', background: 'linear-gradient(to right, rgba(255,255,255,0.02), transparent)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>{t.dashboard.topSellers}</h3>
                <Link href="/inventory/sales" style={{ fontSize: '0.875rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }} className="hover-slide">
                    {t.dashboard.viewAll} <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>→</span>
                </Link>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
                {sortedItems.map((item: any, index: number) => (
                    <div key={item.name} style={{
                        padding: '1.25rem 2rem',
                        borderBottom: '1px solid var(--border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'default',
                        animationDelay: `${index * 0.1}s`
                    }} className="hover-bg hover-slide animate-slide-up">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                            <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '12px',
                                background: index === 0 ? 'linear-gradient(135deg, #FFD700, #FDB931)' : /* Gold */
                                    index === 1 ? 'linear-gradient(135deg, #E3E8EC, #92A6B6)' : /* Silver */
                                        index === 2 ? 'linear-gradient(135deg, #E28743, #A5511A)' : /* Bronze */
                                            'var(--surface-highlight)',
                                color: index <= 2 ? '#fff' : 'var(--text-muted)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1rem',
                                fontWeight: 800,
                                boxShadow: index <= 2 ? '0 4px 10px rgba(0,0,0,0.15)' : 'none',
                                textShadow: index <= 2 ? '0 2px 4px rgba(0,0,0,0.2)' : 'none'
                            }}>
                                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                            </div>
                            <div>
                                <div style={{ fontSize: '1rem', fontWeight: 600 }}>{item.name}</div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>{index === 0 ? 'Best Seller' : `Rank #${index + 1}`}</div>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--foreground)' }}>{item.quantity}</div>
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
