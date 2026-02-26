'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { createPurchase } from '../../actions'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslation } from '@/hooks/useTranslation'
import SearchableSelect from '@/components/SearchableSelect'

export default function NewPurchasePage() {
    const { t } = useTranslation()
    const router = useRouter()
    const [suppliers, setSuppliers] = useState<any[]>([])
    const [inventoryItems, setInventoryItems] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Form State
    const [supplierId, setSupplierId] = useState('')
    const [expectedDate, setExpectedDate] = useState('')
    // Tax State
    const [ivaEnabled, setIvaEnabled] = useState(true)
    const [otherTaxes, setOtherTaxes] = useState<{ id: string, name: string, rate: number }[]>([])
    const [showAddTax, setShowAddTax] = useState(false)
    const [newTax, setNewTax] = useState({ name: 'IEPS', rate: 8 })

    const [paymentStatus, setPaymentStatus] = useState('pending')
    const [notes, setNotes] = useState('')

    const [cart, setCart] = useState<{ itemId: string; name: string; quantity: number; cost: number }[]>([])
    const [submitting, setSubmitting] = useState(false)

    // Item Selection State
    const [selectedItem, setSelectedItem] = useState('')
    const [quantity, setQuantity] = useState(1)
    const [cost, setCost] = useState(0)

    // Recommendations State
    const [recommendations, setRecommendations] = useState<any[]>([])

    useEffect(() => {
        if (supplierId) {
            const fetchCatalog = async () => {
                const supabase = createClient()
                const { data } = await supabase
                    .from('supplier_products')
                    .select('*')
                    .eq('supplier_id', supplierId)

                if (data) setRecommendations(data)
            }
            fetchCatalog()
        } else {
            setRecommendations([])
        }
    }, [supplierId])

    const handleRecommendationClick = (rec: any) => {
        // Find matching inventory item by name
        const match = inventoryItems.find(i => i.name.toLowerCase() === rec.name.toLowerCase())

        if (match) {
            setSelectedItem(match.id)
            setCost(rec.cost || 0)
            setQuantity(1)
            // Optional: Scroll to add form or highlight it
            const formElement = document.getElementById('add-item-form')
            if (formElement) formElement.scrollIntoView({ behavior: 'smooth' })
        } else {
            if (confirm(t.purchases.itemNotFoundConfirm.replace('{name}', rec.name))) {
                // Logic to redirect to create item or open modal? 
                // For now just alert or redirect
                router.push(`/inventory/add?name=${encodeURIComponent(rec.name)}&image=${encodeURIComponent(rec.image_url || '')}`)
            }
        }
    }

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

    const addTax = () => {
        if (!newTax.name || newTax.rate <= 0) return
        setOtherTaxes([...otherTaxes, { id: Math.random().toString(), name: newTax.name, rate: newTax.rate }])
        setShowAddTax(false)
        setNewTax({ name: 'IEPS', rate: 8 })
    }

    const removeTax = (id: string) => {
        setOtherTaxes(otherTaxes.filter(t => t.id !== id))
    }

    const subtotal = cart.reduce((sum, item) => sum + (item.quantity * item.cost), 0)

    // Tax Calcs
    const ivaRate = 0.16
    const ivaAmount = ivaEnabled ? subtotal * ivaRate : 0
    const otherTaxesAmount = otherTaxes.reduce((sum, t) => sum + (subtotal * (t.rate / 100)), 0)
    const totalTaxAmount = ivaAmount + otherTaxesAmount

    const totalAmount = subtotal + totalTaxAmount

    const handleSubmit = async () => {
        if (!supplierId) return alert(t.purchases.selectSupplierAlert)
        if (cart.length === 0) return alert(t.purchases.emptyOrderAlert)

        setSubmitting(true)
        setSubmitting(true)

        // Compile Taxes
        const activeTaxes = []
        if (ivaEnabled) activeTaxes.push({ name: 'IVA', rate: 0.16 })
        otherTaxes.forEach(t => activeTaxes.push({ name: t.name, rate: t.rate / 100 }))
        const totalTaxRate = activeTaxes.reduce((sum, t) => sum + t.rate, 0)

        const result = await createPurchase(
            supplierId,
            cart,
            totalAmount,
            expectedDate,
            undefined, // documentUrl
            totalTaxRate, // taxRate sum
            paymentStatus,
            notes,
            activeTaxes // taxes array
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
                    {t.purchases.back}
                </Link>
                <h1 style={{ fontSize: '2rem', fontWeight: 700, marginTop: '0.5rem' }}>{t.purchases.newOrderTitle}</h1>
            </div>

            <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.8 }}>{t.purchases.supplier}</label>
                        <select
                            className="input"
                            value={supplierId}
                            onChange={(e) => setSupplierId(e.target.value)}
                        >
                            <option value="">{t.purchases.selectSupplier}</option>
                            {suppliers.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                        <div style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
                            <Link href="/inventory/suppliers" style={{ color: 'var(--primary)' }}>{t.purchases.manageSuppliers}</Link>
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.8 }}>{t.purchases.expectedDate}</label>
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
                        <label style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.8 }}>Taxes</label>
                        <div style={{ marginBottom: '0.5rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', fontSize: '0.9rem', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={ivaEnabled}
                                    onChange={(e) => setIvaEnabled(e.target.checked)}
                                    style={{ marginRight: '0.5rem' }}
                                />
                                {t.purchases.iva}
                            </label>
                        </div>
                        {otherTaxes.map(t => (
                            <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', marginBottom: '0.5rem', paddingLeft: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                                <span>{t.name} ({t.rate}%)</span>
                                <button onClick={() => removeTax(t.id)} style={{ color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
                            </div>
                        ))}

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
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.8 }}>{t.purchases.paymentStatus}</label>
                        <select
                            className="input"
                            value={paymentStatus}
                            onChange={(e) => setPaymentStatus(e.target.value)}
                        >
                            <option value="pending">{t.purchases.pending}</option>
                            <option value="partial">{t.purchases.partial}</option>
                            <option value="paid">{t.purchases.paid}</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.8 }}>{t.purchases.notes}</label>
                        <textarea
                            className="input"
                            rows={1}
                            placeholder={t.purchases.notesPlaceholder}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                </div>

                {/* Recommendations Carousel */}
                {recommendations.length > 0 && (
                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', opacity: 0.7 }}>{t.purchases.recommended}</label>
                        <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem' }} className="scrollbar-hide">
                            {recommendations.map(rec => (
                                <div
                                    key={rec.id}
                                    onClick={() => handleRecommendationClick(rec)}
                                    className="hover-scale"
                                    style={{
                                        minWidth: '160px',
                                        padding: '1rem',
                                        background: 'rgba(255,255,255,0.03)',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <div style={{ height: '80px', background: 'rgba(0,0,0,0.2)', borderRadius: '4px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {rec.image_url ? (
                                            <img src={rec.image_url} alt={rec.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <span style={{ fontSize: '1.5rem', opacity: 0.3 }}>📦</span>
                                        )}
                                    </div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rec.name}</div>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>${rec.cost?.toFixed(2) ?? '0.00'}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Add Item Form */}
                <div id="add-item-form" style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>

                    <h3 style={{ marginTop: 0, fontSize: '1.1rem' }}>{t.purchases.addItems}</h3>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'end' }}>
                        <div style={{ flex: 2 }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', opacity: 0.8 }}>{t.purchases.product}</label>
                            <SearchableSelect
                                options={inventoryItems}
                                value={selectedItem}
                                onChange={(id) => setSelectedItem(id)}
                                placeholder={t.purchases.selectProduct}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', opacity: 0.8 }}>{t.purchases.quantity}</label>
                            <input
                                type="number"
                                className="input"
                                min="1"
                                value={quantity}
                                onChange={(e) => setQuantity(Number(e.target.value))}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', opacity: 0.8 }}>{t.purchases.costUnit}</label>
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
                            {t.purchases.add}
                        </button>
                    </div>
                </div>

                {/* Cart Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                            <th style={{ padding: '0.75rem', opacity: 0.6 }}>{t.purchases.product}</th>
                            <th style={{ padding: '0.75rem', opacity: 0.6, textAlign: 'right' }}>{t.purchases.quantity}</th>
                            <th style={{ padding: '0.75rem', opacity: 0.6, textAlign: 'right' }}>{t.purchases.amount}</th>
                            <th style={{ padding: '0.75rem', opacity: 0.6, textAlign: 'right' }}>{t.purchases.total}</th>
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
                                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', opacity: 0.5 }}>{t.purchases.emptyCart}</td>
                            </tr>
                        )}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan={3} style={{ padding: '0.5rem 1rem', textAlign: 'right', opacity: 0.7 }}>{t.purchases.subtotal}:</td>
                            <td style={{ padding: '0.5rem 1rem', textAlign: 'right' }}>${subtotal.toFixed(2)}</td>
                            <td></td>
                        </tr>
                        {ivaEnabled && (
                            <tr>
                                <td colSpan={3} style={{ padding: '0.5rem 1rem', textAlign: 'right', opacity: 0.7 }}>{t.purchases.iva}:</td>
                                <td style={{ padding: '0.5rem 1rem', textAlign: 'right' }}>${ivaAmount.toFixed(2)}</td>
                                <td></td>
                            </tr>
                        )}
                        {otherTaxes.map(t => (
                            <tr key={t.id}>
                                <td colSpan={3} style={{ padding: '0.5rem 1rem', textAlign: 'right', opacity: 0.7 }}>{t.name} ({t.rate}%):</td>
                                <td style={{ padding: '0.5rem 1rem', textAlign: 'right' }}>${(subtotal * (t.rate / 100)).toFixed(2)}</td>
                                <td></td>
                            </tr>
                        ))}
                        <tr>
                            <td colSpan={3} style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>{t.purchases.total}:</td>
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
                        {submitting ? t.purchases.creating : t.purchases.createOrder}
                    </button>
                </div>

            </div>
        </div>
    )
}
