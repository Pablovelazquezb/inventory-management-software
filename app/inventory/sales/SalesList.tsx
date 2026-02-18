'use client'

import { useTranslation } from '@/hooks/useTranslation'

interface SalesListProps {
    sales: any[]
}

export default function SalesList({ sales }: SalesListProps) {
    const { t } = useTranslation()

    return (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                    <tr>
                        <th style={{ textAlign: 'left', padding: '1rem', opacity: 0.7, fontWeight: 600 }}>{t.sales.date}</th>
                        <th style={{ textAlign: 'left', padding: '1rem', opacity: 0.7, fontWeight: 600 }}>Customer</th>
                        <th style={{ textAlign: 'left', padding: '1rem', opacity: 0.7, fontWeight: 600 }}>{t.sales.item}</th>
                        <th style={{ textAlign: 'center', padding: '1rem', opacity: 0.7, fontWeight: 600 }}>{t.sales.qty}</th>
                        <th style={{ textAlign: 'right', padding: '1rem', opacity: 0.7, fontWeight: 600 }}>Subtotal</th>
                        <th style={{ textAlign: 'right', padding: '1rem', opacity: 0.7, fontWeight: 600 }}>Tax</th>
                        <th style={{ textAlign: 'right', padding: '1rem', opacity: 0.7, fontWeight: 600 }}>{t.sales.total}</th>
                        <th style={{ textAlign: 'left', padding: '1rem', opacity: 0.7, fontWeight: 600 }}>{t.sales.note}</th>
                    </tr>
                </thead>
                <tbody>
                    {sales && sales.length > 0 ? (
                        sales.map((sale: any) => {
                            const subtotal = sale.total_price || 0
                            const tax = sale.tax_amount || 0
                            const total = subtotal + tax

                            return (
                                <tr key={sale.id} className="hover-bg" style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                                        {new Date(sale.sold_at).toLocaleDateString()}
                                        <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>
                                            {new Date(sale.sold_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem', fontWeight: 500 }}>
                                        {sale.customers?.name || <span style={{ opacity: 0.5 }}>-</span>}
                                    </td>
                                    <td style={{ padding: '1rem', fontWeight: 500 }}>{sale.item_name}</td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>{sale.quantity}</td>
                                    <td style={{ padding: '1rem', textAlign: 'right', opacity: 0.8 }}>${subtotal.toFixed(2)}</td>
                                    <td style={{ padding: '1rem', textAlign: 'right', color: 'var(--primary)', fontSize: '0.9rem' }}>
                                        ${tax.toFixed(2)}
                                        {sale.taxes && (
                                            <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>
                                                {/* Optional: parse and show tax breakdown if needed */}
                                                {(sale.tax_rate * 100).toFixed(0)}%
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 700, color: 'var(--success)' }}>
                                        ${total.toFixed(2)}
                                    </td>
                                    <td style={{ padding: '1rem', fontSize: '0.9rem', opacity: 0.8, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {sale.note || '-'}
                                    </td>
                                </tr>
                            )
                        })
                    ) : (
                        <tr>
                            <td colSpan={8} style={{ padding: '3rem', textAlign: 'center', opacity: 0.5 }}>
                                {t.sales.noSales}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div >
    )
}
