'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import ProductDetailsModal from './ProductDetailsModal'
import { useTranslation } from '@/hooks/useTranslation'
import { usePreferences } from '@/context/PreferencesContext'

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

// ─── Shared token styles ─────────────────────────────────────
const productCard: React.CSSProperties = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '14px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.15s, box-shadow 0.15s, border-color 0.15s',
}

function StockBadge({ qty, unit, lowStockWarning = true }: { qty: number; unit: string; lowStockWarning?: boolean }) {
    const low = lowStockWarning && qty < 10
    return (
        <span style={{
            fontWeight: 700, fontSize: '0.78rem',
            padding: '0.2rem 0.6rem', borderRadius: '999px',
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
    const { lowStockWarning } = usePreferences()
    const [items] = useState<InventoryItem[]>(initialItems)
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
    const [search, setSearch] = useState('')
    const [activeCategory, setActiveCategory] = useState<string | null>(null)
    const [collapsedCategories, setCollapsedCategories] = useState<{ [k: string]: boolean }>({})

    const toggleCategory = (cat: string) =>
        setCollapsedCategories(prev => ({ ...prev, [cat]: !prev[cat] }))

    // Unique categories for filter chips
    const allCategories = Array.from(
        new Set(items.map(i => i.category || 'Sin categoría'))
    ).sort()

    // Filter items
    const filtered = items.filter(i => {
        const matchSearch = i.name.toLowerCase().includes(search.toLowerCase()) ||
            (i.sku ?? '').toLowerCase().includes(search.toLowerCase())
        const matchCat = activeCategory ? (i.category || 'Sin categoría') === activeCategory : true
        return matchSearch && matchCat
    })

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Modal */}
            {selectedItem && (
                <ProductDetailsModal item={selectedItem} onClose={() => setSelectedItem(null)} />
            )}

            {/* ── Search + Filter bar ───────────────────────────────── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>

                {/* Styled search input */}
                <div style={{ position: 'relative', maxWidth: 420 }}>
                    <span style={{
                        position: 'absolute', left: '0.875rem', top: '50%',
                        transform: 'translateY(-50%)',
                        fontSize: '1rem', opacity: 0.4, pointerEvents: 'none',
                        lineHeight: 1,
                    }}>🔍</span>
                    <input
                        type="text"
                        placeholder={t.inventory.searchPlaceholder}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.7rem 1rem 0.7rem 2.5rem',
                            borderRadius: '999px',
                            border: '1.5px solid var(--border)',
                            background: 'var(--surface)',
                            color: 'var(--foreground)',
                            fontSize: '0.9rem',
                            outline: 'none',
                            transition: 'border-color 0.15s, box-shadow 0.15s',
                            boxSizing: 'border-box',
                        }}
                        onFocus={e => {
                            e.target.style.borderColor = 'var(--primary)'
                            e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)'
                        }}
                        onBlur={e => {
                            e.target.style.borderColor = 'var(--border)'
                            e.target.style.boxShadow = 'none'
                        }}
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            style={{
                                position: 'absolute', right: '0.875rem', top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'none', border: 'none', cursor: 'pointer',
                                color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1,
                            }}
                        >×</button>
                    )}
                </div>

                {/* Category filter chips */}
                {allCategories.length > 1 && (
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginRight: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {t.inventory.filterLabel}
                        </span>
                        {/* All chip */}
                        <button
                            onClick={() => setActiveCategory(null)}
                            style={{
                                padding: '0.3rem 0.875rem',
                                borderRadius: '999px',
                                border: `1.5px solid ${activeCategory === null ? 'var(--primary)' : 'var(--border)'}`,
                                background: activeCategory === null ? 'rgba(99,102,241,0.12)' : 'transparent',
                                color: activeCategory === null ? 'var(--primary)' : 'var(--text-muted)',
                                fontSize: '0.82rem', fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.15s',
                            }}
                        >
                            {t.inventory.allCategories}
                        </button>
                        {allCategories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                                style={{
                                    padding: '0.3rem 0.875rem',
                                    borderRadius: '999px',
                                    border: `1.5px solid ${activeCategory === cat ? 'var(--primary)' : 'var(--border)'}`,
                                    background: activeCategory === cat ? 'rgba(99,102,241,0.12)' : 'transparent',
                                    color: activeCategory === cat ? 'var(--primary)' : 'var(--text-muted)',
                                    fontSize: '0.82rem', fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.15s',
                                }}
                            >
                                {cat}
                                <span style={{ marginLeft: '0.375rem', opacity: 0.6, fontSize: '0.74rem' }}>
                                    {items.filter(i => (i.category || t.inventory.uncategorized) === cat).length}
                                </span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Empty state ───────────────────────────────────────── */}
            {filtered.length === 0 && (
                <div style={{ textAlign: 'center', padding: '5rem 2rem', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
                    <p style={{ fontWeight: 600 }}>{search || activeCategory ? t.inventory.noResults : t.inventory.noItems}</p>
                    {(search || activeCategory) && (
                        <button
                            onClick={() => { setSearch(''); setActiveCategory(null) }}
                            style={{
                                marginTop: '0.75rem', padding: '0.5rem 1.25rem',
                                borderRadius: '999px', border: '1px solid var(--border)',
                                background: 'transparent', cursor: 'pointer',
                                color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600,
                            }}
                        >
                            {t.inventory.clearFilters}
                        </button>
                    )}
                </div>
            )}

            {/* ── Category sections ─────────────────────────────────── */}
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
                                marginBottom: '0.875rem', padding: '0.25rem 0',
                                background: 'transparent', border: 'none', cursor: 'pointer',
                                width: '100%', textAlign: 'left', color: 'inherit',
                            }}
                        >
                            <span style={{
                                transition: 'transform 0.2s',
                                transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0)',
                                fontSize: '0.75rem', opacity: 0.4,
                            }}>▼</span>
                            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
                                {category}
                            </h2>
                            <span style={{
                                fontSize: '0.72rem', fontWeight: 600, padding: '0.18rem 0.55rem',
                                borderRadius: '999px', background: 'var(--surface)',
                                border: '1px solid var(--border)', color: 'var(--text-muted)',
                            }}>
                                {catItems.length}
                            </span>
                        </button>

                        {/* Card grid */}
                        {!isCollapsed && (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(185px, 1fr))',
                                gap: '1rem',
                            }}>
                                {catItems.map(item => (
                                    <div
                                        key={item.id}
                                        style={productCard}
                                        onMouseEnter={e => {
                                            const el = e.currentTarget
                                            el.style.transform = 'translateY(-2px)'
                                            el.style.boxShadow = '0 8px 24px rgba(0,0,0,0.18)'
                                            el.style.borderColor = 'rgba(99,102,241,0.4)'
                                        }}
                                        onMouseLeave={e => {
                                            const el = e.currentTarget
                                            el.style.transform = ''
                                            el.style.boxShadow = ''
                                            el.style.borderColor = 'var(--border)'
                                        }}
                                    >
                                        {/* Image */}
                                        <div
                                            onClick={() => setSelectedItem(item)}
                                            style={{
                                                width: '100%', aspectRatio: '1',
                                                background: 'rgba(255,255,255,0.03)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                overflow: 'hidden', position: 'relative', cursor: 'pointer',
                                            }}
                                        >
                                            {item.image_url ? (
                                                <img src={item.image_url} alt={item.name}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <span style={{ fontSize: '3rem', opacity: 0.15 }}>📦</span>
                                            )}
                                            {lowStockWarning && item.quantity < 10 && (
                                                <div style={{
                                                    position: 'absolute', top: 8, right: 8,
                                                    background: 'rgba(239,68,68,0.9)', color: '#fff',
                                                    fontSize: '0.63rem', fontWeight: 700,
                                                    padding: '0.18rem 0.45rem', borderRadius: '999px',
                                                }}>
                                                    {t.inventory.lowStock}
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div style={{ padding: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
                                            <div style={{ fontWeight: 700, fontSize: '0.9rem', lineHeight: 1.3 }}>
                                                {item.name}
                                            </div>
                                            {item.subcategories?.name && (
                                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                                                    {item.subcategories.name}
                                                </div>
                                            )}
                                            <div style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.95rem' }}>
                                                {item.price > 0 ? formatPrice(item.price) : (
                                                    <span style={{ opacity: 0.35, fontSize: '0.82rem', fontWeight: 500 }}>Sin precio</span>
                                                )}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem', marginTop: 'auto', paddingTop: '0.25rem' }}>
                                                <StockBadge
                                                    qty={item.quantity}
                                                    unit={item.unit_type === 'kg' ? t.inventory.kg : (item.quantity === 1 ? t.inventory.unit : (t.inventory as any).units || t.inventory.unit + 's')}
                                                    lowStockWarning={lowStockWarning}
                                                />
                                                <div style={{ display: 'flex', gap: '0.3rem' }}>
                                                    <button
                                                        onClick={() => setSelectedItem(item)}
                                                        title="Ver detalles"
                                                        style={{
                                                            padding: '0.28rem 0.6rem', borderRadius: '6px',
                                                            border: '1px solid var(--border)', background: 'transparent',
                                                            cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600,
                                                            color: 'var(--foreground)',
                                                        }}
                                                    >Ver</button>
                                                    <Link
                                                        href={`/inventory/edit/${item.id}`}
                                                        title="Editar"
                                                        style={{
                                                            padding: '0.28rem 0.6rem', borderRadius: '6px',
                                                            border: '1px solid var(--border)', background: 'transparent',
                                                            textDecoration: 'none', fontSize: '0.72rem', fontWeight: 600,
                                                            color: 'var(--foreground)', display: 'flex', alignItems: 'center',
                                                        }}
                                                    >✏️</Link>
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
