'use client'

import { useActionState } from 'react'
import { createCategory, deleteCategory } from '../actions'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'

const initialState = {
    error: '',
}

export default function CategoriesPage() {
    const [state, formAction, isPending] = useActionState(createCategory, initialState)
    const [categories, setCategories] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // We fetch categories client-side here to keep it simple with the useActionState updates, 
    // or we could make this a server component and pass data. 
    // Given the previous pattern was Server Component for listing, let's stick to that if possible, 
    // but useActionState is client-side. 
    // Actually, mixing useActionState (Client) and data fetching (Server) is common.
    // However, since I need to refresh the list after adding, doing it all client side or using router.refresh() is needed.
    // Let's make this a Client Component as declared at top, and fetch data.

    useEffect(() => {
        fetchCategories()
    }, [state]) // specific to state update if needed, but actions usually revalidate path. 
    // If revalidatePath works, we just need to consume the server data. 
    // But since this is a client component, we either receive data as props or fetch it.
    // Let's fetch it for simplicity in this "use client" file.

    async function fetchCategories() {
        const supabase = createClient()
        const { data, error } = await supabase.from('categories').select('*').order('created_at', { ascending: true })
        if (!error && data) {
            setCategories(data)
        }
        setLoading(false)
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Create Category Form */}
                <div className="card">
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Add New Category</h3>
                    <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <label className="text-md" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', opacity: 0.8 }}>
                                Category Name
                            </label>
                            <input className="input" name="name" placeholder="e.g. Electronics" required />
                        </div>

                        {state?.error && (
                            <p style={{ color: 'var(--error)', fontSize: '0.875rem' }}>
                                {state.error}
                            </p>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button disabled={isPending} className="btn btn-primary" style={{ width: '100%' }}>
                                {isPending ? 'Adding...' : 'Add Category'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Categories List */}
                <div className="card" style={{ padding: 0, overflow: 'hidden', height: 'fit-content' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, padding: '1.5rem', borderBottom: '1px solid var(--border)', margin: 0 }}>
                        Existing Categories
                    </h3>

                    {loading ? (
                        <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.5 }}>Loading...</div>
                    ) : categories.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.5 }}>No categories found.</div>
                    ) : (
                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            {categories.map((cat) => (
                                <div key={cat.id} style={{
                                    padding: '1rem 1.5rem',
                                    borderBottom: '1px solid var(--border)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <span style={{ fontWeight: 500 }}>{cat.name}</span>
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
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
