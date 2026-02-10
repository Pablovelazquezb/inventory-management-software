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
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} className="animate-fade-in">
            <div className="card animate-scale-in" style={{ width: '400px', padding: '2rem' }}>
                <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.5rem' }}>Add Supplier</h3>
                <form action={async (formData) => {
                    setSubmitting(true)
                    await createSupplier(null, formData)
                    setSubmitting(false)
                    setShowModal(false)
                    fetchSuppliers()
                }}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'rgba(248,250,252,0.7)' }}>Name</label>
                        <input name="name" className="input" required placeholder="Vendor Name" autoFocus />
                    </div>
                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'rgba(248,250,252,0.7)' }}>Contact Info</label>
                        <textarea name="contact_info" className="input" rows={3} placeholder="Phone, Email, Address..." />
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                        <button type="button" onClick={() => setShowModal(false)} className="btn" style={{ background: 'transparent', color: 'rgba(248,250,252,0.6)' }}>Cancel</button>
                        <button type="submit" disabled={submitting} className="btn btn-primary">{submitting ? 'Saving...' : 'Save Supplier'}</button>
                    </div>
                </form>
            </div>
        </div>
    )

    return (
        <div className="container animate-slide-up" style={{ paddingBottom: '4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <Link href="/inventory" className="btn" style={{ paddingLeft: 0, color: 'rgba(248,250,252,0.6)' }}>
                        ← Back to Inventory
                    </Link>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0, background: 'linear-gradient(to right, #f8fafc, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Suppliers</h2>
                </div>
                <button onClick={() => setShowModal(true)} className="btn btn-primary">
                    + Add Supplier
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem', opacity: 0.5 }}>Loading suppliers...</div>
            ) : (
                <div className="card" style={{ padding: 0 }}>
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Contact Info</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {suppliers.map((s, i) => (
                                <tr key={s.id} style={{ animation: `fadeIn 0.3s ease-out ${i * 0.05}s forwards`, opacity: 0 }}>
                                    <td style={{ fontWeight: 500, color: 'var(--foreground)' }}>{s.name}</td>
                                    <td style={{ opacity: 0.8, whiteSpace: 'pre-line' }}>{s.contact_info}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button
                                            onClick={() => handleDelete(s.id)}
                                            className="btn"
                                            style={{ color: 'var(--error)', padding: '0.4rem 0.8rem', fontSize: '0.85rem', background: 'rgba(239,68,68,0.1)' }}
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
