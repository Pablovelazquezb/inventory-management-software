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
                        <th style={{ textAlign: 'left', padding: '1rem', opacity: 0.7, fontWeight: 600 }}>{t.sales.item}</th>
                        <th style={{ textAlign: 'center', padding: '1rem', opacity: 0.7, fontWeight: 600 }}>{t.sales.qty}</th>
                        <th style={{ textAlign: 'right', padding: '1rem', opacity: 0.7, fontWeight: 600 }}>{t.sales.pricePerUnit}</th>
                        <th style={{ textAlign: 'right', padding: '1rem', opacity: 0.7, fontWeight: 600 }}>{t.sales.total}</th>
                        <th style={{ textAlign: 'left', padding: '1rem', opacity: 0.7, fontWeight: 600 }}>{t.sales.note}</th>
                        <th style={{ textAlign: 'center', padding: '1rem', opacity: 0.7, fontWeight: 600 }}>{t.sales.invoice}</th>
                    </tr>
                </thead>
                <tbody>
                    {sales && sales.length > 0 ? (
                        sales.map((sale: any) => (
                            <tr key={sale.id} className="hover-bg" style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                                    {new Date(sale.sold_at).toLocaleDateString()}
                                    <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>
                                        {new Date(sale.sold_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </td>
                                <td style={{ padding: '1rem', fontWeight: 500 }}>{sale.item_name}</td>
                                <td style={{ padding: '1rem', textAlign: 'center' }}>{sale.quantity}</td>
                                <td style={{ padding: '1rem', textAlign: 'right' }}>${sale.price_per_unit?.toFixed(2)}</td>
                                <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: 'var(--success)' }}>
                                    ${sale.total_price?.toFixed(2)}
                                </td>
                                <td style={{ padding: '1rem', fontSize: '0.9rem', opacity: 0.8, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {sale.note || '-'}
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'center' }}>
                                    {sale.invoice_url ? (
                                        <a href={sale.invoice_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>
                                            {t.sales.viewInvoice}
                                        </a>
                                    ) : (
                                        <span style={{ opacity: 0.3 }}>-</span>
                                    )}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', opacity: 0.5 }}>
                                {t.sales.noSales}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}
