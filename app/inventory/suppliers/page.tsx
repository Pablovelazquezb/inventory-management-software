'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { createSupplier, deleteSupplier } from '../actions'
import Link from 'next/link'

export default function SuppliersPage() {
    const [suppliers, setSuppliers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        fetchSuppliers()
    }, [])

    const fetchSuppliers = async () => {
        const supabase = createClient()
        const { data, error } = await supabase.from('suppliers').select('*').order('name')
        if (data) setSuppliers(data)
        setLoading(false)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this supplier?')) return
        await deleteSupplier(id)
        fetchSuppliers()
    }

    const Modal = () => (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div className="card" style={{ width: '400px', padding: '2rem' }}>
                <h3 style={{ marginTop: 0 }}>Add Supplier</h3>
                <form action={async (formData) => {
                    setSubmitting(true)
                    await createSupplier(null, formData)
                    setSubmitting(false)
                    setShowModal(false)
                    fetchSuppliers()
                }}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.8 }}>Name</label>
                        <input name="name" className="input" required placeholder="Vendor Name" />
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.8 }}>Contact Info</label>
                        <textarea name="contact_info" className="input" rows={3} placeholder="Phone, Email, Address..." />
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                        <button type="button" onClick={() => setShowModal(false)} className="btn" style={{ background: 'transparent' }}>Cancel</button>
                        <button type="submit" disabled={submitting} className="btn btn-primary">{submitting ? 'Saving...' : 'Save'}</button>
                    </div>
                </form>
            </div>
        </div>
    )

    return (
        <div style={{ paddingBottom: '4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <Link href="/inventory" style={{ fontSize: '0.875rem', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        ← Back to Inventory
                    </Link>
                    <h2 style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>Suppliers</h2>
                </div>
                <button onClick={() => setShowModal(true)} className="btn btn-primary">
                    + Add Supplier
                </button>
            </div>

            {loading ? (
                <div>Loading...</div>
            ) : (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
                            <tr>
                                <th style={{ padding: '1rem', textAlign: 'left', opacity: 0.7 }}>Name</th>
                                <th style={{ padding: '1rem', textAlign: 'left', opacity: 0.7 }}>Contact Info</th>
                                <th style={{ padding: '1rem', textAlign: 'right', opacity: 0.7 }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {suppliers.map(s => (
                                <tr key={s.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '1rem', fontWeight: 500 }}>{s.name}</td>
                                    <td style={{ padding: '1rem', opacity: 0.8, whiteSpace: 'pre-line' }}>{s.contact_info}</td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <button
                                            onClick={() => handleDelete(s.id)}
                                            style={{ color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.7 }}
                                            className="hover:opacity-100"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {suppliers.length === 0 && (
                                <tr>
                                    <td colSpan={3} style={{ padding: '3rem', textAlign: 'center', opacity: 0.5 }}>
                                        No suppliers added yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && <Modal />}
        </div>
    )
}
