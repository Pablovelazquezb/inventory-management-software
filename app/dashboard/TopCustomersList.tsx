'use client'

import React from 'react'

export default function TopCustomersList({ sales }: { sales: any[] }) {
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
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', background: 'linear-gradient(to right, rgba(255,255,255,0.02), transparent)' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Top Customers</h3>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
                {sortedCustomers.map((customer: any, index: number) => (
                    <div key={customer.name} style={{
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
                                background: 'rgba(255,255,255,0.05)',
                                color: 'rgba(255,255,255,0.5)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.9rem',
                                fontWeight: 700
                            }}>
                                {index + 1}
                            </div>
                            <div>
                                <div style={{ fontSize: '1rem', fontWeight: 600 }}>{customer.name}</div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.5 }}>{customer.count} Orders</div>
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
