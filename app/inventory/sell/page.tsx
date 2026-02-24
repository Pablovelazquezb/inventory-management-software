'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { sellBatchItems } from '../actions'
import Link from 'next/link'
import { useTranslation } from '@/hooks/useTranslation'
import { useRouter } from 'next/navigation'

interface CartItem {
    id: string
    name: string
    quantity: number
    price: number
    maxStock: number
}

interface Customer {
    id: string
    name: string
    rfc: string
}

export default function SellPage() {
    const { t } = useTranslation()
    const router = useRouter()

    // Data State
    const [items, setItems] = useState<any[]>([])
    const [categories, setCategories] = useState<string[]>([])
    const [customers, setCustomers] = useState<Customer[]>([])
    const [loading, setLoading] = useState(true)

    // UI State
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')

    // Transaction State
    const [cart, setCart] = useState<CartItem[]>([])
    const [selectedCustomer, setSelectedCustomer] = useState<string>('')
    const [note, setNote] = useState('')
    // const [ivaEnabled, setIvaEnabled] = useState(true) // Handled in replace block
    // const [otherTaxes, setOtherTaxes] = useState<{ id: string, name: string, rate: number }[]>([]) // Handled in replace block
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        const supabase = createClient()

        const [itemsRes, suppliersRes, customersRes] = await Promise.all([
            supabase.from('inventory_items').select('id, name, quantity, price, category, sku, image_url').order('name'),
            supabase.from('categories').select('name'), // Assuming categories table exists, or extracting from items
            supabase.from('customers').select('id, name, rfc').order('name')
        ])

        if (itemsRes.data) {
            setItems(itemsRes.data)
            // Extract unique categories from items if categories table is empty or just to be safe
            const cats = Array.from(new Set(itemsRes.data.map(i => i.category || 'Uncategorized'))).sort()
            setCategories(cats)
        }

        if (customersRes.data) setCustomers(customersRes.data)

        setLoading(false)
    }

    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase()))
        const matchesCategory = selectedCategory ? item.category === selectedCategory : true
        return matchesSearch && matchesCategory
    })

    const addToCart = (item: any) => {
        if (item.quantity <= 0) return alert('Out of stock')

        const existing = cart.find(c => c.id === item.id)
        if (existing) {
            if (existing.quantity >= item.quantity) return alert('Max stock reached in cart')
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
    }

    const updateCartItem = (id: string, field: 'quantity' | 'price', value: number) => {
        setCart(cart.map(item => {
            if (item.id !== id) return item
            if (field === 'quantity') {
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

    // State for Taxes
    const [ivaEnabled, setIvaEnabled] = useState(true)
    const [otherTaxes, setOtherTaxes] = useState<{ id: string, name: string, rate: number }[]>([])
    const [showAddTax, setShowAddTax] = useState(false)
    const [newTax, setNewTax] = useState({ name: 'IEPS', rate: 8 })

    // Totals Calculation
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)

    const ivaRate = 0.16
    const ivaAmount = ivaEnabled ? subtotal * ivaRate : 0

    // Calculate other taxes
    const otherTaxesAmount = otherTaxes.reduce((sum, t) => sum + (subtotal * (t.rate / 100)), 0)

    const total = subtotal + ivaAmount + otherTaxesAmount

    const addTax = () => {
        if (!newTax.name || newTax.rate <= 0) return
        setOtherTaxes([...otherTaxes, { id: Math.random().toString(), name: newTax.name, rate: newTax.rate }])
        setShowAddTax(false)
        setNewTax({ name: 'IEPS', rate: 8 })
    }

    const removeTax = (id: string) => {
        setOtherTaxes(otherTaxes.filter(t => t.id !== id))
    }

    const handleSubmit = async () => {
        if (cart.length === 0) return

        setSubmitting(true)

        // Compile Taxes
        const activeTaxes = []
        if (ivaEnabled) activeTaxes.push({ name: 'IVA', rate: 0.16 })
        otherTaxes.forEach(t => activeTaxes.push({ name: t.name, rate: t.rate / 100 }))

        const result = await sellBatchItems(
            cart,
            note, // Note
            undefined, // invoice_url
            selectedCustomer, // customerId
            activeTaxes // taxes
        )

        if (result?.error) {
            alert(result.error)
        } else {
            setCart([])
            setNote('')
            setSelectedCategory(null)
            setOtherTaxes([]) // Reset taxes
            // Keep IVA enabled by default
            await fetchData()
            alert('Sale completed successfully!')
        }
        setSubmitting(false)
    }

    return (
        <div style={{ height: 'calc(100vh - 100px)', display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', overflow: 'hidden' }}>

            {/* LEFT: Product Selection */}
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

                {/* Header / Breadcrumbs */}
                <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        {selectedCategory ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem', fontWeight: 600 }}>
                                <button onClick={() => setSelectedCategory(null)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}>
                                    ← Categories
                                </button>
                                <span style={{ opacity: 0.5 }}>/</span>
                                <span>{selectedCategory}</span>
                            </div>
                        ) : (
                            <h2 style={{ margin: 0 }}>Select Category</h2>
                        )}
                    </div>

                    {/* Search */}
                    <input
                        className="input"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        style={{ maxWidth: '300px' }}
                    />
                </div>

                {/* Grid Content */}
                <div className="scrollbar-hide" style={{ flex: 1, overflowY: 'auto', paddingBottom: '2rem' }}>

                    {!selectedCategory && !searchTerm ? (
                        // CATEGORY GRID
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
                            {categories.map(cat => (
                                <div
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className="card hover-scale"
                                    style={{
                                        padding: '2rem',
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        background: 'var(--surface-light)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        minHeight: '150px'
                                    }}
                                >
                                    <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{cat}</h3>
                                </div>
                            ))}
                        </div>
                    ) : (
                        // PRODUCT GRID
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
                            {filteredItems.map(item => (
                                <div
                                    key={item.id}
                                    onClick={() => addToCart(item)}
                                    className="card hover-scale"
                                    style={{
                                        padding: '1rem',
                                        cursor: 'pointer',
                                        background: 'rgba(255,255,255,0.03)',
                                        border: item.quantity <= 0 ? '1px solid var(--error)' : '1px solid var(--border)',
                                        opacity: item.quantity <= 0 ? 0.6 : 1
                                    }}
                                >
                                    <div style={{ aspectRatio: '1/1', background: 'rgba(0,0,0,0.2)', marginBottom: '0.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {item.image_url ? (
                                            <img src={item.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                                        ) : (
                                            <span style={{ fontSize: '2rem' }}>📦</span>
                                        )}
                                    </div>
                                    <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ color: 'var(--primary)', fontWeight: 700 }}>${item.price}</div>
                                        <div style={{ fontSize: '0.8rem', color: item.quantity > 0 ? 'var(--success)' : 'var(--error)' }}>
                                            {item.quantity} left
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {filteredItems.length === 0 && (
                                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', opacity: 0.5 }}>
                                    No items found.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT: Cart & Checkout */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '0', overflow: 'hidden', borderLeft: '1px solid var(--border)' }}>
                <div style={{ padding: '1rem', background: 'var(--surface-highlight)', borderBottom: '1px solid var(--border)' }}>
                    <h3 style={{ margin: 0 }}>Current Sale ({cart.reduce((a, b) => a + b.quantity, 0)})</h3>
                </div>

                {/* Cart Items */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                    {cart.map(item => (
                        <div key={item.id} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600 }}>{item.name}</div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>${item.price} x {item.quantity}</div>
                            </div>
                            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.2rem' }}>
                                <div style={{ fontWeight: 700 }}>${(item.price * item.quantity).toFixed(2)}</div>
                                <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
                                    <button
                                        onClick={() => updateCartItem(item.id, 'quantity', item.quantity - 1)}
                                        style={{ width: '26px', height: '26px', borderRadius: '6px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--foreground)', cursor: 'pointer', fontWeight: 700, flexShrink: 0 }}
                                    >−</button>
                                    <input
                                        type="number"
                                        min={1}
                                        max={item.maxStock}
                                        value={item.quantity}
                                        onChange={e => {
                                            const val = parseInt(e.target.value)
                                            if (!isNaN(val) && val >= 1) updateCartItem(item.id, 'quantity', val)
                                        }}
                                        style={{
                                            width: '52px', height: '26px',
                                            textAlign: 'center', borderRadius: '6px',
                                            border: '1px solid var(--border)',
                                            background: 'var(--background)',
                                            color: 'var(--foreground)',
                                            fontSize: '0.875rem', fontWeight: 600,
                                            padding: '0 0.25rem',
                                        }}
                                    />
                                    <button
                                        onClick={() => updateCartItem(item.id, 'quantity', item.quantity + 1)}
                                        style={{ width: '26px', height: '26px', borderRadius: '6px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--foreground)', cursor: 'pointer', fontWeight: 700, flexShrink: 0 }}
                                    >+</button>
                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        style={{ color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer', marginLeft: '0.25rem', fontSize: '1rem' }}
                                    >×</button>
                                </div>                   </div>
                        </div>
                    ))}
                    {cart.length === 0 && (
                        <div style={{ textAlign: 'center', opacity: 0.5, marginTop: '2rem' }}>Cart is empty</div>
                    )}
                </div>

                {/* Checkout Controls */}
                <div style={{ padding: '1.5rem', background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>

                    {/* Customer Select */}
                    <div style={{ marginBottom: '1rem' }}>
                        <select
                            className="input"
                            value={selectedCustomer}
                            onChange={e => setSelectedCustomer(e.target.value)}
                            style={{ fontSize: '0.9rem', padding: '0.5rem' }}
                        >
                            <option value="">Select Customer (Optional)</option>
                            {customers.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Tax Controls */}
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', fontSize: '0.9rem', marginBottom: '0.5rem', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={ivaEnabled}
                                onChange={e => setIvaEnabled(e.target.checked)}
                                style={{ marginRight: '0.5rem' }}
                            />
                            IVA (16%)
                        </label>

                        {/* Additional Taxes List */}
                        {otherTaxes.map(t => (
                            <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', marginBottom: '0.5rem', paddingLeft: '1.5rem' }}>
                                <span>{t.name} ({t.rate}%)</span>
                                <button onClick={() => removeTax(t.id)} style={{ color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
                            </div>
                        ))}

                        {/* Add Tax Button/Form */}
                        {showAddTax ? (
                            <div style={{ background: 'var(--surface-light)', padding: '0.5rem', borderRadius: '4px', marginTop: '0.5rem' }}>
                                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <select
                                        className="input"
                                        style={{ padding: '0.2rem', fontSize: '0.8rem' }}
                                        value={newTax.name}
                                        onChange={e => setNewTax({ ...newTax, name: e.target.value })}
                                    >
                                        <option value="IEPS">IEPS</option>
                                        <option value="ISR">ISR</option>
                                        <option value="RETENTION">Retention</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                    <input
                                        type="number"
                                        className="input"
                                        placeholder="%"
                                        style={{ width: '50px', padding: '0.2rem', fontSize: '0.8rem' }}
                                        value={newTax.rate}
                                        onChange={e => setNewTax({ ...newTax, rate: parseFloat(e.target.value) })}
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button onClick={addTax} className="btn-primary" style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem' }}>Add</button>
                                    <button onClick={() => setShowAddTax(false)} className="btn" style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', background: 'transparent', border: '1px solid var(--border)' }}>Cancel</button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowAddTax(true)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--primary)',
                                    fontSize: '0.8rem',
                                    cursor: 'pointer',
                                    paddingLeft: '1.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.2rem'
                                }}
                            >
                                + Add Other Tax
                            </button>
                        )}
                    </div>

                    {/* Totals */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', opacity: 0.8 }}>
                        <span>Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                    </div>
                    {ivaEnabled && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', opacity: 0.8 }}>
                            <span>IVA (16%)</span>
                            <span>${ivaAmount.toFixed(2)}</span>
                        </div>
                    )}
                    {otherTaxes.map(t => (
                        <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', opacity: 0.8 }}>
                            <span>{t.name} ({t.rate}%)</span>
                            <span>${(subtotal * (t.rate / 100)).toFixed(2)}</span>
                        </div>
                    ))}

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 700, paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                    </div>

                    <button
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '1rem', justifyContent: 'center' }}
                        disabled={cart.length === 0 || submitting}
                        onClick={handleSubmit}
                    >
                        {submitting ? 'Processing...' : 'Complete Sale'}
                    </button>
                </div>
            </div>
        </div>
    )
}
