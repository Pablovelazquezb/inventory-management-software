'use client'

import { useState } from 'react'
import { splitItem } from './actions'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import ProductDetailsModal from './ProductDetailsModal'
import { useTranslation } from '@/hooks/useTranslation'

// Helper to group items
const groupItems = (items: any[]) => {
    const groups: { [key: string]: any[] } = {}
    items.forEach(item => {
        const key = `${item.name}-${item.subcategory_id || 'null'}-${item.category || 'null'}`
        if (!groups[key]) {
            groups[key] = []
        }
        groups[key].push(item)
    })
    return groups
}

// Define interface for Inventory Item
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

export default function InventoryList({ initialItems }: { initialItems: InventoryItem[] }) {
    const { t } = useTranslation()
    const [items, setItems] = useState<InventoryItem[]>(initialItems)

    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)

    // Edit states
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editWeight, setEditWeight] = useState<string>('')
    const [splittingId, setSplittingId] = useState<string | null>(null)

    // Organize items by Category -> Array of Items
    const categoryGroups = items.reduce((acc, item) => {
        const cat = item.category || 'Uncategorized'
        if (!acc[cat]) acc[cat] = []
        acc[cat].push(item)
        return acc
    }, {} as { [category: string]: InventoryItem[] })


    const startEdit = (item: InventoryItem) => {
        setEditingId(item.id)
        setEditWeight(item.weight ? item.weight.toString() : '')
    }

    const saveWeight = async (id: string) => {
        const supabase = createClient()
        const newWeight = parseFloat(editWeight)

        const { error } = await supabase
            .from('inventory_items')
            .update({ weight: isNaN(newWeight) ? null : newWeight })
            .eq('id', id)

        if (!error) {
            setItems(items.map(i => i.id === id ? { ...i, weight: isNaN(newWeight) ? null : newWeight } : i))
            setEditingId(null)
        } else {
            alert('Error updating weight: ' + error.message)
        }
    }

    const handleSplit = async (id: string) => {
        if (!confirm(t.inventory.confirmSplit)) return
        setSplittingId(id)
        await splitItem(id)
        window.location.reload()
    }

    // Collapsible state
    const [collapsedCategories, setCollapsedCategories] = useState<{ [key: string]: boolean }>({})
    const [collapsedSubcategories, setCollapsedSubcategories] = useState<{ [key: string]: boolean }>({})

    const toggleCategory = (category: string) => {
        setCollapsedCategories(prev => ({ ...prev, [category]: !prev[category] }))
    }

    const toggleSubcategory = (key: string) => {
        setCollapsedSubcategories(prev => ({ ...prev, [key]: !prev[key] }))
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {selectedItem && (
                <ProductDetailsModal
                    item={selectedItem}
                    onClose={() => setSelectedItem(null)}
                />
            )}

            {Object.keys(categoryGroups).sort().map(category => {
                const isCollapsed = collapsedCategories[category]
                const catItems = categoryGroups[category]
                const count = catItems.length

                // Group by Subcategory within this Category
                const subGroups = catItems.reduce((acc, item) => {
                    const subName = item.subcategories?.name || 'General'
                    if (!acc[subName]) acc[subName] = []
                    acc[subName].push(item)
                    return acc
                }, {} as { [key: string]: InventoryItem[] })

                const sortedSubkeys = Object.keys(subGroups).sort()

                return (
                    <div key={category} style={{ animation: 'fadeIn 0.5s ease' }}>
                        <button
                            onClick={() => toggleCategory(category)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '1rem',
                                marginBottom: '1rem', padding: '0.5rem 0.5rem 0.5rem 0',
                                background: 'transparent', border: 'none', cursor: 'pointer',
                                width: '100%', textAlign: 'left', color: 'inherit'
                            }}
                        >
                            <span style={{
                                transition: 'transform 0.2s',
                                transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                                fontSize: '0.8rem', opacity: 0.5
                            }}>▼</span>
                            <h2 style={{
                                fontSize: '1.25rem', fontWeight: 600, color: 'var(--foreground)',
                                letterSpacing: '-0.02em', margin: 0
                            }}>
                                {category === 'Uncategorized' ? t.inventory.uncategorized : category}
                            </h2>
                            <span style={{
                                fontSize: '0.75rem', padding: '0.2rem 0.6rem',
                                borderRadius: '99px', background: 'var(--surface-highlight)',
                                color: 'var(--text-muted)'
                            }}>
                                {count} {t.inventory.itemsCount}
                            </span>
                        </button>

                        {!isCollapsed && (
                            <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--surface)' }}>
                                {sortedSubkeys.map((subName, subIndex) => {
                                    const subItems = subGroups[subName]
                                    const subKey = `${category}-${subName}`
                                    const isSubCollapsed = collapsedSubcategories[subKey]
                                    const isGeneral = subName === 'General'

                                    return (
                                        <div key={subKey} style={{ borderBottom: subIndex === sortedSubkeys.length - 1 ? 'none' : '1px solid var(--border)' }}>
                                            {/* Subcategory Header */}
                                            <button
                                                onClick={() => toggleSubcategory(subKey)}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                                                    width: '100%', padding: '0.75rem 1.25rem',
                                                    background: 'var(--surface-highlight)',
                                                    border: 'none', borderBottom: !isSubCollapsed ? '1px solid var(--border)' : 'none',
                                                    cursor: 'pointer', textAlign: 'left', color: 'inherit',
                                                    fontSize: '0.9rem', fontWeight: 500
                                                }}
                                            >
                                                <span style={{
                                                    transition: 'transform 0.2s',
                                                    transform: isSubCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                                                    fontSize: '0.7rem', opacity: 0.5
                                                }}>▼</span>
                                                <span style={{ opacity: 0.9 }}>{subName}</span>
                                                <span style={{ fontSize: '0.7rem', opacity: 0.5, marginLeft: 'auto' }}>
                                                    {subItems.length}
                                                </span>
                                            </button>

                                            {/* Items List */}
                                            {!isSubCollapsed && subItems.map((item, index) => {
                                                const isLastItem = index === subItems.length - 1
                                                return (
                                                    <div key={item.id} style={{
                                                        display: 'grid',
                                                        gridTemplateColumns: 'minmax(200px, 2fr) 1.5fr 1fr auto',
                                                        padding: '1rem 1.25rem',
                                                        alignItems: 'center',
                                                        borderBottom: isLastItem ? 'none' : '1px solid var(--border)',
                                                        background: 'transparent'
                                                    }} className="hover-bg">
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingLeft: '1.5rem' }}>
                                                            {/* Image Thumbnail */}
                                                            <div style={{ width: '40px', height: '40px', borderRadius: '8px', overflow: 'hidden', background: 'var(--surface-highlight)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                {item.image_url ? (
                                                                    <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                                ) : (
                                                                    <span style={{ fontSize: '1rem', opacity: 0.2 }}>📦</span>
                                                                )}
                                                            </div>
                                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                                <span style={{ fontWeight: 500, fontSize: '0.95rem' }}>{item.name}</span>
                                                                {item.sku && (
                                                                    <span style={{ fontSize: '0.7rem', opacity: 0.5, fontFamily: 'monospace' }}>{item.sku}</span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* --- Remaining Item Columns (Weight, Qty, Actions) --- */}
                                                        <div style={{ opacity: 0.6, fontSize: '0.875rem' }}>
                                                            {editingId === item.id ? (
                                                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                                    <input
                                                                        autoFocus
                                                                        value={editWeight}
                                                                        onChange={e => setEditWeight(e.target.value)}
                                                                        onClick={(e) => e.stopPropagation()}
                                                                        style={{ width: '80px', padding: '4px', background: 'var(--background)', border: '1px solid var(--primary)', color: 'var(--foreground)', borderRadius: '4px' }}
                                                                    />
                                                                    <button onClick={() => saveWeight(item.id)} style={{ color: 'var(--success)', cursor: 'pointer', border: 'none', background: 'none' }}>✓</button>
                                                                    <button onClick={() => setEditingId(null)} style={{ color: 'var(--error)', cursor: 'pointer', border: 'none', background: 'none' }}>✕</button>
                                                                </div>
                                                            ) : (
                                                                <div
                                                                    onClick={() => startEdit(item)}
                                                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', width: 'fit-content' }}
                                                                    title="Click to edit weight"
                                                                >
                                                                    <span style={{ opacity: item.weight ? 1 : 0.4 }}>{item.weight ? `${item.weight} ${t.inventory.kg}` : t.inventory.setWeight}</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div>
                                                            <span style={{
                                                                fontWeight: 600,
                                                                color: item.quantity < 10 ? 'var(--error)' : 'var(--success)',
                                                                background: item.quantity < 10 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                                                padding: '4px 8px',
                                                                borderRadius: '6px',
                                                                fontSize: '0.875rem'
                                                            }}>
                                                                {item.quantity} <span style={{ fontSize: '0.85em', opacity: 0.8 }}>{item.unit_type === 'kg' ? t.inventory.kg : t.inventory.unit}</span>
                                                            </span>
                                                        </div>

                                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                            <button
                                                                className="btn"
                                                                onClick={() => setSelectedItem(item)}
                                                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: 'var(--surface-highlight)', color: 'var(--foreground)' }}
                                                            >
                                                                {t.inventory.view}
                                                            </button>
                                                            <Link href={`/inventory/edit/${item.id}`} className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: 'var(--surface-highlight)', color: 'var(--foreground)' }}>
                                                                {t.inventory.edit}
                                                            </Link>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                )
            })}

            {items.length === 0 && (
                <div style={{ textAlign: 'center', padding: '4rem', opacity: 0.5 }}>
                    {t.inventory.noItems}
                </div>
            )}
        </div>
    )
}
