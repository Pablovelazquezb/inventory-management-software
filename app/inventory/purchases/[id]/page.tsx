'use client'

import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { useEffect, useState, use } from 'react'
import { completePurchase, deletePurchase } from '../actions'
import { useRouter } from 'next/navigation'

export default function PurchaseDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter()
    const { id } = use(params)
    const [purchase, setPurchase] = useState<any>(null)
    const [items, setItems] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(false)

    useEffect(() => {
        if (!id) return
        async function fetchData() {
            const supabase = createClient()
            // Fetch Purchase
            const { data: p } = await supabase.from('purchases').select('*').eq('id', id).single()
            if (p) {
                setPurchase(p)
                // Fetch Items
                const { data: i } = await supabase.from('purchase_items').select('*, inventory_items(name)').eq('purchase_id', id)
                if (i) setItems(i)
            }
            setLoading(false)
        }
        fetchData()
    }, [id])

    const handleComplete = async () => {
        if (!confirm('This will update your inventory stock. Are you sure you received these items?')) return
        setActionLoading(true)
        const res = await completePurchase(id)
        if (res?.error) {
            alert(res.error)
            setActionLoading(false)
        } else {
            // Action handles revalidate, but we can also refresh local
            window.location.reload()
        }
    }

    const handleDelete = async () => {
        if (!confirm('Are you sure? This cannot be undone.')) return
        setActionLoading(true)
        await deletePurchase(id)
        router.push('/inventory/purchases')
    }

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
    if (!purchase) return <div style={{ padding: '2rem', textAlign: 'center' }}>Purchase not found</div>

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <Link href="/inventory/purchases" style={{ fontSize: '0.875rem', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    ← Back to Purchases
                </Link>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h2 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Order <span style={{ opacity: 0.5 }}>{purchase.id.slice(0, 8)}</span></h2>
                        <p style={{ opacity: 0.7 }}>{purchase.supplier_name}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                        <span style={{
                            padding: '0.4rem 0.8rem',
                            borderRadius: '20px',
                            background: purchase.status === 'completed' ? 'var(--success)' : 'orange',
                            color: 'white',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            display: 'inline-block'
                        }}>
                            {purchase.status.toUpperCase()}
                        </span>
                        <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>{new Date(purchase.created_at).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: 600 }}>Items</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                    <thead style={{ borderBottom: '1px solid var(--border)' }}>
                        <tr>
                            <th style={{ padding: '0.75rem', opacity: 0.6 }}>Item</th>
                            <th style={{ padding: '0.75rem', opacity: 0.6 }}>Qty</th>
                            <th style={{ padding: '0.75rem', opacity: 0.6 }}>Cost</th>
                            <th style={{ padding: '0.75rem', opacity: 0.6, textAlign: 'right' }}>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map(item => (
                            <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '0.75rem' }}>
                                    {item.inventory_items?.name || 'Unknown Item'}
                                    {item.inventory_items?.name && <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>{item.item_id.slice(-4)}</div>}
                                </td>
                                <td style={{ padding: '0.75rem' }}>
                                    {item.quantity} {item.unit_type === 'kg' ? 'kg' : 'units'}
                                </td>
                                <td style={{ padding: '0.75rem' }}>${item.price_per_unit}</td>
                                <td style={{ padding: '0.75rem', textAlign: 'right' }}>${(item.quantity * item.price_per_unit).toFixed(2)}</td>
                            </tr>
                        ))}
                        {/* Grand Total Row */}
                        <tr style={{ borderTop: '2px solid var(--border)' }}>
                            <td colSpan={3} style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>Total</td>
                            <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 700, fontSize: '1.1rem' }}>
                                ${items.reduce((sum, i) => sum + (i.quantity * i.price_per_unit), 0).toFixed(2)}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div className="card">
                    <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', fontWeight: 600, opacity: 0.8 }}>Note</h3>
                    <p style={{ fontSize: '0.9rem', opacity: 0.7, whiteSpace: 'pre-wrap' }}>{purchase.note || 'No notes'}</p>
                </div>
                <div className="card">
                    <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', fontWeight: 600, opacity: 0.8 }}>Attachments</h3>
                    {purchase.invoice_url ? (
                        <a href={purchase.invoice_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', textDecoration: 'underline' }}>
                            📄 View Invoice/PO
                        </a>
                    ) : (
                        <p style={{ fontSize: '0.9rem', opacity: 0.5 }}>No attachments</p>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {purchase.status === 'pending' ? (
                    <button onClick={handleDelete} disabled={actionLoading} className="btn" style={{ color: 'var(--error)', background: 'transparent', border: '1px solid var(--border)' }}>
                        Delete Order
                    </button>
                ) : <div />}

                {purchase.status === 'pending' && (
                    <button onClick={handleComplete} disabled={actionLoading} className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1rem' }}>
                        {actionLoading ? 'Processing...' : 'Complete Order & Update Stock'}
                    </button>
                )}
            </div>
        </div>
    )
}
