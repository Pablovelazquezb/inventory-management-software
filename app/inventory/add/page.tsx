'use client'

import { useActionState } from 'react'
import { createItem } from '../actions'
import Link from 'next/link'

const initialState = {
    error: '',
}

export default function AddItemPage() {
    const [state, formAction, isPending] = useActionState(createItem, initialState)

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <Link href="/inventory" style={{ fontSize: '0.875rem', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    ← Back to Inventory
                </Link>
                <h2 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Add New Item</h2>
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
                            <label className="text-md" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', opacity: 0.8 }}>
                                Category
                            </label>
                            <select className="input" name="category">
                                <option value="Electronics">Electronics</option>
                                <option value="Clothing">Clothing</option>
                                <option value="Home & Garden">Home & Garden</option>
                                <option value="Automotive">Automotive</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-md" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', opacity: 0.8 }}>
                                Price ($)
                            </label>
                            <input className="input" name="price" type="number" step="0.01" placeholder="0.00" required />
                        </div>
                    </div>

                    <div>
                        <label className="text-md" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', opacity: 0.8 }}>
                            Quantity
                        </label>
                        <input className="input" name="quantity" type="number" placeholder="0" required />
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
