'use client'

import React, { useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { updateSale } from '../actions'

interface Sale {
    id: string
    sold_at: string
    item_name: string
    quantity: number
    tax_amount: number | null
    tax_rate: number | null
    total_price: number | null
    note: string | null
    customers?: {
        name: string
    } | null
}

interface SaleDetailsModalProps {
    sale: Sale
    onClose: () => void
    onUpdate?: () => void
}

export default function SaleDetailsModal({ sale, onClose, onUpdate }: SaleDetailsModalProps) {
    const { t } = useTranslation()
    const [submitting, setSubmitting] = useState(false)
    const [isDirty, setIsDirty] = useState(false)
    const formRef = React.useRef<HTMLFormElement>(null)

    // Calculate initial values
    const subtotal = sale.total_price || 0
    const tax = sale.tax_amount || 0
    const total = subtotal + tax

    const handleSubmit = async (formData: FormData) => {
        setSubmitting(true)
        await updateSale(sale.id, null, formData)
        setSubmitting(false)
        setIsDirty(false)
        if (onUpdate) onUpdate()
    }

    const InlineInput = ({ name, value, placeholder, type = "text", strong = false, icon = null, step }: any) => {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: icon ? '0.75rem' : 0 }}>
                {icon && <span style={{ fontSize: '1.2rem' }}>{icon}</span>}
                <input
                    name={name}
                    type={type}
                    defaultValue={value}
                    placeholder={placeholder}
                    step={step}
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
                alignItems: 'flex-start',
                justifyContent: 'center',
                zIndex: 1000,
                overflowY: 'auto',
                padding: '2rem'
            }}
            className="animate-fade-in"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget && !isDirty) onClose()
            }}
        >
            <div className="card animate-scale-in" style={{ width: '600px', padding: '2rem', margin: 'auto' }}>
                <form action={handleSubmit} ref={formRef}>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                        <div style={{ flex: 1, marginRight: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <span style={{ padding: '0.2rem 0.6rem', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
                                    {t.sales.saleLabel || 'SALE'}
                                </span>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                    {new Date(sale.sold_at).toLocaleString()}
                                </span>
                            </div>

                            <h3 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700, color: 'var(--foreground)' }}>
                                {sale.item_name}
                            </h3>
                            <div style={{ fontSize: '1rem', color: 'var(--primary)', marginTop: '0.25rem' }}>
                                {sale.customers?.name ? sale.customers.name : <span style={{ opacity: 0.5 }}>{t.sales.noCustomer || 'No Customer Specified'}</span>}
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
                        <div className="card hover-bg" style={{ background: 'var(--surface-highlight)', padding: '1.5rem', transition: 'all 0.2s' }}>
                            <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {t.sales.details || 'Details'}
                            </h4>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.sales.qty}</div>
                                    <div style={{ fontSize: '1.2rem' }}>
                                        <InlineInput name="quantity" type="number" value={sale.quantity} strong={true} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card hover-bg" style={{ background: 'var(--surface-highlight)', padding: '1.5rem', transition: 'all 0.2s' }}>
                            <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {t.sales.paymentInfo || 'Payment Info'}
                            </h4>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Subtotal</div>
                                    <div style={{ width: '100px', textAlign: 'right' }}>
                                        <InlineInput name="total_price" type="number" step="0.01" value={subtotal} strong={true} />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tax</div>
                                    <div style={{ width: '100px', textAlign: 'right' }}>
                                        <InlineInput name="tax_amount" type="number" step="0.01" value={tax} strong={true} />
                                    </div>
                                </div>
                                <div style={{ height: '1px', background: 'var(--border)', margin: '0.25rem 0' }}></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--success)', fontWeight: 700, fontSize: '1.1rem' }}>
                                    <div>Total</div>
                                    <div>${total.toFixed(2)}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card hover-bg" style={{ background: 'rgba(56, 189, 248, 0.05)', border: '1px solid rgba(56, 189, 248, 0.2)', padding: '1.5rem', marginBottom: '2rem', transition: 'all 0.2s' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>📝</span> {t.sales.note}
                        </h4>
                        <InlineTextarea name="note" value={sale.note || ''} placeholder="Add a note..." />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
                        {isDirty ? (
                            <>
                                <button type="button" className="btn" onClick={() => { setIsDirty(false); formRef.current?.reset(); }}>
                                    {t.purchases.cancel}
                                </button>
                                <button type="submit" disabled={submitting} className="btn btn-primary">
                                    {submitting ? t.purchases.saving || 'Saving...' : t.sales.saveSale || 'Save Sale'}
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
