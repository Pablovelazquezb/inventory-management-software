'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { createCustomer, deleteCustomer } from '../actions'
import Link from 'next/link'
import { useTranslation } from '@/hooks/useTranslation'

export default function CustomersPage() {
    const { t } = useTranslation()
    const [customers, setCustomers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        fetchCustomers()
    }, [])

    const fetchCustomers = async () => {
        const supabase = createClient()
        const { data } = await supabase.from('customers').select('*').order('name')
        if (data) setCustomers(data)
        setLoading(false)
    }

    const handleDelete = async (id: string) => {
        if (!confirm(t.purchases.confirmDeleteCustomer)) return
        await deleteCustomer(id)
        fetchCustomers()
    }

    const Modal = () => (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} className="animate-fade-in">
            <div className="card animate-scale-in" style={{ width: '600px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
                <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.5rem' }}>{t.purchases.addCustomer}</h3>
                <form action={async (formData) => {
                    setSubmitting(true)
                    await createCustomer(null, formData)
                    setSubmitting(false)
                    setShowModal(false)
                    fetchCustomers()
                }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'rgba(248,250,252,0.7)' }}>{t.purchases.name}</label>
                            <input name="name" className="input" required placeholder={t.purchases.customerNamePlaceholder} autoFocus />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'rgba(248,250,252,0.7)' }}>{t.purchases.legalName}</label>
                            <input name="legal_name" className="input" placeholder="Razón Social..." />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'rgba(248,250,252,0.7)' }}>{t.purchases.rfc}</label>
                            <input name="rfc" className="input" placeholder="XAXX010101000" />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'rgba(248,250,252,0.7)' }}>{t.purchases.phone}</label>
                            <input name="phone" className="input" placeholder="55 1234 5678" />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'rgba(248,250,252,0.7)' }}>{t.purchases.email}</label>
                        <input name="email" type="email" className="input" placeholder="cliente@correo.com" />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'rgba(248,250,252,0.7)' }}>{t.purchases.address}</label>
                        <textarea name="address" className="input" rows={2} placeholder="Calle, Colonia, Ciudad..." />
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'rgba(248,250,252,0.7)' }}>{t.purchases.notes}</label>
                        <textarea name="notes" className="input" rows={2} placeholder="Notas adicionales..." />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                        <button type="button" onClick={() => setShowModal(false)} className="btn" style={{ background: 'transparent', color: 'rgba(248,250,252,0.6)' }}>{t.purchases.cancel}</button>
                        <button type="submit" disabled={submitting} className="btn btn-primary">{submitting ? t.purchases.saving : t.purchases.saveCustomer}</button>
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
                        {t.purchases.backToInventory}
                    </Link>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0, background: 'linear-gradient(to right, #f8fafc, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{t.purchases.customersTitle}</h2>
                </div>
                <button onClick={() => setShowModal(true)} className="btn btn-primary">
                    {t.purchases.addCustomer}
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem', opacity: 0.5 }}>{t.purchases.loadingCustomers}</div>
            ) : (
                <div className="card" style={{ padding: 0 }}>
                    <table>
                        <thead>
                            <tr>
                                <th>{t.purchases.name}</th>
                                <th>{t.purchases.contactInfo}</th>
                                <th>{t.purchases.rfc}</th>
                                <th style={{ textAlign: 'right' }}>{t.purchases.actions}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.map((c, i) => (
                                <tr key={c.id} style={{ animation: `fadeIn 0.3s ease-out ${i * 0.05}s forwards`, opacity: 0 }}>
                                    <td style={{ fontWeight: 500, color: 'var(--foreground)' }}>
                                        {c.name}
                                        {c.legal_name && <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>{c.legal_name}</div>}
                                    </td>
                                    <td style={{ opacity: 0.8, fontSize: '0.9rem' }}>
                                        {c.email && <div>✉️ {c.email}</div>}
                                        {c.phone && <div>📞 {c.phone}</div>}
                                        {c.address && <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '0.2rem' }}>📍 {c.address}</div>}
                                    </td>
                                    <td style={{ opacity: 0.8 }}>{c.rfc || '-'}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button
                                            onClick={() => handleDelete(c.id)}
                                            className="btn"
                                            style={{ color: 'var(--error)', padding: '0.4rem 0.8rem', fontSize: '0.85rem', background: 'rgba(239,68,68,0.1)' }}
                                        >
                                            {t.purchases.delete}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {customers.length === 0 && (
                                <tr>
                                    <td colSpan={4} style={{ padding: '3rem', textAlign: 'center', opacity: 0.5 }}>
                                        {t.purchases.noCustomers}
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
