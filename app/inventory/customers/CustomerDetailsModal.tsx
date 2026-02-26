'use client'

import React, { useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { updateCustomer } from '../actions'

interface Customer {
    id: string
    name: string
    legal_name?: string
    rfc?: string
    phone?: string
    email?: string
    address?: string
    notes?: string
    created_at?: string
}

interface CustomerDetailsModalProps {
    customer: Customer
    onClose: () => void
    onUpdate?: () => void
}

export default function CustomerDetailsModal({ customer, onClose, onUpdate }: CustomerDetailsModalProps) {
    const { t } = useTranslation()
    const [submitting, setSubmitting] = useState(false)
    const [isDirty, setIsDirty] = useState(false)
    const formRef = React.useRef<HTMLFormElement>(null)

    const handleSubmit = async (formData: FormData) => {
        setSubmitting(true)
        await updateCustomer(customer.id, null, formData)
        setSubmitting(false)
        setIsDirty(false)
        if (onUpdate) onUpdate()
    }

    const InlineInput = ({ name, value, placeholder, type = "text", strong = false, icon = null }: any) => {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: icon ? '0.75rem' : 0 }}>
                {icon && <span style={{ fontSize: '1.2rem' }}>{icon}</span>}
                <input
                    name={name}
                    type={type}
                    defaultValue={value}
                    placeholder={placeholder}
                    onChange={() => setIsDirty(true)}
                    style={{
                        background: 'transparent',
                        border: '1px solid transparent',
                        color: 'inherit',
                        fontWeight: strong ? 700 : 500,
                        fontSize: 'inherit',
                        width: '100%',
                        padding: '0.2rem 0.4rem',
                        marginLeft: '-0.4rem',
                        borderRadius: '4px',
                        outline: 'none',
                        transition: 'all 0.2s',
                        cursor: 'text'
                    }}
                    onFocus={(e) => {
                        e.target.style.background = 'rgba(255,255,255,0.05)'
                        e.target.style.borderColor = 'var(--primary)'
                    }}
                    onBlur={(e) => {
                        e.target.style.background = 'transparent'
                        e.target.style.borderColor = 'transparent'
                    }}
                />
            </div>
        )
    }

    const InlineTextarea = ({ name, value, placeholder }: any) => {
        return (
            <textarea
                name={name}
                defaultValue={value}
                placeholder={placeholder}
                rows={2}
                onChange={() => setIsDirty(true)}
                style={{
                    background: 'transparent',
                    border: '1px solid transparent',
                    color: 'inherit',
                    fontFamily: 'inherit',
                    fontSize: 'inherit',
                    width: '100%',
                    padding: '0.4rem',
                    marginLeft: '-0.4rem',
                    borderRadius: '4px',
                    outline: 'none',
                    resize: 'none',
                    transition: 'all 0.2s',
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.5,
                    cursor: 'text'
                }}
                onFocus={(e) => {
                    e.target.style.background = 'rgba(255,255,255,0.05)'
                    e.target.style.borderColor = 'var(--primary)'
                }}
                onBlur={(e) => {
                    e.target.style.background = 'transparent'
                    e.target.style.borderColor = 'transparent'
                }}
            />
        )
    }

    // Assuming we might have related sales data later, but for now just showing profile Info
    // This provides a foundation for expansion (e.g., showing recent purchases)

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'flex-start', // Changed from center to prevent top cut-off
                justifyContent: 'center',
                zIndex: 1000,
                overflowY: 'auto',
                padding: '2rem'
            }}
            className="animate-fade-in"
            onMouseDown={(e) => { // Using onMouseDown to prevent selecting text triggering close
                if (e.target === e.currentTarget && !isDirty) onClose()
            }}
        >
            <div className="card animate-scale-in" style={{ width: '600px', padding: '2rem', margin: 'auto' }}>
                <form action={handleSubmit} ref={formRef}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                        <div style={{ flex: 1, marginRight: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ fontSize: '1.75rem', margin: 0, width: '100%' }}>
                                    <InlineInput name="name" value={customer.name} strong={true} placeholder={t.purchases.name} />
                                </div>
                            </div>
                            <div style={{ fontSize: '1rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                <InlineInput name="legal_name" value={customer.legal_name || ''} placeholder={t.purchases.legalName} />
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)', paddingLeft: '1rem' }}
                            className="hover-scale"
                        >
                            ×
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                        <div className="card" style={{ background: 'var(--surface-highlight)', padding: '1.5rem' }}>
                            <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {t.purchases.contactInfo}
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <InlineInput name="email" type="email" value={customer.email || ''} placeholder={t.purchases.email} icon="✉️" />
                                <InlineInput name="phone" type="tel" value={customer.phone || ''} placeholder={t.purchases.phone} icon="📞" />
                            </div>
                        </div>

                        <div className="card" style={{ background: 'var(--surface-highlight)', padding: '1.5rem' }}>
                            <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Account Details
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.purchases.rfc}</div>
                                    <InlineInput name="rfc" value={customer.rfc || ''} placeholder="RFC" />
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.purchases.address}</div>
                                    <InlineTextarea name="address" value={customer.address || ''} placeholder={t.purchases.address} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card" style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '1.5rem', marginBottom: '2rem' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>📝</span> {t.purchases.notes}
                        </h4>
                        <InlineTextarea name="notes" value={customer.notes || ''} placeholder="Notes..." />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
                        {isDirty ? (
                            <>
                                <button type="button" className="btn" onClick={() => { setIsDirty(false); formRef.current?.reset(); }}>
                                    {t.purchases.cancel}
                                </button>
                                <button type="submit" disabled={submitting} className="btn btn-primary">
                                    {submitting ? t.purchases.saving : t.purchases.saveCustomer}
                                </button>
                            </>
                        ) : (
                            <button type="button" className="btn" onClick={onClose} style={{ minWidth: '150px' }}>
                                Close
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    )
}
