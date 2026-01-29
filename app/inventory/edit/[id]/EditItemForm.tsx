'use client'

import { useActionState, useState, useEffect } from 'react'
import { updateItem } from '../../actions'
import Link from 'next/link'

const initialState = {
    error: '',
}

export default function EditItemForm({ item, categories, subcategories }: { item: any, categories: any[], subcategories: any[] }) {
    const updateItemWithId = updateItem.bind(null, item.id)
    const [state, formAction, isPending] = useActionState(updateItemWithId, initialState)

    const [selectedCategory, setSelectedCategory] = useState(item.category) // existing name
    const [filteredSubcategories, setFilteredSubcategories] = useState<any[]>([])

    useEffect(() => {
        if (selectedCategory) {
            // Match category name to object to get ID for filtering
            const catObj = categories.find(c => c.name === selectedCategory)
            if (catObj) {
                setFilteredSubcategories(subcategories.filter(s => s.category_id === catObj.id))
            } else {
                setFilteredSubcategories([])
            }
        } else {
            setFilteredSubcategories([])
        }
    }, [selectedCategory, categories, subcategories])

    return (
        <div className="card">
            <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                    <label className="text-md" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', opacity: 0.8 }}>
                        Item Name
                    </label>
                    <input className="input" name="name" defaultValue={item.name} required />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
                            <label className="text-md" style={{ display: 'block', fontSize: '0.875rem', opacity: 0.8 }}>
                                Category
                            </label>
                            <Link href="/inventory/categories" style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>
                                Manage
                            </Link>
                        </div>
                        <select
                            className="input"
                            name="category"
                            required
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            <option value="" disabled>Select a category</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.name}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
                            <label className="text-md" style={{ display: 'block', fontSize: '0.875rem', opacity: 0.8 }}>
                                Subcategory
                            </label>
                        </div>
                        <select
                            className="input"
                            name="subcategory_id"
                            defaultValue={item.subcategory_id || ''}
                            disabled={!selectedCategory || filteredSubcategories.length === 0}
                        >
                            <option value="">Select subcategory</option>
                            {filteredSubcategories.map((sub) => (
                                <option key={sub.id} value={sub.id}>{sub.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div>
                        <label className="text-md" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', opacity: 0.8 }}>
                            Price ($)
                        </label>
                        <input className="input" name="price" type="number" step="0.01" defaultValue={item.price} required />
                    </div>
                    <div>
                        <label className="text-md" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', opacity: 0.8 }}>
                            Quantity
                        </label>
                        <input className="input" name="quantity" type="number" defaultValue={item.quantity} required />
                    </div>
                </div>

                <div>
                    <label className="text-md" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', opacity: 0.8 }}>
                        Weight (kg)
                    </label>
                    <input className="input" name="weight" type="number" step="0.01" defaultValue={item.weight || ''} />
                </div>

                <div>
                    <label className="text-md" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', opacity: 0.8 }}>
                        Description
                    </label>
                    <textarea className="input" name="description" rows={4} defaultValue={item.description} style={{ minHeight: '100px', resize: 'vertical' }} />
                </div>

                {state?.error && (
                    <p style={{ color: 'var(--error)', fontSize: '0.875rem', textAlign: 'center' }}>
                        {state.error}
                    </p>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem' }}>
                    <button disabled={isPending} className="btn btn-primary" style={{ minWidth: '150px' }}>
                        {isPending ? 'Updating...' : 'Update Item'}
                    </button>
                </div>
            </form>
        </div>
    )
}
