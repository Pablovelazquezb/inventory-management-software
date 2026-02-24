'use client'

import { useActionState, useEffect, useState } from 'react'
import { createCategory, deleteCategory, createSubcategory, deleteSubcategory, updateCategory, updateSubcategory } from '../actions'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'

const initialState = { error: '' }

// ─── Shared style tokens ─────────────────────────────────────
const card: React.CSSProperties = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '14px',
    overflow: 'hidden',
}
const sectionHeader: React.CSSProperties = {
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid var(--border)',
    fontSize: '1rem',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
}
const rowStyle: React.CSSProperties = {
    padding: '1rem 1.5rem',
    borderBottom: '1px solid var(--border)',
    background: 'transparent',
    transition: 'background 0.15s',
}
// Subcategory pill — clearly visible in both themes
const subPill: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.3rem 0.75rem',
    borderRadius: '999px',
    background: 'rgba(99,102,241,0.12)',
    border: '1px solid rgba(99,102,241,0.3)',
    color: 'var(--foreground)',
    fontSize: '0.8rem',
    fontWeight: 500,
}
const addSubBtn: React.CSSProperties = {
    padding: '0.3rem 0.75rem',
    borderRadius: '999px',
    border: '1px solid var(--primary)',
    background: 'transparent',
    color: 'var(--primary)',
    fontSize: '0.78rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.15s, color 0.15s',
}
const deleteBtn: React.CSSProperties = {
    padding: '0.3rem 0.625rem',
    borderRadius: '6px',
    border: '1px solid rgba(239,68,68,0.3)',
    background: 'rgba(239,68,68,0.08)',
    color: 'var(--error)',
    fontSize: '0.78rem',
    fontWeight: 600,
    cursor: 'pointer',
}
// ─────────────────────────────────────────────────────────────

export default function CategoriesPage() {
    const [createCatState, createCatAction, isCatPending] = useActionState(createCategory, initialState)
    const [createSubState, createSubAction, isSubPending] = useActionState(createSubcategory, initialState)

    const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null)
    const [editingCatId, setEditingCatId] = useState<string | null>(null)
    const [editingSubId, setEditingSubId] = useState<string | null>(null)
    const [renameValue, setRenameValue] = useState('')
    const [categories, setCategories] = useState<any[]>([])
    const [subcategories, setSubcategories] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => { fetchData() }, [createCatState, createSubState])

    async function fetchData() {
        const supabase = createClient()
        const [{ data: cats }, { data: subs }] = await Promise.all([
            supabase.from('categories').select('*').order('created_at', { ascending: true }),
            supabase.from('subcategories').select('*').order('created_at', { ascending: true }),
        ])
        if (cats) setCategories(cats)
        if (subs) setSubcategories(subs)
        setLoading(false)
    }

    const handleUpdateCategory = async (id: string) => {
        await updateCategory(id, renameValue)
        setEditingCatId(null); setRenameValue(''); fetchData()
    }
    const handleUpdateSubcategory = async (id: string) => {
        await updateSubcategory(id, renameValue)
        setEditingSubId(null); setRenameValue(''); fetchData()
    }

    return (
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>

            {/* ── Page header ── */}
            <div style={{ marginBottom: '2rem' }}>
                <Link href="/inventory" style={{ fontSize: '0.85rem', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.75rem', textDecoration: 'none' }}>
                    ← Volver al Inventario
                </Link>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Categorías</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                    Organiza tu inventario con categorías y subcategorías.
                </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                {/* ── Add Category ── */}
                <div style={card}>
                    <div style={sectionHeader}>
                        <span>Nueva Categoría</span>
                    </div>
                    <div style={{ padding: '1.25rem 1.5rem' }}>
                        <form action={createCatAction} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                    Nombre
                                </label>
                                <input className="form-input" name="name" placeholder="ej. Ropa, Electrónicos..." required />
                            </div>
                            <button disabled={isCatPending} className="btn btn-primary" style={{ fontWeight: 600 }}>
                                {isCatPending ? 'Agregando...' : '+ Agregar'}
                            </button>
                        </form>
                        {createCatState?.error && (
                            <p style={{ color: 'var(--error)', fontSize: '0.85rem', marginTop: '0.5rem' }}>{createCatState.error}</p>
                        )}
                    </div>
                </div>

                {/* ── Categories List ── */}
                <div style={card}>
                    <div style={sectionHeader}>
                        <span>Categorías existentes</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                            {categories.length} {categories.length === 1 ? 'categoría' : 'categorías'}
                        </span>
                    </div>

                    {loading ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando...</div>
                    ) : categories.length === 0 ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                            No hay categorías. Crea la primera arriba.
                        </div>
                    ) : (
                        <div>
                            {categories.map((cat, i) => {
                                const catSubs = subcategories.filter(s => s.category_id === cat.id)
                                const isLast = i === categories.length - 1
                                return (
                                    <div key={cat.id} style={{ ...rowStyle, borderBottom: isLast ? 'none' : '1px solid var(--border)' }}>

                                        {/* Category row */}
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                                            {/* Name / rename */}
                                            {editingCatId === cat.id ? (
                                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flex: 1 }}>
                                                    <input
                                                        className="form-input"
                                                        value={renameValue}
                                                        onChange={e => setRenameValue(e.target.value)}
                                                        style={{ maxWidth: 220 }}
                                                        autoFocus
                                                    />
                                                    <button onClick={() => handleUpdateCategory(cat.id)} className="btn btn-primary" style={{ padding: '0.4rem 0.875rem', fontSize: '0.8rem' }}>Guardar</button>
                                                    <button onClick={() => setEditingCatId(null)} style={{ ...deleteBtn, background: 'transparent', border: '1px solid var(--border)', color: 'var(--foreground)' }}>×</button>
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{cat.name}</span>
                                                    <button
                                                        onClick={() => { setEditingCatId(cat.id); setRenameValue(cat.name) }}
                                                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', opacity: 0.45, padding: '0 0.25rem' }}
                                                        title="Renombrar"
                                                    >✏️</button>
                                                </div>
                                            )}

                                            {/* Actions */}
                                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
                                                <button
                                                    onClick={() => setActiveCategoryId(activeCategoryId === cat.id ? null : cat.id)}
                                                    style={addSubBtn}
                                                >
                                                    {activeCategoryId === cat.id ? '✕ Cancelar' : '+ Subcategoría'}
                                                </button>
                                                <form action={deleteCategory.bind(null, cat.id)}>
                                                    <button style={deleteBtn} title="Eliminar categoría">🗑</button>
                                                </form>
                                            </div>
                                        </div>

                                        {/* Add subcategory form */}
                                        {activeCategoryId === cat.id && (
                                            <div style={{ marginTop: '0.875rem', padding: '0.875rem', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '10px' }}>
                                                <form action={async (fd) => { await createSubAction(fd); setActiveCategoryId(null) }}
                                                    style={{ display: 'flex', gap: '0.625rem' }}>
                                                    <input type="hidden" name="category_id" value={cat.id} />
                                                    <input className="form-input" name="name" placeholder="Nombre de subcategoría" required style={{ flex: 1 }} autoFocus />
                                                    <button disabled={isSubPending} className="btn btn-primary" style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                                                        {isSubPending ? '...' : 'Agregar'}
                                                    </button>
                                                </form>
                                            </div>
                                        )}

                                        {/* Subcategories */}
                                        {catSubs.length > 0 && (
                                            <div style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                {catSubs.map(sub => (
                                                    <div key={sub.id} style={subPill}>
                                                        {editingSubId === sub.id ? (
                                                            <>
                                                                <input
                                                                    className="form-input"
                                                                    value={renameValue}
                                                                    onChange={e => setRenameValue(e.target.value)}
                                                                    style={{ padding: '0.1rem 0.375rem', width: 100, fontSize: '0.8rem', height: 'auto' }}
                                                                    autoFocus
                                                                />
                                                                <button onClick={() => handleUpdateSubcategory(sub.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#22c55e', fontWeight: 700 }}>✓</button>
                                                                <button onClick={() => setEditingSubId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span
                                                                    onClick={() => { setEditingSubId(sub.id); setRenameValue(sub.name) }}
                                                                    title="Click para renombrar"
                                                                    style={{ cursor: 'pointer' }}
                                                                >
                                                                    {sub.name}
                                                                </span>
                                                                <form action={deleteSubcategory.bind(null, sub.id)} style={{ display: 'inline' }}>
                                                                    <button
                                                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1, padding: 0, display: 'flex' }}
                                                                        title="Eliminar subcategoría"
                                                                    >×</button>
                                                                </form>
                                                            </>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {catSubs.length === 0 && activeCategoryId !== cat.id && (
                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.5rem', fontStyle: 'italic' }}>
                                                Sin subcategorías — haz click en "+ Subcategoría" para agregar.
                                            </p>
                                        )}

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
