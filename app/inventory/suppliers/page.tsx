'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { createSupplier, deleteSupplier } from '../actions'
import Link from 'next/link'
import { useTranslation } from '@/hooks/useTranslation'

// ─── Modal ────────────────────────────────────────────────────
function AddSupplierModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
    const { t } = useTranslation()
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    const labelStyle: React.CSSProperties = {
        display: 'block', marginBottom: '0.4rem',
        fontSize: '0.78rem', fontWeight: 700,
        color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em',
    }

    return (
        <div
            style={{
                position: 'fixed', inset: 0,
                background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)',
                display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
                zIndex: 9999, overflowY: 'auto', padding: '3rem 1rem 2rem',
            }}
            onClick={e => e.target === e.currentTarget && onClose()}
        >
            <div style={{
                width: '100%', maxWidth: 580,
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '18px',
                padding: '2rem',
                boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
                animation: 'fadeIn 0.18s ease',
            }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800 }}>Agregar Proveedor</h2>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            Llena los datos del nuevo proveedor
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)',
                            borderRadius: '8px', width: 36, height: 36,
                            cursor: 'pointer', fontSize: '1.1rem', color: 'var(--text-muted)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                    >×</button>
                </div>

                <form onSubmit={async (e) => {
                    e.preventDefault()
                    setError('')
                    setSubmitting(true)
                    const formData = new FormData(e.currentTarget)
                    const result = await createSupplier(null, formData)
                    setSubmitting(false)
                    if (result?.error) {
                        setError(result.error)
                    } else {
                        onSaved()
                        onClose()
                    }
                }}>
                    {/* Error banner */}
                    {error && (
                        <div style={{
                            padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '1.25rem',
                            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                            color: 'var(--error)', fontSize: '0.875rem', fontWeight: 500,
                        }}>
                            ⚠️ {error}
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Nombre *</label>
                            <input name="name" className="form-input" required placeholder="Nombre del Proveedor" autoFocus />
                        </div>
                        <div>
                            <label style={labelStyle}>Razón Social</label>
                            <input name="legal_name" className="form-input" placeholder="SA de CV..." />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label style={labelStyle}>RFC</label>
                            <input name="rfc" className="form-input" placeholder="XAXX010101000" />
                        </div>
                        <div>
                            <label style={labelStyle}>Teléfono</label>
                            <input name="phone" className="form-input" placeholder="55 1234 5678" />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={labelStyle}>Correo Electrónico</label>
                        <input name="email" type="email" className="form-input" placeholder="contacto@empresa.com" />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={labelStyle}>Dirección</label>
                        <textarea name="address" className="form-input" rows={2} placeholder="Calle, Colonia, Ciudad..." style={{ resize: 'vertical' }} />
                    </div>

                    <div style={{ marginBottom: '1.75rem' }}>
                        <label style={labelStyle}>Información de Contacto / Notas</label>
                        <textarea name="contact_info" className="form-input" rows={2} placeholder="Notas adicionales..." style={{ resize: 'vertical' }} />
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                        <button
                            type="button" onClick={onClose}
                            style={{
                                padding: '0.65rem 1.25rem', borderRadius: '10px',
                                border: '1px solid var(--border)', background: 'transparent',
                                cursor: 'pointer', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.9rem',
                            }}
                        >Cancelar</button>
                        <button
                            type="submit" disabled={submitting}
                            className="btn btn-primary"
                            style={{ padding: '0.65rem 1.5rem', fontWeight: 700, fontSize: '0.9rem' }}
                        >
                            {submitting ? 'Guardando...' : 'Guardar Proveedor'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// ─── Page ─────────────────────────────────────────────────────
export default function SuppliersPage() {
    const { t } = useTranslation()
    const [suppliers, setSuppliers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)

    useEffect(() => { fetchSuppliers() }, [])

    const fetchSuppliers = async () => {
        const supabase = createClient()
        const { data } = await supabase.from('suppliers').select('*').order('name')
        if (data) setSuppliers(data)
        setLoading(false)
    }

    const handleDelete = async (id: string) => {
        if (!confirm(t.purchases.confirmDeleteSupplier)) return
        await deleteSupplier(id)
        fetchSuppliers()
    }

    return (
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
            {/* Modal */}
            {showModal && (
                <AddSupplierModal
                    onClose={() => setShowModal(false)}
                    onSaved={fetchSuppliers}
                />
            )}

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <Link href="/inventory" style={{ fontSize: '0.85rem', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.5rem', textDecoration: 'none' }}>
                    {t.purchases.backToInventory}
                </Link>
                <button onClick={() => setShowModal(true)} className="btn btn-primary">
                    + {t.purchases.addSupplier}
                </button>
            </div>

            {/* Table */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Cargando...</div>
            ) : (
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                                <th style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nombre</th>
                                <th style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contacto</th>
                                <th style={{ padding: '0.875rem 1.25rem', textAlign: 'right', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t.purchases.actions}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {suppliers.map((s, i) => (
                                <tr key={s.id} style={{ borderBottom: i < suppliers.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background 0.12s' }}
                                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.025)')}
                                    onMouseLeave={e => (e.currentTarget.style.background = '')}>
                                    <td style={{ padding: '1rem 1.25rem', fontWeight: 600 }}>
                                        {s.name}
                                        {s.rfc && <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400, fontFamily: 'monospace' }}>{s.rfc}</span>}
                                    </td>
                                    <td style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                        {s.email || s.phone || s.contact_info || '—'}
                                    </td>
                                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                            <Link href={`/inventory/catalog?supplier_id=${s.id}`}
                                                style={{ padding: '0.35rem 0.75rem', borderRadius: '7px', border: '1px solid var(--border)', background: 'transparent', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600, color: 'var(--foreground)' }}>
                                                Catálogo
                                            </Link>
                                            <button onClick={() => handleDelete(s.id)}
                                                style={{ padding: '0.35rem 0.75rem', borderRadius: '7px', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: 'var(--error)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
                                                Eliminar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {suppliers.length === 0 && (
                                <tr>
                                    <td colSpan={3} style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🏭</div>
                                        <p style={{ fontWeight: 600 }}>{t.purchases.noSuppliersYet}</p>
                                        <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>{t.purchases.noSuppliersHint}</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
