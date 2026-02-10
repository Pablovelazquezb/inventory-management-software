'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { sellBatchItems } from '../actions'
import Link from 'next/link'

interface CartItem {
    id: string
    name: string
    quantity: number
    price: number
    maxStock: number
}

export default function SellPage() {
    const [items, setItems] = useState<any[]>([])
    const [sales, setSales] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    // Cart state
    const [cart, setCart] = useState<CartItem[]>([])
    const [note, setNote] = useState('')
    const [invoiceUrl, setInvoiceUrl] = useState('')
    const [uploading, setUploading] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [showSuggestions, setShowSuggestions] = useState(false)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        const supabase = createClient()

        // Fetch items for selection
        const { data: itemsData } = await supabase
            .from('inventory_items')
            .select('id, name, quantity, price, category, sku')
            .order('name')

        if (itemsData) setItems(itemsData)

        // Fetch recent sales
        const { data: salesData } = await supabase
            .from('sales')
            .select('*')
            .order('sold_at', { ascending: false })
            .limit(20)

        if (salesData) setSales(salesData)

        setLoading(false)
    }

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    const addToCart = (item: any) => {
        // specific check
        if (item.quantity <= 0) {
            alert('Out of stock')
            return
        }

        // Check if already in cart
        const existing = cart.find(c => c.id === item.id)
        if (existing) {
            if (existing.quantity >= item.quantity) {
                alert('Max stock reached in cart')
                return
            }
            updateCartItem(item.id, 'quantity', existing.quantity + 1)
        } else {
            setCart([...cart, {
                id: item.id,
                name: item.name,
                quantity: 1,
                price: item.price,
                maxStock: item.quantity
            }])
        }
        setSearchTerm('')
    }

    const updateCartItem = (id: string, field: 'quantity' | 'price', value: number) => {
        setCart(cart.map(item => {
            if (item.id !== id) return item

            if (field === 'quantity') {
                // validation
                if (value > item.maxStock) {
                    alert(`Max stock is ${item.maxStock}`)
                    return item
                }
                if (value < 1) return item
            }

            return { ...item, [field]: value }
        }))
    }

    const removeFromCart = (id: string) => {
        setCart(cart.filter(item => item.id !== id))
    }

    const handleSubmit = async () => {
        if (cart.length === 0) return

        setSubmitting(true)

        const result = await sellBatchItems(cart, note, invoiceUrl)

        if (result?.error) {
            alert(result.error)
        } else {
            // Success
            setCart([])
            setNote('')
            setInvoiceUrl('')
            await fetchData() // Refresh stock
        }
        setSubmitting(false)
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return

        const file = e.target.files[0]
        setUploading(true)

        const supabase = createClient()
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `sales/${fileName}`

        const { error: uploadError } = await supabase.storage.from('documents').upload(filePath, file)

        if (uploadError) {
            alert('Error uploading: ' + uploadError.message)
            setUploading(false)
            return
        }

        const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(filePath)
        setInvoiceUrl(publicUrl)
        setUploading(false)
    }

    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)

    return (
        <div style={{ paddingBottom: '4rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <Link href="/inventory" style={{ fontSize: '0.875rem', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    ← Back to Inventory
                </Link>
                <h2 style={{ fontSize: '2rem', fontWeight: 700 }}>Record Sale</h2>
                <p style={{ color: 'rgba(255,255,255,0.5)' }}>Add items to cart, adjust prices if needed, and confirm.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 2fr) 1fr', gap: '2rem', alignItems: 'start' }}>

                {/* Left Column: Product Search & Cart */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    const [showSuggestions, setShowSuggestions] = useState(false)

                    // ... inside return ...

                    {/* Search */}
                    <div className="card" style={{ padding: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.8 }}>Add Item to Sale</label>
                        <input
                            className="input"
                            placeholder="Type name or SKU..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            onFocus={() => setShowSuggestions(true)}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} // Delay to allow click
                        />
                        {(searchTerm || showSuggestions) && (
                            <div style={{ marginTop: '0.5rem', maxHeight: '300px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '8px' }}>
                                {filteredItems.length > 0 ? (
                                    Object.entries(filteredItems.reduce((acc, item) => {
                                        const cat = item.category || 'Uncategorized'
                                        if (!acc[cat]) acc[cat] = []
                                        acc[cat].push(item)
                                        return acc
                                    }, {} as Record<string, typeof items>)).sort().map(([category, categoryItems]) => (
                                        <div key={category}>
                                            <div style={{
                                                padding: '0.5rem 0.75rem',
                                                background: 'rgba(255,255,255,0.05)',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                opacity: 0.7,
                                                borderBottom: '1px solid var(--border)',
                                                borderTop: '1px solid var(--border)'
                                            }}>
                                                {category}
                                            </div>
                                            {categoryItems.map(item => (
                                                <div
                                                    key={item.id}
                                                    onClick={() => addToCart(item)}
                                                    style={{
                                                        padding: '0.75rem',
                                                        cursor: 'pointer',
                                                        borderBottom: '1px solid var(--border)',
                                                        background: 'rgba(255,255,255,0.02)',
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center'
                                                    }}
                                                    className="hover-bg"
                                                >
                                                    <div>
                                                        <div style={{ fontWeight: 500 }}>{item.name}</div>
                                                        <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>{item.sku}</div>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <div style={{ fontWeight: 600 }}>${item.price}</div>
                                                        <div style={{ fontSize: '0.75rem', opacity: item.quantity > 0 ? 0.5 : 1, color: item.quantity > 0 ? 'inherit' : 'var(--error)' }}>
                                                            {item.quantity} in stock
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ padding: '1rem', opacity: 0.5, textAlign: 'center' }}>No matches found</div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Cart List */}
                    <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>
                            Current Sale Items ({cart.length})
                        </div>
                        {cart.length > 0 ? (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ background: 'rgba(255,255,255,0.02)', fontSize: '0.75rem', opacity: 0.7 }}>
                                    <tr>
                                        <th style={{ textAlign: 'left', padding: '0.75rem' }}>Item</th>
                                        <th style={{ textAlign: 'center', padding: '0.75rem', width: '80px' }}>Qty</th>
                                        <th style={{ textAlign: 'center', padding: '0.75rem', width: '100px' }}>Unit Price</th>
                                        <th style={{ textAlign: 'right', padding: '0.75rem', width: '80px' }}>Total</th>
                                        <th style={{ width: '40px' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cart.map(item => (
                                        <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '0.75rem' }}>
                                                <div style={{ fontWeight: 500 }}>{item.name}</div>
                                                <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>Stock: {item.maxStock}</div>
                                            </td>
                                            <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={e => updateCartItem(item.id, 'quantity', parseFloat(e.target.value))}
                                                    className="input"
                                                    style={{ padding: '4px', textAlign: 'center' }}
                                                    min="1"
                                                />
                                            </td>
                                            <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                                <input
                                                    type="number"
                                                    value={item.price}
                                                    onChange={e => updateCartItem(item.id, 'price', parseFloat(e.target.value))}
                                                    className="input"
                                                    style={{ padding: '4px', textAlign: 'center' }}
                                                    min="0"
                                                />
                                            </td>
                                            <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600 }}>
                                                ${(item.price * item.quantity).toFixed(2)}
                                            </td>
                                            <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    style={{ color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                                                >
                                                    ×
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div style={{ padding: '3rem', textAlign: 'center', opacity: 0.3 }}>
                                Cart is empty
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Checkout Details & History */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Checkout Card */}
                    <div className="card" style={{ padding: '1.5rem', background: 'var(--surface-light)', border: '1px solid var(--primary-dark)' }}>
                        <h3 style={{ marginTop: 0 }}>Summary</h3>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', opacity: 0.8 }}>Note <span style={{ opacity: 0.5 }}>(Optional)</span></label>
                            <textarea
                                className="input"
                                value={note}
                                onChange={e => setNote(e.target.value)}
                                rows={2}
                                placeholder="Customer name, etc."
                            />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', opacity: 0.8 }}>Invoice <span style={{ opacity: 0.5 }}>(Optional)</span></label>
                            <input type="file" onChange={handleFileUpload} style={{ fontSize: '0.8rem' }} />
                            {uploading && <div style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>Uploading...</div>}
                            {invoiceUrl && <div style={{ fontSize: '0.8rem', color: 'var(--success)' }}>✓ Attached</div>}
                        </div>

                        <div style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                            <span>Total</span>
                            <span>${totalAmount.toFixed(2)}</span>
                        </div>

                        <button
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '1rem', justifyContent: 'center', fontSize: '1rem' }}
                            onClick={handleSubmit}
                            disabled={cart.length === 0 || submitting}
                        >
                            {submitting ? 'Processing...' : 'Complete Sale'}
                        </button>
                    </div>

                    {/* Recent Sales History */}
                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Recent Activity</h3>
                        </div>
                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            {sales.map(sale => (
                                <div key={sale.id} style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
                                    <div>
                                        <div style={{ fontWeight: 500 }}>{sale.item_name}</div>
                                        <div style={{ opacity: 0.5, fontSize: '0.75rem' }}>{new Date(sale.sold_at).toLocaleDateString()}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: 600 }}>${sale.total_price}</div>
                                        <div style={{ opacity: 0.5 }}>{sale.quantity} qty</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

            </div>
        </div>
    )
}
