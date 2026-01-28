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
    const [loadingCategories, setLoadingCategories] = useState(true)

    useEffect(() => {
        async function fetchCategories() {
            const supabase = createClient()
            const { data } = await supabase.from('categories').select('*').order('name', { ascending: true })
            if (data) {
                setCategories(data)
            }
            setLoadingCategories(false)
        }
        fetchCategories()
    }, [])

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
                            <select className="input" name="category" required>
                                <option value="" disabled selected>Select a category</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                                ))}
                                {!loadingCategories && categories.length === 0 && (
                                    <option value="Uncategorized">Uncategorized</option>
                                )}
                            </select>
                        </div>
                        <div>
                            <label className="text-md" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', opacity: 0.8 }}>
                                Price ($)
                            </label>
                            <input className="input" name="price" type="number" step="0.01" placeholder="0.00" required />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div>
                            <label className="text-md" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', opacity: 0.8 }}>
                                Quantity
                            </label>
                            <input className="input" name="quantity" type="number" placeholder="0" required />
                        </div>
                        <div>
                            <label className="text-md" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', opacity: 0.8 }}>
                                Weight (kg)
                            </label>
                            <input className="input" name="weight" type="number" step="0.01" placeholder="0.00" />
                        </div>
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
