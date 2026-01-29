'use client'

import { useActionState, useEffect, useState } from 'react'
import { createCategory, deleteCategory, createSubcategory, deleteSubcategory, updateCategory, updateSubcategory } from '../actions'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'

const initialState = {
    error: '',
}

export default function CategoriesPage() {
    const [createCatState, createCatAction, isCatPending] = useActionState(createCategory, initialState)
    const [createSubState, createSubAction, isSubPending] = useActionState(createSubcategory, initialState)

    // We'll manage active subcategory creation via local state
    const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null)
    const [editingCatId, setEditingCatId] = useState<string | null>(null)
    const [editingSubId, setEditingSubId] = useState<string | null>(null)

    // Derived state for renaming inputs
    const [renameValue, setRenameValue] = useState('')

    const [categories, setCategories] = useState<any[]>([])
    const [subcategories, setSubcategories] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchData()
    }, [createCatState, createSubState]) // also should re-fetch on update actions if they were useActionState, but standard function calls need manual re-fetch or reliance on revalidatePath + client router refresh.
    // revalidatePath handles server data, but this use effect fetches client side.
    // Ideally we subscribe to supabase changes or just reload.
    // For now we'll reload manually after update.

    async function fetchData() {
        const supabase = createClient()
        // Fetch categories
        const { data: cats } = await supabase.from('categories').select('*').order('created_at', { ascending: true })
        // Fetch subcategories
        const { data: subs } = await supabase.from('subcategories').select('*').order('created_at', { ascending: true })

        if (cats) setCategories(cats)
        if (subs) setSubcategories(subs)
        setLoading(false)
    }

    const handleUpdateCategory = async (id: string) => {
        await updateCategory(id, renameValue)
        setEditingCatId(null)
        setRenameValue('')
        fetchData()
    }

    const handleUpdateSubcategory = async (id: string) => {
        await updateSubcategory(id, renameValue)
        setEditingSubId(null)
        setRenameValue('')
        fetchData()
    }

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <Link href="/inventory" style={{ fontSize: '0.875rem', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    ← Back to Inventory
                </Link>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Manage Categories</h2>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
                {/* Create Category Form */}
                <div className="card">
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Add New Category</h3>
                    <form action={createCatAction} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                        <div style={{ flex: 1 }}>
                            <label className="text-md" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', opacity: 0.8 }}>
                                Category Name
                            </label>
                            <input className="input" name="name" placeholder="e.g. Pipes" required />
                        </div>
                        <button disabled={isCatPending} className="btn btn-primary" style={{ marginBottom: '2px' }}>
                            {isCatPending ? 'Adding...' : 'Add'}
                        </button>
                    </form>
                    {createCatState?.error && (
                        <p style={{ color: 'var(--error)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                            {createCatState.error}
                        </p>
                    )}
                </div>

                {/* Categories List */}
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, padding: '1.5rem', borderBottom: '1px solid var(--border)', margin: 0 }}>
                        Existing Categories
                    </h3>

                    {loading ? (
                        <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.5 }}>Loading...</div>
                    ) : categories.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.5 }}>No categories found.</div>
                    ) : (
                        <div>
                            {categories.map((cat) => {
                                const catSubs = subcategories.filter(s => s.category_id === cat.id)
                                return (
                                    <div key={cat.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <div style={{
                                            padding: '1rem 1.5rem',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            background: 'rgba(255,255,255,0.02)'
                                        }}>
                                            {editingCatId === cat.id ? (
                                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                    <input
                                                        className="input"
                                                        value={renameValue}
                                                        onChange={(e) => setRenameValue(e.target.value)}
                                                        style={{ padding: '0.3rem' }}
                                                    />
                                                    <button onClick={() => handleUpdateCategory(cat.id)} className="btn btn-primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>Save</button>
                                                    <button onClick={() => setEditingCatId(null)} className="btn" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', background: 'transparent', border: '1px solid var(--border)' }}>Cancel</button>
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                    <span style={{ fontWeight: 600, fontSize: '1rem' }}>{cat.name}</span>
                                                    <button onClick={() => { setEditingCatId(cat.id); setRenameValue(cat.name); }} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.4, fontSize: '0.8rem' }}>✏️</button>
                                                </div>
                                            )}

                                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                                <button
                                                    onClick={() => setActiveCategoryId(activeCategoryId === cat.id ? null : cat.id)}
                                                    className="btn"
                                                    style={{
                                                        background: 'transparent',
                                                        border: '1px solid var(--border)',
                                                        fontSize: '0.75rem',
                                                        padding: '0.25rem 0.6rem'
                                                    }}
                                                >
                                                    {activeCategoryId === cat.id ? 'Cancel' : '+ Subcategory'}
                                                </button>
                                                <form action={deleteCategory.bind(null, cat.id)}>
                                                    <button className="btn" style={{
                                                        padding: '0.25rem 0.5rem',
                                                        fontSize: '0.75rem',
                                                        background: 'rgba(255, 0, 0, 0.1)',
                                                        color: 'var(--error)',
                                                        border: 'none'
                                                    }}>
                                                        Delete
                                                    </button>
                                                </form>
                                            </div>
                                        </div>

                                        {/* Subcategories Section */}
                                        <div style={{ padding: '0 1.5rem 1rem 1.5rem' }}>
                                            {/* Add Subcategory Form */}
                                            {activeCategoryId === cat.id && (
                                                <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                                                    <form action={async (formData) => {
                                                        await createSubAction(formData)
                                                        setActiveCategoryId(null)
                                                        // Note: creating subcategory revalidates path but useActionState might not reset local active state automatically,
                                                        // or rather, we want to close the form on success.
                                                        // A simplified approach for now.
                                                    }} style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <input type="hidden" name="category_id" value={cat.id} />
                                                        <input className="input" name="name" placeholder="Subcategory Name" required style={{ flex: 1, padding: '0.4rem' }} />
                                                        <button disabled={isSubPending} className="btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>
                                                            Add
                                                        </button>
                                                    </form>
                                                </div>
                                            )}

                                            {/* Subcategories List */}
                                            {catSubs.length > 0 && (
                                                <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                    {catSubs.map(sub => (
                                                        <div key={sub.id} style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '0.5rem',
                                                            padding: '0.25rem 0.75rem',
                                                            background: 'rgba(255,255,255,0.05)',
                                                            borderRadius: '16px',
                                                            fontSize: '0.8rem'
                                                        }}>
                                                            {editingSubId === sub.id ? (
                                                                <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                                                                    <input
                                                                        className="input"
                                                                        value={renameValue}
                                                                        onChange={(e) => setRenameValue(e.target.value)}
                                                                        style={{ padding: '0.1rem', fontSize: '0.8rem', width: '80px' }}
                                                                    />
                                                                    <button onClick={() => handleUpdateSubcategory(sub.id)} style={{ fontSize: '0.7rem', color: 'var(--success)', background: 'none', border: 'none', cursor: 'pointer' }}>✓</button>
                                                                    <button onClick={() => setEditingSubId(null)} style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <span onClick={() => { setEditingSubId(sub.id); setRenameValue(sub.name); }} style={{ cursor: 'pointer' }}>{sub.name}</span>
                                                                    <form action={deleteSubcategory.bind(null, sub.id)}>
                                                                        <button style={{
                                                                            background: 'none',
                                                                            border: 'none',
                                                                            color: 'var(--text-secondary)',
                                                                            cursor: 'pointer',
                                                                            padding: 0,
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            marginLeft: '4px'
                                                                        }}>×</button>
                                                                    </form>
                                                                </>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
