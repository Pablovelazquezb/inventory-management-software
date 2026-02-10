'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { createPurchase } from '../../actions'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewPurchasePage() {
    const router = useRouter()
    const [suppliers, setSuppliers] = useState<any[]>([])
    const [inventoryItems, setInventoryItems] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Form State
    const [supplierId, setSupplierId] = useState('')
    const [expectedDate, setExpectedDate] = useState('')
    const [taxEnabled, setTaxEnabled] = useState(false)
    const [paymentStatus, setPaymentStatus] = useState('pending')
    const [notes, setNotes] = useState('')

    const [cart, setCart] = useState<{ itemId: string; name: string; quantity: number; cost: number }[]>([])
    const [submitting, setSubmitting] = useState(false)

    // Item Selection State
    const [selectedItem, setSelectedItem] = useState('')
    const [quantity, setQuantity] = useState(1)
    const [cost, setCost] = useState(0)

    useEffect(() => {
        const loadData = async () => {
            const supabase = createClient()
            const [supRes, itemRes] = await Promise.all([
                supabase.from('suppliers').select('*').order('name'),
                supabase.from('inventory_items').select('id, name, price').order('name')
            ])

            if (supRes.data) setSuppliers(supRes.data)
            if (itemRes.data) setInventoryItems(itemRes.data)
            setLoading(false)
        }
        loadData()
    }, [])

    const addItemToOrder = () => {
        if (!selectedItem) return
        const item = inventoryItems.find(i => i.id === selectedItem)
        if (!item) return

        setCart([...cart, {
            itemId: item.id,
            name: item.name,
            quantity: Number(quantity),
            cost: Number(cost)
        }])

        // Reset inputs
        setSelectedItem('')
        setQuantity(1)
        setCost(0)
    }

    const removeFromCart = (index: number) => {
        const newCart = [...cart]
        newCart.splice(index, 1)
        setCart(newCart)
    }

    const subtotal = cart.reduce((sum, item) => sum + (item.quantity * item.cost), 0)
    const taxRate = taxEnabled ? 0.16 : 0
    const taxAmount = subtotal * taxRate
    const totalAmount = subtotal + taxAmount

    const handleSubmit = async () => {
        if (!supplierId) return alert('Please select a supplier')
        if (cart.length === 0) return alert('Please add items to the order')

        setSubmitting(true)
        const result = await createPurchase(
            supplierId,
            cart,
            totalAmount,
            expectedDate,
            undefined, // documentUrl
            taxRate,
            paymentStatus,
            notes
        )
        setSubmitting(false)

        if (result?.error) {
            alert(result.error)
        } else {
            // Redirect to purchase details or list
            router.push('/inventory/purchases')
        }
    }

    if (loading) return <div>Loading...</div>

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '4rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <Link href="/inventory" style={{ fontSize: '0.875rem', opacity: 0.5, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    ← Back
                </Link>
                <h1 style={{ fontSize: '2rem', fontWeight: 700, marginTop: '0.5rem' }}>New Purchase Order</h1>
            </div>

            <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.8 }}>Supplier</label>
                        <select
                            className="input"
                            value={supplierId}
                            onChange={(e) => setSupplierId(e.target.value)}
                        >
                            <option value="">Select Supplier...</option>
                            {suppliers.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                        <div style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
                            <Link href="/inventory/suppliers" style={{ color: 'var(--primary)' }}>+ Manage Suppliers</Link>
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.8 }}>Expected Date</label>
                        <input
                            type="date"
                            className="input"
                            value={expectedDate}
                            onChange={(e) => setExpectedDate(e.target.value)}
                        />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.8 }}>IVA (16%)</label>
                        <div style={{ display: 'flex', alignItems: 'center', height: '42px' }}>
                            <input
                                type="checkbox"
                                checked={taxEnabled}
                                onChange={(e) => setTaxEnabled(e.target.checked)}
                                style={{ width: '20px', height: '20px' }}
                            />
                            <span style={{ marginLeft: '0.5rem', opacity: 0.7 }}>Apply Tax</span>
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.8 }}>Payment Status</label>
                        <select
                            className="input"
                            value={paymentStatus}
                            onChange={(e) => setPaymentStatus(e.target.value)}
                        >
                            <option value="pending">Pending</option>
                            <option value="partial">Partial</option>
                            <option value="paid">Paid</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.8 }}>Notes</label>
                        <textarea
                            className="input"
                            rows={1}
                            placeholder="Optional notes..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                </div>

                {/* Add Item Form */}
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
                    <h3 style={{ marginTop: 0, fontSize: '1.1rem' }}>Add Items</h3>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'end' }}>
                        <div style={{ flex: 2 }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', opacity: 0.8 }}>Product</label>
                            <select
                                className="input"
                                value={selectedItem}
                                onChange={(e) => setSelectedItem(e.target.value)}
                            >
                                <option value="">Select Product...</option>
                                {inventoryItems.map(i => (
                                    <option key={i.id} value={i.id}>{i.name}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', opacity: 0.8 }}>Quantity</label>
                            <input
                                type="number"
                                className="input"
                                min="1"
                                value={quantity}
                                onChange={(e) => setQuantity(Number(e.target.value))}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', opacity: 0.8 }}>Cost/Unit</label>
                            <input
                                type="number"
                                className="input"
                                min="0"
                                step="0.01"
                                value={cost}
                                onChange={(e) => setCost(Number(e.target.value))}
                            />
                        </div>
                        <button
                            className="btn btn-primary"
                            onClick={addItemToOrder}
                            disabled={!selectedItem}
                        >
                            Add
                        </button>
                    </div>
                </div>

                {/* Cart Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                            <th style={{ padding: '0.75rem', opacity: 0.6 }}>Product</th>
                            <th style={{ padding: '0.75rem', opacity: 0.6, textAlign: 'right' }}>Qty</th>
                            <th style={{ padding: '0.75rem', opacity: 0.6, textAlign: 'right' }}>Cost</th>
                            <th style={{ padding: '0.75rem', opacity: 0.6, textAlign: 'right' }}>Total</th>
                            <th style={{ padding: '0.75rem', opacity: 0.6 }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {cart.map((item, index) => (
                            <tr key={index} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '0.75rem' }}>{item.name}</td>
                                <td style={{ padding: '0.75rem', textAlign: 'right' }}>{item.quantity}</td>
                                <td style={{ padding: '0.75rem', textAlign: 'right' }}>${item.cost.toFixed(2)}</td>
                                <td style={{ padding: '0.75rem', textAlign: 'right' }}>${(item.quantity * item.cost).toFixed(2)}</td>
                                <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                                    <button
                                        onClick={() => removeFromCart(index)}
                                        style={{ color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer' }}
                                    >
                                        ×
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {cart.length === 0 && (
                            <tr>
                                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', opacity: 0.5 }}>Order items will appear here</td>
                            </tr>
                        )}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan={3} style={{ padding: '0.5rem 1rem', textAlign: 'right', opacity: 0.7 }}>Subtotal:</td>
                            <td style={{ padding: '0.5rem 1rem', textAlign: 'right' }}>${subtotal.toFixed(2)}</td>
                            <td></td>
                        </tr>
                        {taxEnabled && (
                            <tr>
                                <td colSpan={3} style={{ padding: '0.5rem 1rem', textAlign: 'right', opacity: 0.7 }}>IVA (16%):</td>
                                <td style={{ padding: '0.5rem 1rem', textAlign: 'right' }}>${taxAmount.toFixed(2)}</td>
                                <td></td>
                            </tr>
                        )}
                        <tr>
                            <td colSpan={3} style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>Total:</td>
                            <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 700, fontSize: '1.2rem', color: 'var(--primary)' }}>
                                ${totalAmount.toFixed(2)}
                            </td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        className="btn btn-primary"
                        style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}
                        onClick={handleSubmit}
                        disabled={submitting || cart.length === 0}
                    >
                        {submitting ? 'Creating Order...' : 'Create Purchase Order'}
                    </button>
                </div>

            </div>
        </div>
    )
}
