'use client'

import React from 'react'
import Link from 'next/link'
import { useTranslation } from '@/hooks/useTranslation'

interface PurchasesListProps {
    purchases: any[] | null
}

export default function PurchasesList({ purchases }: PurchasesListProps) {
    const { t } = useTranslation()

    return (
        <div className="card" style={{ padding: 0 }}>
            <table>
                <thead>
                    <tr>
                        <th>{t.purchases.date}</th>
                        <th>{t.purchases.supplier}</th>
                        <th style={{ textAlign: 'center' }}>{t.purchases.status}</th>
                        <th style={{ textAlign: 'center' }}>{t.purchases.payment}</th>
                        <th style={{ textAlign: 'right' }}>{t.purchases.amount}</th>
                        <th style={{ textAlign: 'right' }}>{t.purchases.expected}</th>
                        <th style={{ textAlign: 'right' }}>{t.purchases.actions}</th>
                    </tr>
                </thead>
                <tbody>
                    {purchases?.map((p, i) => (
                        <tr key={p.id} style={{ animation: `fadeIn 0.3s ease-out ${i * 0.05}s forwards`, opacity: 0 }}>
                            <td style={{ opacity: 0.8 }}>
                                {new Date(p.created_at).toLocaleDateString()}
                            </td>
                            <td style={{ fontWeight: 500, color: 'var(--foreground)' }}>
                                {p.suppliers?.name || t.purchases.unknown}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                                <span className={`badge ${p.status === 'ordered' ? 'badge-warning' :
                                    p.status === 'received' ? 'badge-success' :
                                        'badge-neutral'
                                    }`}>
                                    {p.status.toUpperCase()}
                                </span>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                                <span className={`badge ${p.payment_status === 'paid' ? 'badge-success' :
                                    p.payment_status === 'partial' ? 'badge-warning' :
                                        'badge-neutral'
                                    }`}>
                                    {(p.payment_status || 'pending').toUpperCase()}
                                </span>
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: 600 }}>
                                ${p.total_amount?.toLocaleString() ?? '0.00'}
                            </td>
                            <td style={{ textAlign: 'right', opacity: 0.7 }}>
                                {p.expected_date ? new Date(p.expected_date).toLocaleDateString() : '-'}
                            </td>
                            <td style={{ textAlign: 'right' }}>
                                <Link
                                    href={`/inventory/purchases/${p.id}`}
                                    className="btn"
                                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)' }}
                                >
                                    {t.purchases.view}
                                </Link>
                            </td>
                        </tr>
                    ))}
                    {(!purchases || purchases.length === 0) && (
                        <tr>
                            <td colSpan={7} style={{ padding: '4rem', textAlign: 'center', opacity: 0.5 }}>
                                <div style={{ marginBottom: '1rem', fontSize: '2rem' }}>📦</div>
                                {t.purchases.noPurchases}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}
