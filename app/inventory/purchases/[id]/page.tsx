'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/utils/supabase/client'
import { receivePurchaseItems } from '../../actions'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function PurchaseDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const [purchase, setPurchase] = useState<any>(null)
    const [items, setItems] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const fetchPurchase = async () => {
            const supabase = createClient()
            // Fetch purchase details
            const { data: pData, error: pError } = await supabase
                .from('purchases')
                .select('*, suppliers(name)')
                .eq('id', id)
                .single()

            if (pError) {
                console.error(pError)
                return
            }
            setPurchase(pData)

            // Fetch Items
            const { data: iData, error: iError } = await supabase
                .from('purchase_items')
                .select('*, inventory_items(name)')
                .eq('purchase_id', id)

            if (iData) setItems(iData)
            setLoading(false)
        }
        fetchPurchase()
    }, [id])

    const handleReceive = async () => {
        if (!confirm('Confirm receipt of all items? Inventory will be updated.')) return

        // Prepare items for reception (assuming full receipt for now, could be partial)
        const receivedItems = items.map(item => ({
            id: item.id,
            itemId: item.item_id,
            quantityReceived: item.quantity_ordered // Defaulting to unordered quantity
        }))

        const result = await receivePurchaseItems(id, receivedItems)

        if (result?.error) {
            alert(result.error)
        } else {
            alert('Items received and inventory updated!')
            router.refresh()
            // reload page data
            window.location.reload()
        }
    }

    const handlePaymentStatusChange = async (newStatus: string) => {
        const supabase = createClient()
        const { error } = await supabase
            .from('purchases')
            .update({ payment_status: newStatus })
            .eq('id', id)

        if (error) {
            alert('Error updating payment status')
        } else {
            setPurchase({ ...purchase, payment_status: newStatus })
            router.refresh()
        }
    }

    if (loading) return <div>Loading...</div>
    if (!purchase) return <div>Purchase not found</div>

    const subtotal = items.reduce((sum, item) => sum + (item.quantity_ordered * item.cost_per_unit), 0)
    const taxRate = purchase.tax_rate || 0
    const taxAmount = subtotal * taxRate
    const totalAmount = subtotal + taxAmount

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '4rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <Link href="/inventory/purchases" style={{ fontSize: '0.875rem', opacity: 0.5, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    ← Back to Purchases
                </Link>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginTop: '1rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>Order #{purchase.id.slice(0, 8)}</h1>
                        <div style={{ marginTop: '0.5rem', opacity: 0.7 }}>
                            {purchase.suppliers?.name} • {new Date(purchase.created_at).toLocaleDateString()}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        {/* Payment Status Dropdown */}
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.75rem', opacity: 0.5, marginBottom: '0.25rem' }}>PAYMENT</div>
                            <select
                                value={purchase.payment_status || 'pending'}
                                onChange={(e) => handlePaymentStatusChange(e.target.value)}
                                style={{
                                    padding: '0.5rem',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border)',
                                    background: 'var(--surface)',
                                    color: 'white',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="pending">Pending</option>
                                <option value="partial">Partial</option>
                                <option value="paid">Paid</option>
                            </select>
                        </div>

                        {/* Order Status Badge */}
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.75rem', opacity: 0.5, marginBottom: '0.25rem' }}>STATUS</div>
                            <span style={{
                                display: 'inline-block',
                                padding: '0.5rem 1rem',
                                borderRadius: '20px',
                                fontWeight: 600,
                                background: purchase.status === 'ordered' ? 'rgba(255, 165, 0, 0.2)' :
                                    purchase.status === 'received' ? 'rgba(34, 197, 94, 0.2)' :
                                        'rgba(255,255,255,0.1)',
                                color: purchase.status === 'ordered' ? 'orange' :
                                    purchase.status === 'received' ? '#22c55e' :
                                        'inherit'
                            }}>
                                {purchase.status.toUpperCase()}
                            </span>
                        </div>
                    </div>
                </div>

                {purchase.notes && (
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', marginTop: '1.5rem', fontSize: '0.9rem', opacity: 0.8 }}>
                        <strong>Notes:</strong> {purchase.notes}
                    </div>
                )}
            </div>

            <div className="card" style={{ padding: '2rem' }}>
                <h3 style={{ marginTop: 0, marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>Items</h3>

                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', opacity: 0.6, fontSize: '0.875rem' }}>
                            <th style={{ padding: '0.5rem' }}>Item</th>
                            <th style={{ padding: '0.5rem', textAlign: 'right' }}>Ordered</th>
                            <th style={{ padding: '0.5rem', textAlign: 'right' }}>Received</th>
                            <th style={{ padding: '0.5rem', textAlign: 'right' }}>Cost</th>
                            <th style={{ padding: '0.5rem', textAlign: 'right' }}>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map(item => (
                            <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '1rem 0.5rem' }}>{item.inventory_items?.name}</td>
                                <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>{item.quantity_ordered}</td>
                                <td style={{ padding: '1rem 0.5rem', textAlign: 'right', color: item.quantity_received > 0 ? 'var(--success)' : 'inherit' }}>
                                    {item.quantity_received}
                                </td>
                                <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>${item.cost_per_unit}</td>
                                <td style={{ padding: '1rem 0.5rem', textAlign: 'right', fontWeight: 600 }}>
                                    ${(item.quantity_ordered * item.cost_per_unit).toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan={4} style={{ padding: '0.5rem 0.5rem', textAlign: 'right', opacity: 0.7 }}>Subtotal:</td>
                            <td style={{ padding: '0.5rem 0.5rem', textAlign: 'right' }}>${subtotal.toFixed(2)}</td>
                        </tr>
                        {taxRate > 0 && (
                            <tr>
                                <td colSpan={4} style={{ padding: '0.5rem 0.5rem', textAlign: 'right', opacity: 0.7 }}>IVA ({(taxRate * 100).toFixed(0)}%):</td>
                                <td style={{ padding: '0.5rem 0.5rem', textAlign: 'right' }}>${taxAmount.toFixed(2)}</td>
                            </tr>
                        )}
                        <tr>
                            <td colSpan={4} style={{ padding: '1.5rem 0.5rem', textAlign: 'right', fontWeight: 600 }}>Total Order Amount:</td>
                            <td style={{ padding: '1.5rem 0.5rem', textAlign: 'right', fontWeight: 700, fontSize: '1.25rem', color: 'var(--primary)' }}>
                                ${totalAmount.toLocaleString()}
                            </td>
                        </tr>
                    </tfoot>
                </table>

                {purchase.status === 'ordered' && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                        <button
                            className="btn btn-primary"
                            onClick={handleReceive}
                        >
                            Confirm Receipt & Update Inventory
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
