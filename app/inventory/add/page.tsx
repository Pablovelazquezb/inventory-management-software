'use client'

import { useActionState, useEffect, useState } from 'react'
import { createItem } from '../actions'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'

const initialState = {
    error: '',
}

export default function AddItemPage() {
    const [state, formAction, isPending] = useActionState(createItem, initialState)
    const [categories, setCategories] = useState<any[]>([])
    const [subcategories, setSubcategories] = useState<any[]>([])

    // Derived state for filtered subcategories
    const [selectedCategory, setSelectedCategory] = useState<string>('')
    const [filteredSubcategories, setFilteredSubcategories] = useState<any[]>([])

    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            const supabase = createClient()
            const { data: cats } = await supabase.from('categories').select('*').order('name', { ascending: true })
            const { data: subs } = await supabase.from('subcategories').select('*').order('name', { ascending: true })

            if (cats) setCategories(cats)
            if (subs) setSubcategories(subs)
            setLoading(false)
        }
        fetchData()
    }, [])

    useEffect(() => {
        if (selectedCategory) {
            // Find category object to match ID or name. 
            // In the previous code, the value of the select was `cat.name`. 
            // But we need the ID to filter subcategories if we follow the relational model.
            // Using ID for value is safer. But existing items store category name.
            // To support both, we should store ID and name? 
            // The user request was "create subcategory... like plastic tube caliber 400".
            // The DB schema I proposed links subcategory to category by ID.

            // Let's assume we want to match by ID now.
            // However, the `createItem` action still takes `category` as a string (name).
            // So we can set the value to name for the form submission, but use ID for tracking.
            // A bit tricky. 
            // Better approach: value={cat.name} for the form. 
            // AND we find the cat object by name to get its ID for filtering subcategories effectively?
            // Or change the select value to `cat.id`? But then `createItem` needs to lookup the name or we change the schema to use IDs.
            // The user's system seems to use names. 
            // But I introduced relational tables. 
            // Let's change the select value to `cat.name` to keep `createItem` working as is for the category field.
            // AND we find the category object in our list to get its ID.

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
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <Link href="/inventory" style={{ fontSize: '0.875rem', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    ← Back to Inventory
                </Link>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Add New Item</h2>
                </div>
            </div>

            <div className="card">
                <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label className="text-md" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', opacity: 0.8 }}>
                            Item Name
                        </label>
                        <input className="input" name="name" placeholder="e.g. Premium Widget" required />
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
                                {!loading && categories.length === 0 && (
                                    <option value="Uncategorized">Uncategorized</option>
                                )}
                            </select>
                        </div>

                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
                                <label className="text-md" style={{ display: 'block', fontSize: '0.875rem', opacity: 0.8 }}>
                                    Subcategory <span style={{ fontSize: '0.7em', paddingLeft: '4px', opacity: 0.6 }}>(Optional)</span>
                                </label>
                            </div>
                            <select
                                className="input"
                                name="subcategory_id"
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
                            <input className="input" name="price" type="number" step="0.01" placeholder="0.00" required />
                        </div>
                        <div>
                            <label className="text-md" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', opacity: 0.8 }}>
                                Quantity
                            </label>
                            <input className="input" name="quantity" type="number" placeholder="0" required />
                        </div>
                    </div>

                    <div>
                        <label className="text-md" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', opacity: 0.8 }}>
                            Weight (kg)
                        </label>
                        <input className="input" name="weight" type="number" step="0.01" placeholder="0.00" />
                    </div>

                    <div>
                        <label className="text-md" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', opacity: 0.8 }}>
                            Description
                        </label>
                        <textarea className="input" name="description" rows={4} placeholder="Enter item details..." style={{ minHeight: '100px', resize: 'vertical' }} />
                    </div>

                    {state?.error && (
                        <p style={{ color: 'var(--error)', fontSize: '0.875rem', textAlign: 'center' }}>
                            {state.error}
                        </p>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem' }}>
                        <button disabled={isPending} className="btn btn-primary" style={{ minWidth: '150px' }}>
                            {isPending ? 'Creating...' : 'Create Item'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
