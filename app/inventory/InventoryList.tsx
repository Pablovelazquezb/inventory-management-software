'use client'

import { useState } from 'react'
import { deleteItem, splitItem } from './actions'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'

// Helper to group items
const groupItems = (items: any[]) => {
    const groups: { [key: string]: any[] } = {}
    items.forEach(item => {
        // Group by Name + Subcategory ID (to keep variants together but separate if really different)
        // User asked: "siguen siendo el mismo item... vaso con 2kg otro con 4kg"
        // So we group by Name. If they share name but are different weight, they are in the same group.
        // We probably also want to respect category/subcategory. 
        // A "Vaso" in "Kitchen" is the same group. 
        // Key: name + subcategory_id + category
        const key = `${item.name}-${item.subcategory_id || 'null'}-${item.category || 'null'}`
        if (!groups[key]) {
            groups[key] = []
        }
        groups[key].push(item)
    })
    return groups
}

export default function InventoryList({ initialItems }: { initialItems: any[] }) {
    const [items, setItems] = useState(initialItems)
    const groups = groupItems(items)
    const [expandedGroups, setExpandedGroups] = useState<{ [key: string]: boolean }>({})

    // Edit weight state
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editWeight, setEditWeight] = useState<string>('')

    // Sub-action states
    const [splittingId, setSplittingId] = useState<string | null>(null)

    const toggleGroup = (key: string) => {
        setExpandedGroups(prev => ({ ...prev, [key]: !prev[key] }))
    }

    const startEdit = (item: any) => {
        setEditingId(item.id)
        setEditWeight(item.weight || '')
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
        if (!confirm('This will separate 1 unit from this batch so you can edit it individually. Continue?')) return

        setSplittingId(id)
        await splitItem(id)

        // Since splitItem calls revalidatePath, the page should refresh. 
        // But in a client component with local state, we might not need to wait or just rely on the server refresh.
        // Actually, revalidatePath on server actions in Next.js App Router updates the client cache automatically.
        // However, since we initialized state with `initialItems`, it might not update unless the parent re-renders.
        // The parent is a Server Component, so revalidatePath will cause it to re-render and pass new `initialItems`.
        // But React might preserve the state of this component unless `key` changes or we sync.
        // A simple way to force sync:
        window.location.reload()
        // Or cleaner: use router.refresh() from next/navigation
    }

    return (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                    <tr>
                        <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)' }}>Name</th>
                        <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)' }}>Category</th>
                        <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)' }}>Total Stock</th>
                        <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)' }}>Price</th>
                        <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)', textAlign: 'right' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(groups).length > 0 ? (
                        Object.entries(groups).map(([key, groupItems]) => {
                            const firstItem = groupItems[0]
                            const totalQuantity = groupItems.reduce((sum, i) => sum + i.quantity, 0)
                            const isExpanded = expandedGroups[key]

                            return (
                                <>
                                    {/* Group Header Row */}
                                    <tr key={key} style={{ borderBottom: isExpanded ? 'none' : '1px solid var(--border)', background: isExpanded ? 'rgba(255,255,255,0.02)' : 'transparent', cursor: 'pointer' }} onClick={() => toggleGroup(key)}>
                                        <td style={{ padding: '1rem', fontWeight: 500 }}>
                                            <span style={{ marginRight: '0.5rem', opacity: 0.5 }}>{isExpanded ? '▼' : '▶'}</span>
                                            {firstItem.name}
                                            <span style={{ fontSize: '0.75rem', opacity: 0.5, marginLeft: '0.5rem' }}>({groupItems.length} styles)</span>
                                        </td>
                                        <td style={{ padding: '1rem', color: 'rgba(255,255,255,0.7)' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <span style={{ background: 'rgba(255,255,255,0.1)', padding: '0.25rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', width: 'fit-content' }}>
                                                    {firstItem.category || 'Uncategorized'}
                                                </span>
                                                {firstItem.subcategories && (
                                                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', paddingLeft: '4px' }}>
                                                        ↳ {firstItem.subcategories.name}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                color: totalQuantity < 10 ? 'var(--error)' : 'var(--success)',
                                                fontWeight: 500
                                            }}>
                                                {totalQuantity} units
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem' }}>${firstItem.price}</td>
                                        {/* Assuming same price for base model, or we show range. For now show first item's price */}
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                                            <button className="btn" style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem', opacity: 0.7 }}>
                                                {isExpanded ? 'Collapse' : 'View Variants'}
                                            </button>
                                        </td>
                                    </tr>

                                    {/* Expanded Variants Rows */}
                                    {isExpanded && (
                                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td colSpan={5} style={{ padding: 0 }}>
                                                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem 1rem 1rem 3rem' }}>
                                                    <table style={{ width: '100%', fontSize: '0.875rem' }}>
                                                        <thead>
                                                            <tr>
                                                                <th style={{ textAlign: 'left', opacity: 0.6, paddingBottom: '0.5rem' }}>ID</th>
                                                                <th style={{ textAlign: 'left', opacity: 0.6, paddingBottom: '0.5rem' }}>Stock</th>
                                                                <th style={{ textAlign: 'left', opacity: 0.6, paddingBottom: '0.5rem' }}>Weight (kg)</th>
                                                                <th style={{ textAlign: 'right', opacity: 0.6, paddingBottom: '0.5rem' }}>Actions</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {groupItems.map(item => (
                                                                <tr key={item.id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                                                    <td style={{ padding: '0.5rem 0', fontFamily: 'monospace', opacity: 0.5 }}>...{item.id.slice(-4)}</td>
                                                                    <td style={{ padding: '0.5rem 0' }}>
                                                                        {/* Stock Display */}
                                                                        <span style={{ fontWeight: 500 }}>{item.quantity}</span>
                                                                    </td>
                                                                    <td style={{ padding: '0.5rem 0' }}>
                                                                        {editingId === item.id ? (
                                                                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                                                <input
                                                                                    className="input"
                                                                                    type="number"
                                                                                    step="0.01"
                                                                                    value={editWeight}
                                                                                    onChange={(e) => setEditWeight(e.target.value)}
                                                                                    style={{ padding: '0.2rem', width: '80px', fontSize: '0.875rem' }}
                                                                                    onClick={(e) => e.stopPropagation()}
                                                                                />
                                                                                <button className="btn btn-primary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }} onClick={(e) => { e.stopPropagation(); saveWeight(item.id); }}>Save</button>
                                                                                <button className="btn" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', background: 'transparent' }} onClick={(e) => { e.stopPropagation(); setEditingId(null); }}>Cancel</button>
                                                                            </div>
                                                                        ) : (
                                                                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                                                <span>{item.weight ? `${item.weight} kg` : '-'}</span>
                                                                                <button onClick={(e) => { e.stopPropagation(); startEdit(item); }} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5, fontSize: '0.8rem' }}>✏️</button>
                                                                            </div>
                                                                        )}
                                                                    </td>
                                                                    <td style={{ padding: '0.5rem 0', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', alignItems: 'center' }}>
                                                                        {/* Action Buttons */}


                                                                        {item.quantity > 1 && (
                                                                            <button
                                                                                onClick={(e) => { e.stopPropagation(); handleSplit(item.id); }}
                                                                                disabled={splittingId === item.id}
                                                                                className="btn"
                                                                                style={{
                                                                                    padding: '0.2rem 0.5rem',
                                                                                    fontSize: '0.75rem',
                                                                                    background: 'rgba(255, 255, 255, 0.05)',
                                                                                    border: 'none',
                                                                                    whiteSpace: 'nowrap',
                                                                                    opacity: 0.7
                                                                                }}
                                                                            >
                                                                                Separate 1
                                                                            </button>
                                                                        )}
                                                                        <Link href={`/inventory/edit/${item.id}`} className="btn" style={{
                                                                            padding: '0.2rem 0.6rem',
                                                                            fontSize: '0.75rem',
                                                                            background: 'rgba(255,255,255,0.05)',
                                                                            border: 'none',
                                                                            textDecoration: 'none',
                                                                            color: 'var(--foreground)',
                                                                            opacity: 0.7
                                                                        }}>
                                                                            Edit
                                                                        </Link>
                                                                        <form action={deleteItem.bind(null, item.id)}>
                                                                            <button className="btn" style={{
                                                                                padding: '0.2rem 0.6rem',
                                                                                fontSize: '0.75rem',
                                                                                background: 'transparent',
                                                                                color: 'var(--error)',
                                                                                border: '1px solid var(--border)'
                                                                            }}>
                                                                                ×
                                                                            </button>
                                                                        </form>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            )
                        })
                    ) : (
                        <tr>
                            <td colSpan={5} style={{ padding: '4rem', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
                                No items found. Start by adding one.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}
