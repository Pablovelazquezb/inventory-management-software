'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import ProductDetailsModal from './ProductDetailsModal'
import { useTranslation } from '@/hooks/useTranslation'
import { splitItem } from './actions'

interface InventoryItem {
    id: string
    name: string
    category: string | null
    subcategory_id: string | null
    quantity: number
    weight: number | null
    price: number
    unit_type: string
    sku?: string | null
    subcategories?: { name: string } | null
    image_url?: string | null
}

// ─── Styles ──────────────────────────────────────────────────
const productCard: React.CSSProperties = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '14px',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'transform 0.15s, box-shadow 0.15s, border-color 0.15s',
    display: 'flex',
    flexDirection: 'column',
}

function StockBadge({ qty, unit }: { qty: number; unit: string }) {
    const low = qty < 10
    return (
        <span style={{
            fontWeight: 700,
            fontSize: '0.8rem',
            padding: '0.2rem 0.6rem',
            borderRadius: '999px',
            background: low ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.12)',
            color: low ? 'var(--error)' : '#22c55e',
            border: `1px solid ${low ? 'rgba(239,68,68,0.25)' : 'rgba(34,197,94,0.25)'}`,
        }}>
            {qty} {unit}
        </span>
    )
}

export default function InventoryList({ initialItems }: { initialItems: InventoryItem[] }) {
    const { t } = useTranslation()
    const [items, setItems] = useState<InventoryItem[]>(initialItems)
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
    const [search, setSearch] = useState('')
    const [collapsedCategories, setCollapsedCategories] = useState<{ [k: string]: boolean }>({})

    const toggleCategory = (cat: string) =>
        setCollapsedCategories(prev => ({ ...prev, [cat]: !prev[cat] }))

    // Filter by search
    const filtered = items.filter(i =>
        i.name.toLowerCase().includes(search.toLowerCase()) ||
        (i.category ?? '').toLowerCase().includes(search.toLowerCase())
    )

    // Group by category
    const categoryGroups = filtered.reduce((acc, item) => {
        const cat = item.category || 'Sin categoría'
        if (!acc[cat]) acc[cat] = []
        acc[cat].push(item)
        return acc
    }, {} as { [cat: string]: InventoryItem[] })

    const formatPrice = (p: number) =>
        new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(p)

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* Modal */}
            {selectedItem && (
                <ProductDetailsModal item={selectedItem} onClose={() => setSelectedItem(null)} />
            )}

            {/* Search bar */}
            <input
                type="text"
                placeholder="🔍  Buscar artículos..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="form-input"
                style={{ maxWidth: 380, width: '100%' }}
            />

            {/* Empty state */}
            {filtered.length === 0 && (
                <div style={{ textAlign: 'center', padding: '5rem 2rem', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
                    <p style={{ fontWeight: 600 }}>{search ? 'Sin resultados' : t.inventory.noItems}</p>
                </div>
            )}

            {/* Category sections */}
            {Object.keys(categoryGroups).sort().map(category => {
                const catItems = categoryGroups[category]
                const isCollapsed = collapsedCategories[category]

                return (
                    <div key={category}>
                        {/* Category header */}
                        <button
                            onClick={() => toggleCategory(category)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.875rem',
                                marginBottom: '1rem', padding: '0.375rem 0',
                                background: 'transparent', border: 'none', cursor: 'pointer',
                                width: '100%', textAlign: 'left', color: 'inherit',
                            }}
                        >
                            <span style={{
                                transition: 'transform 0.2s',
                                transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0)',
                                fontSize: '0.8rem', opacity: 0.45,
                            }}>▼</span>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
                                {category}
                            </h2>
                            <span style={{
                                fontSize: '0.72rem', fontWeight: 600,
                                padding: '0.2rem 0.6rem', borderRadius: '999px',
                                background: 'var(--surface)', border: '1px solid var(--border)',
                                color: 'var(--text-muted)',
                            }}>
                                {catItems.length} {t.inventory.itemsCount}
                            </span>
                        </button>

                        {/* Card grid */}
                        {!isCollapsed && (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                                gap: '1rem',
                            }}>
                                {catItems.map(item => (
                                    <div
                                        key={item.id}
                                        style={productCard}
                                        onMouseEnter={e => {
                                            const el = e.currentTarget
                                            el.style.transform = 'translateY(-2px)'
                                            el.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)'
                                            el.style.borderColor = 'rgba(99,102,241,0.4)'
                                        }}
                                        onMouseLeave={e => {
                                            const el = e.currentTarget
                                            el.style.transform = ''
                                            el.style.boxShadow = ''
                                            el.style.borderColor = 'var(--border)'
                                        }}
                                    >
                                        {/* Image area */}
                                        <div
                                            onClick={() => setSelectedItem(item)}
                                            style={{
                                                width: '100%', aspectRatio: '1',
                                                background: 'rgba(255,255,255,0.03)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                overflow: 'hidden', position: 'relative',
                                            }}
                                        >
                                            {item.image_url ? (
                                                <img
                                                    src={item.image_url}
                                                    alt={item.name}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <span style={{ fontSize: '3rem', opacity: 0.18 }}>📦</span>
                                            )}
                                            {/* Low stock overlay badge */}
                                            {item.quantity < 10 && (
                                                <div style={{
                                                    position: 'absolute', top: 8, right: 8,
                                                    background: 'rgba(239,68,68,0.9)',
                                                    color: '#fff', fontSize: '0.65rem', fontWeight: 700,
                                                    padding: '0.2rem 0.5rem', borderRadius: '999px',
                                                }}>
                                                    Stock bajo
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div style={{ padding: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.1rem', lineHeight: 1.3 }}>
                                                    {item.name}
                                                </div>
                                                {item.subcategories?.name && (
                                                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                                                        {item.subcategories.name}
                                                    </div>
                                                )}
                                            </div>

                                            <div style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '1rem' }}>
                                                {item.price > 0 ? formatPrice(item.price) : <span style={{ opacity: 0.4, fontSize: '0.85rem' }}>Sin precio</span>}
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginTop: 'auto' }}>
                                                <StockBadge
                                                    qty={item.quantity}
                                                    unit={item.unit_type === 'kg' ? t.inventory.kg : t.inventory.unit}
                                                />
                                                <div style={{ display: 'flex', gap: '0.375rem' }}>
                                                    <button
                                                        onClick={() => setSelectedItem(item)}
                                                        style={{
                                                            padding: '0.3rem 0.625rem', borderRadius: '6px', fontSize: '0.75rem',
                                                            border: '1px solid var(--border)', background: 'transparent',
                                                            cursor: 'pointer', fontWeight: 600, color: 'var(--foreground)',
                                                        }}
                                                        title="Ver detalles"
                                                    >
                                                        Ver
                                                    </button>
                                                    <Link
                                                        href={`/inventory/edit/${item.id}`}
                                                        style={{
                                                            padding: '0.3rem 0.625rem', borderRadius: '6px', fontSize: '0.75rem',
                                                            border: '1px solid var(--border)', background: 'transparent',
                                                            textDecoration: 'none', fontWeight: 600, color: 'var(--foreground)',
                                                            display: 'flex', alignItems: 'center',
                                                        }}
                                                        title="Editar"
                                                    >
                                                        ✏️
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
