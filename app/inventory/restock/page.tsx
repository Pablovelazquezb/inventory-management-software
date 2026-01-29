'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { restockItem } from '../actions'
import Link from 'next/link'

export default function RestockPage() {
    const [items, setItems] = useState<any[]>([])
    const [entries, setEntries] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    // Form state
    const [selectedItemId, setSelectedItemId] = useState('')
    const [quantity, setQuantity] = useState('1')
    const [note, setNote] = useState('')
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        const supabase = createClient()

        // Fetch items for selection
        const { data: itemsData } = await supabase
            .from('inventory_items')
            .select('id, name, quantity, category, subcategories(name)')
            .order('name')

        if (itemsData) setItems(itemsData)

        // Fetch recent stock entries
        const { data: entriesData } = await supabase
            .from('stock_entries')
            .select('*, inventory_items(name)')
            .order('added_at', { ascending: false })
            .limit(20)

        if (entriesData) setEntries(entriesData)

        setLoading(false)
    }

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedItemId) return

        setSubmitting(true)
        const qty = parseInt(quantity)

        if (isNaN(qty) || qty <= 0) {
            alert('Please enter a valid quantity')
            setSubmitting(false)
            return
        }

        await restockItem(selectedItemId, qty, note)

        // Reset form and refresh data
        setQuantity('1')
        setNote('')
        setSearchTerm('')
        // setSelectedItemId('') // Keep selected in case they want to add more? Maybe better to reset.
        await fetchData()
        setSubmitting(false)
    }

    const selectedItem = items.find(i => i.id === selectedItemId)

    return (
        <div style={{ paddingBottom: '4rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <Link href="/inventory" style={{ fontSize: '0.875rem', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    ← Back to Inventory
                </Link>
                <h2 style={{ fontSize: '2rem', fontWeight: 700 }}>Add Stock</h2>
                <p style={{ color: 'rgba(255,255,255,0.5)' }}>Restock existing items and track inventory changes.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }}>

                {/* Form Section */}
                <div className="card" style={{ padding: '2rem' }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                        {/* Item Selection */}
                        <div>
                            <label className="text-md" style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.8 }}>Select Item</label>

                            {!selectedItemId ? (
                                <div>
                                    <input
                                        className="input"
                                        placeholder="Search items..."
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        style={{ marginBottom: '0.5rem' }}
                                    />
                                    <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '8px' }}>
                                        {filteredItems.length > 0 ? filteredItems.map(item => (
                                            <div
                                                key={item.id}
                                                onClick={() => { setSelectedItemId(item.id); setSearchTerm(''); }}
                                                style={{
                                                    padding: '0.75rem',
                                                    cursor: 'pointer',
                                                    borderBottom: '1px solid var(--border)',
                                                    background: 'rgba(255,255,255,0.02)',
                                                    display: 'flex',
                                                    justifyContent: 'space-between'
                                                }}
                                                className="hover-bg"
                                            >
                                                <span>{item.name}</span>
                                                <span style={{ opacity: 0.5, fontSize: '0.875rem' }}>
                                                    {item.quantity} in stock
                                                </span>
                                            </div>
                                        )) : (
                                            <div style={{ padding: '1rem', textAlign: 'center', opacity: 0.5 }}>No items found</div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div style={{
                                    padding: '1rem',
                                    background: 'rgba(255,255,255,0.05)',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    border: '1px solid var(--primary)'
                                }}>
                                    <div>
                                        <div style={{ fontWeight: 600 }}>{selectedItem?.name}</div>
                                        <div style={{ fontSize: '0.875rem', opacity: 0.6 }}>Current Stock: {selectedItem?.quantity}</div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedItemId('')}
                                        className="btn"
                                        style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                                    >
                                        Change
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Quantity */}
                        <div>
                            <label className="text-md" style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.8 }}>Quantity to Add</label>
                            <input
                                className="input"
                                type="number"
                                value={quantity}
                                onChange={e => setQuantity(e.target.value)}
                                min="1"
                                required
                            />
                        </div>

                        {/* Note */}
                        <div>
                            <label className="text-md" style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.8 }}>Note <span style={{ opacity: 0.5 }}>(Optional)</span></label>
                            <textarea
                                className="input"
                                value={note}
                                onChange={e => setNote(e.target.value)}
                                placeholder="e.g. Received from Supplier X"
                                rows={3}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={submitting || !selectedItemId}
                            style={{ marginTop: '1rem', padding: '1rem', justifyContent: 'center' }}
                        >
                            {submitting ? 'Adding Stock...' : 'Confirm Restock'}
                        </button>
                    </form>
                </div>

                {/* History Section */}
                <div className="card" style={{ padding: 0, overflow: 'hidden', height: 'fit-content' }}>
                    <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Recent Activity</h3>
                    </div>
                    <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                        {entries.length > 0 ? (
                            <table style={{ width: '100%', fontSize: '0.875rem', borderCollapse: 'collapse' }}>
                                <tbody>
                                    {entries.map(entry => (
                                        <tr key={entry.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ fontWeight: 500 }}>{entry.inventory_items?.name || 'Unknown Item'}</div>
                                                {entry.note && (
                                                    <div style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '2px', fontStyle: 'italic' }}>
                                                        "{entry.note}"
                                                    </div>
                                                )}
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                <div style={{ color: 'var(--success)', fontWeight: 600 }}>+{entry.quantity_added}</div>
                                                <div style={{ fontSize: '0.75rem', opacity: 0.4 }}>
                                                    {new Date(entry.added_at).toLocaleDateString()}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.5 }}>No recent entries</div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    )
}
