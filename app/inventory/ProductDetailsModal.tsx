'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface ProductDetailsModalProps {
    item: any
    onClose: () => void
}

export default function ProductDetailsModal({ item, onClose }: ProductDetailsModalProps) {
    const [history, setHistory] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchHistory = async () => {
            const supabase = createClient()

            // Fetch Sales
            const { data: sales, error: salesError } = await supabase
                .from('sales')
                .select('id, quantity, total_price, created_at, note')
                .eq('item_id', item.id)
                .order('created_at', { ascending: false })
                .limit(5)

            // Fetch Stock Entries
            const { data: entries, error: entriesError } = await supabase
                .from('stock_entries')
                .select('id, quantity_added, created_at, note')
                .eq('item_id', item.id)
                .order('created_at', { ascending: false })
                .limit(5)

            if (salesError || entriesError) {
                console.error('Error fetching history', salesError, entriesError)
            }

            // Combine and sort
            const combined = [
                ...(sales || []).map((s: any) => ({ ...s, type: 'sale' })),
                ...(entries || []).map((e: any) => ({ ...e, type: 'restock' }))
            ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .slice(0, 10) // Show top 10 recent activities

            setHistory(combined)
            setLoading(false)
        }

        fetchHistory()
    }, [item.id])

    // Close on escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', handleEsc)
        return () => window.removeEventListener('keydown', handleEsc)
    }, [onClose])

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
        }} onClick={onClose}>
            <div
                className="card"
                style={{
                    width: '100%',
                    maxWidth: '600px',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    position: 'relative',
                    animation: 'slideUp 0.3s ease-out'
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'none',
                        border: 'none',
                        fontSize: '1.5rem',
                        color: 'rgba(255,255,255,0.5)',
                        cursor: 'pointer'
                    }}
                >
                    &times;
                </button>

                {/* Header */}
                <div style={{ marginBottom: '2rem', paddingRight: '2rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{
                            background: 'var(--primary)',
                            color: 'white',
                            padding: '0.2rem 0.6rem',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: 600
                        }}>
                            {item.category || 'Uncategorized'}
                        </span>
                        {item.subcategories && (
                            <span style={{
                                background: 'rgba(255,255,255,0.1)',
                                padding: '0.2rem 0.6rem',
                                borderRadius: '12px',
                                fontSize: '0.75rem'
                            }}>
                                {item.subcategories.name}
                            </span>
                        )}
                        <span style={{
                            background: item.quantity <= 5 ? 'var(--error)' : 'var(--success)',
                            padding: '0.2rem 0.6rem',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            color: 'white'
                        }}>
                            {item.quantity <= 5 ? 'Low Stock' : 'In Stock'}
                        </span>
                    </div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 700, lineHeight: 1.2 }}>{item.name}</h2>
                    <div style={{ fontSize: '0.875rem', opacity: 0.5, marginTop: '0.25rem', fontFamily: 'monospace' }}>
                        ID: {item.id}
                    </div>
                </div>

                {/* Details Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                    gap: '1rem',
                    marginBottom: '2rem',
                    background: 'rgba(255,255,255,0.03)',
                    padding: '1.5rem',
                    borderRadius: '12px'
                }}>
                    <div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.6, marginBottom: '0.25rem' }}>Price</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>${item.price}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.6, marginBottom: '0.25rem' }}>Stock</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                            {item.quantity} <span style={{ fontSize: '0.6em', opacity: 0.7 }}>{item.unit_type === 'kg' ? 'kg' : 'units'}</span>
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.6, marginBottom: '0.25rem' }}>Weight/Unit</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                            {item.weight ? `${item.weight} kg` : '-'}
                        </div>
                    </div>
                </div>

                {/* Description */}
                {item.description && (
                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', opacity: 0.9 }}>Description</h3>
                        <p style={{ opacity: 0.7, lineHeight: 1.6, fontSize: '0.9rem' }}>{item.description}</p>
                    </div>
                )}

                {/* Recent History */}
                <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', opacity: 0.9 }}>Recent Activity</h3>

                    {loading ? (
                        <div style={{ opacity: 0.5, fontSize: '0.9rem' }}>Loading activity...</div>
                    ) : history.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {history.map((h, i) => (
                                <div key={i} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '0.75rem',
                                    background: 'rgba(255,255,255,0.02)',
                                    borderRadius: '8px',
                                    borderLeft: `3px solid ${h.type === 'sale' ? 'var(--error)' : 'var(--success)'}`
                                }}>
                                    <div>
                                        <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>
                                            {h.type === 'sale' ? 'Sold' : 'Restocked'}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>
                                            {new Date(h.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: 600, color: h.type === 'sale' ? 'var(--error)' : 'var(--success)' }}>
                                            {h.type === 'sale' ? '-' : '+'}{h.type === 'sale' ? h.quantity : h.quantity_added}
                                        </div>
                                        {h.note && (
                                            <div style={{ fontSize: '0.75rem', opacity: 0.5, maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {h.note}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ opacity: 0.5, fontSize: '0.9rem', fontStyle: 'italic' }}>No recent activity found.</div>
                    )}
                </div>

                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <Link href={`/inventory/edit/${item.id}`} className="btn btn-primary">
                        Edit Item
                    </Link>
                </div>

            </div>
        </div>
    )
}
