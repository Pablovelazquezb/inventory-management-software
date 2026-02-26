'use client'

import React from 'react'
import Link from 'next/link'
import { useTranslation } from '@/hooks/useTranslation'

export default function TopCustomersList({ sales }: { sales: any[] }) {
    const { t } = useTranslation()
    // Group sales by customer
    const salesByCustomer = sales.reduce((acc: any, sale) => {
        // If no customer, group under "Unknown"
        const name = sale.customers?.name || 'Walk-in Customer'
        if (!acc[name]) {
            acc[name] = { name, count: 0, revenue: 0 }
        }
        acc[name].count += 1
        acc[name].revenue += sale.total_price || 0
        return acc
    }, {})

    const sortedCustomers = Object.values(salesByCustomer)
        .sort((a: any, b: any) => b.revenue - a.revenue)
        .slice(0, 5)

    return (
        <div className="card" style={{ padding: '0', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', background: 'linear-gradient(to right, rgba(255,255,255,0.02), transparent)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>{t.dashboard.topCustomers}</h3>
                <Link href="/inventory/customers" style={{ fontSize: '0.875rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }} className="hover-slide">
                    {t.dashboard.viewAll} <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>→</span>
                </Link>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
                {sortedCustomers.map((customer: any, index: number) => (
                    <div key={customer.name} style={{
                        padding: '1.25rem 2rem',
                        borderBottom: '1px solid var(--border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'default',
                        animationDelay: `${index * 0.1 + 0.2}s`
                    }} className="hover-bg hover-slide animate-slide-up">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                            <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '12px',
                                background: index === 0 ? 'linear-gradient(135deg, #FFD700, #FDB931)' :
                                    index === 1 ? 'linear-gradient(135deg, #E3E8EC, #92A6B6)' :
                                        index === 2 ? 'linear-gradient(135deg, #E28743, #A5511A)' :
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
                                {index === 0 ? '👑' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                            </div>
                            <div>
                                <div style={{ fontSize: '1rem', fontWeight: 600 }}>{customer.name}</div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>{customer.count} Orders</div>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--foreground)' }}>
                                ${customer.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <div style={{ fontSize: '0.75rem', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Spent</div>
                        </div>
                    </div>
                ))}
                {sortedCustomers.length === 0 && (
                    <div style={{ padding: '3rem', textAlign: 'center', opacity: 0.5 }}>
                        No customer data
                    </div>
                )}
            </div>
        </div>
    )
}
