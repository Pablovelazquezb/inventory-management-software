'use client'

import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function PurchasesPage() {
    const [purchases, setPurchases] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending')

    useEffect(() => {
        async function fetchPurchases() {
            const supabase = createClient()
            const { data, error } = await supabase
                .from('purchases')
                .select('*')
                .order('created_at', { ascending: false })

            if (data) setPurchases(data)
            setLoading(false)
        }
        fetchPurchases()
    }, [])

    const filteredPurchases = purchases.filter(p => p.status === activeTab)

    return (
        <div style={{ padding: '0 1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Purchases</h1>
                <Link href="/inventory/purchases/new" className="btn btn-primary">
                    + New Purchase
                </Link>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                <button
                    onClick={() => setActiveTab('pending')}
                    style={{
                        padding: '0.75rem 0',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'pending' ? '2px solid var(--primary)' : '2px solid transparent',
                        color: activeTab === 'pending' ? 'var(--foreground)' : 'rgba(255,255,255,0.5)',
                        cursor: 'pointer',
                        fontWeight: 500
                    }}
                >
                    In Process ({purchases.filter(p => p.status === 'pending').length})
                </button>
                <button
                    onClick={() => setActiveTab('completed')}
                    style={{
                        padding: '0.75rem 0',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'completed' ? '2px solid var(--primary)' : '2px solid transparent',
                        color: activeTab === 'completed' ? 'var(--foreground)' : 'rgba(255,255,255,0.5)',
                        cursor: 'pointer',
                        fontWeight: 500
                    }}
                >
                    History
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.5 }}>Loading...</div>
            ) : filteredPurchases.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', border: '1px dashed var(--border)', borderRadius: '8px', color: 'rgba(255,255,255,0.5)' }}>
                    No {activeTab} purchases found.
                </div>
            ) : (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                            <tr>
                                <th style={{ padding: '1rem', fontSize: '0.875rem', opacity: 0.6 }}>Date</th>
                                <th style={{ padding: '1rem', fontSize: '0.875rem', opacity: 0.6 }}>Supplier</th>
                                <th style={{ padding: '1rem', fontSize: '0.875rem', opacity: 0.6 }}>Note</th>
                                <th style={{ padding: '1rem', fontSize: '0.875rem', opacity: 0.6, textAlign: 'right' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPurchases.map(purchase => (
                                <tr key={purchase.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '1rem' }}>
                                        {new Date(purchase.created_at).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '1rem', fontWeight: 500 }}>{purchase.supplier_name}</td>
                                    <td style={{ padding: '1rem', opacity: 0.7 }}>{purchase.note || '-'}</td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <Link href={`/inventory/purchases/${purchase.id}`} className="btn" style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem' }}>
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
