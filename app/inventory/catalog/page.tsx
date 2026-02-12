'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { createCatalogItem, deleteCatalogItem } from '../actions'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'

export default function CatalogPage() {
    const { t } = useTranslation()
    const searchParams = useSearchParams()
    const initialSupplierId = searchParams.get('supplier_id') || ''

    const [products, setProducts] = useState<any[]>([])
    const [suppliers, setSuppliers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedSupplier, setSelectedSupplier] = useState(initialSupplierId)

    useEffect(() => {
        if (initialSupplierId) setSelectedSupplier(initialSupplierId)
        fetchData()
    }, [initialSupplierId])

    const fetchData = async () => {
        const supabase = createClient()

        // Fetch Suppliers
        const { data: sups } = await supabase.from('suppliers').select('id, name').order('name')
        if (sups) setSuppliers(sups)

        // Fetch Catalog
        const { data: prods, error } = await supabase
            .from('supplier_products')
            .select(`
                *,
                suppliers (name)
            `)
            .order('name')

        if (error) {
            console.error('Error fetching catalog:', error)
        } // Log error but don't crash if table doesn't exist yet (might happen before migration)

        if (prods) setProducts(prods)
        setLoading(false)
    }

    const handleDelete = async (id: string) => {
        if (!confirm(t.catalog.confirmDelete)) return
        await deleteCatalogItem(id)
        fetchData()
    }

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.supplier_sku && p.supplier_sku.toLowerCase().includes(searchTerm.toLowerCase()))
        const matchesSupplier = selectedSupplier ? p.supplier_id === selectedSupplier : true
        return matchesSearch && matchesSupplier
    })

    const Modal = () => (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} className="animate-fade-in">
            <div className="card animate-scale-in" style={{ width: '500px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
                <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.5rem' }}>{t.catalog.addTitle}</h3>
                <form action={async (formData) => {
                    setSubmitting(true)
                    const res = await createCatalogItem(null, formData)
                    setSubmitting(false)
                    if (res?.error) {
                        alert(res.error)
                    } else {
                        setShowModal(false)
                        fetchData()
                    }
                }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'rgba(248,250,252,0.7)' }}>{t.catalog.supplier}</label>
                            <select name="supplier_id" className="input" required defaultValue="">
                                <option value="" disabled>{t.catalog.selectSupplier}</option>
                                {suppliers.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'rgba(248,250,252,0.7)' }}>{t.catalog.supplierSku}</label>
                            <input name="supplier_sku" className="input" placeholder={t.catalog.optional} />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'rgba(248,250,252,0.7)' }}>{t.catalog.productName}</label>
                        <input name="name" className="input" required placeholder={t.catalog.itemNamePlaceholder} />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'rgba(248,250,252,0.7)' }}>{t.catalog.cost}</label>
                        <input name="cost" type="number" step="0.01" className="input" placeholder="0.00" />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'rgba(248,250,252,0.7)' }}>{t.catalog.description}</label>
                        <textarea name="description" className="input" rows={3} placeholder={t.catalog.detailsPlaceholder} />
                    </div>

                    {/* Simple Image URL input for now, or file upload? 
                        The action expects 'image_url' as string. 
                        Let's use a file upload that sets a hidden input, similar to EditItemForm, 
                        BUT for simplicity in this modal, let's just use text URL or skip image upload 
                        in the quick add modal, or implement the full upload logic.
                        Let's implement the upload logic! 
                    */}
                    <ImageUploadField />

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
                        <button type="button" onClick={() => setShowModal(false)} className="btn" style={{ background: 'transparent', color: 'rgba(248,250,252,0.6)' }}>{t.catalog.cancel}</button>
                        <button type="submit" disabled={submitting} className="btn btn-primary">{submitting ? t.catalog.saving : t.catalog.save}</button>
                    </div>
                </form>
            </div>
        </div>
    )

    return (
        <div className="container animate-slide-up" style={{ paddingBottom: '4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                        <Link href="/inventory" className="btn" style={{ paddingLeft: 0, color: 'rgba(248,250,252,0.6)', padding: '0' }}>
                            {t.catalog.backToInventory}
                        </Link>
                        <span style={{ opacity: 0.3 }}>/</span>
                        <span style={{ opacity: 0.8 }}>{t.sidebar.catalog}</span>
                    </div>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0, background: 'linear-gradient(to right, #f8fafc, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{t.catalog.title}</h2>
                </div>
                <button onClick={() => setShowModal(true)} className="btn btn-primary">
                    {t.catalog.addProduct}
                </button>
            </div>

            <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
                <input
                    className="input"
                    placeholder={t.catalog.searchPlaceholder}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    style={{ flex: 1 }}
                />
                <select
                    className="input"
                    style={{ width: '200px' }}
                    value={selectedSupplier}
                    onChange={e => setSelectedSupplier(e.target.value)}
                >
                    <option value="">{t.catalog.allSuppliers}</option>
                    {suppliers.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem', opacity: 0.5 }}>{t.catalog.loading}</div>
            ) : (
                <div className="grid-responsive" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    {filteredProducts.map((p, i) => (
                        <div key={p.id} className="card hover-scale" style={{ padding: '0', overflow: 'hidden', animation: `fadeIn 0.3s ease-out ${i * 0.05}s forwards`, opacity: 0, display: 'flex', flexDirection: 'column' }}>
                            <div style={{ height: '160px', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid var(--border)', position: 'relative' }}>
                                {p.image_url ? (
                                    <img src={p.image_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <span style={{ fontSize: '3rem', opacity: 0.1 }}>📦</span>
                                )}
                                <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                                    <button
                                        onClick={() => handleDelete(p.id)}
                                        style={{ background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>
                            <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--primary)', marginBottom: '0.25rem' }}>
                                    {p.suppliers?.name || t.catalog.unknownSupplier}
                                </div>
                                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{p.name}</h3>
                                {p.supplier_sku && (
                                    <div style={{ fontSize: '0.8rem', opacity: 0.5, marginBottom: '1rem' }}>SKU: {p.supplier_sku}</div>
                                )}

                                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>
                                        {p.cost ? `$${p.cost}` : <span style={{ opacity: 0.3, fontSize: '0.9rem' }}>No cost</span>}
                                    </div>
                                    {/* Link to edit or other actions? */}
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredProducts.length === 0 && (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', opacity: 0.5 }}>
                            {t.catalog.noProducts}
                        </div>
                    )}
                </div>
            )}

            {showModal && <Modal />}
        </div>
    )
}

function ImageUploadField() {
    const { t } = useTranslation()
    const [uploading, setUploading] = useState(false)
    const [imageUrl, setImageUrl] = useState('')

    // We need to use a Ref or just manage state and put it in a hidden input?
    // Since this component is inside the form, a hidden input is perfect.

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        try {
            const { createClient } = await import('@/utils/supabase/client')
            const supabase = createClient()

            const fileExt = file.name.split('.').pop()
            const fileName = `catalog-${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from('product-images') // Reuse existing bucket
                .upload(fileName, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('product-images')
                .getPublicUrl(fileName)

            setImageUrl(publicUrl)
        } catch (error) {
            console.error(error)
            alert(t.catalog.errorUploading)
        } finally {
            setUploading(false)
        }
    }

    return (
        <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'rgba(248,250,252,0.7)' }}>{t.catalog.image}</label>
            <input type="hidden" name="image_url" value={imageUrl} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {imageUrl ? (
                        <img src={imageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <span style={{ fontSize: '1.5rem', opacity: 0.2 }}>📷</span>
                    )}
                </div>
                <div>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleUpload}
                        style={{ fontSize: '0.8rem' }}
                        disabled={uploading}
                    />
                    {uploading && <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{t.catalog.uploading}</div>}
                </div>
            </div>
        </div>
    )
}
