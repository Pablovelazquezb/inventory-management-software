'use client'

import { createBatchItems } from '../actions'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AddItemPage() {
    const router = useRouter()
    const [categories, setCategories] = useState<any[]>([])
    const [subcategories, setSubcategories] = useState<any[]>([])

    // Form State
    const [selectedCategory, setSelectedCategory] = useState<string>('')
    const [filteredSubcategories, setFilteredSubcategories] = useState<any[]>([])

    const [isPending, setIsPending] = useState(false)
    const [error, setError] = useState('')

    // Common Inputs
    const [formData, setFormData] = useState({
        // name: '', // Removed Group Name
        category: '',
        subcategory_id: '',
        price: '',
        unit_type: 'unit',
        description: ''
    })

    // Image Upload State
    const [uploading, setUploading] = useState(false)
    const [defaultImageUrl, setDefaultImageUrl] = useState('')

    // Batch Mode State (Always Active)
    const [batchCount, setBatchCount] = useState(1)
    const [variants, setVariants] = useState<any[]>([])

    // ... existing useEffects ...

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true)
            const file = e.target.files?.[0]
            if (!file) return

            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
            const filePath = `${fileName}`

            const supabase = createClient()
            const { error: uploadError } = await supabase.storage
                .from('product-images')
                .upload(filePath, file)

            if (uploadError) {
                throw uploadError
            }

            const { data: { publicUrl } } = supabase.storage
                .from('product-images')
                .getPublicUrl(filePath)

            setDefaultImageUrl(publicUrl)
        } catch (error: any) {
            console.error('Error uploading image:', error)
            setError('Error uploading image: ' + error.message)
        } finally {
            setUploading(false)
        }
    }

    const handleGenerateVariants = () => {
        const count = Math.max(1, batchCount)
        const newVariants = Array(count).fill(null).map(() => ({
            id: '',
            name: '',
            price: '',
            weight: '',
            quantity: '1',
            image_url: defaultImageUrl // Use uploaded image
        }))
        setVariants(newVariants)
    }

    const updateVariant = (index: number, field: string, value: string) => {
        const newVariants = [...variants]
        newVariants[index] = { ...newVariants[index], [field]: value }
        setVariants(newVariants)
    }

    const removeVariant = (index: number) => {
        setVariants(variants.filter((_, i) => i !== index))
    }

    const addVariant = () => {
        setVariants([...variants, { id: '', name: '', price: '', weight: '', quantity: '1', image_url: defaultImageUrl }])
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsPending(true)
        setError('')

        const submitData = new FormData()
        // submitData.append('name', formData.name) // Removed Group Name
        submitData.append('category', formData.category)
        submitData.append('subcategory_id', formData.subcategory_id)
        submitData.append('price', formData.price)
        submitData.append('unit_type', formData.unit_type)
        submitData.append('description', formData.description)

        submitData.append('variants', JSON.stringify(variants))
        const result = await createBatchItems(null, submitData)
        if (result?.error) setError(result.error)

        setIsPending(false)
    }

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '4rem' }}>
            {/* ... Header ... */}
            <div style={{ marginBottom: '2rem' }}>
                <Link href="/inventory" className="btn" style={{ paddingLeft: 0, color: 'rgba(248,250,252,0.6)' }}>
                    ← Back to Inventory
                </Link>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Add New Items</h2>
                </div>
            </div>

            <div className="card">
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Image Upload Section */}
                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'start' }}>
                        <div style={{ width: '150px', height: '150px', borderRadius: '12px', border: '2px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative', background: 'rgba(255,255,255,0.02)' }}>
                            {uploading ? (
                                <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>Uploading...</span>
                            ) : defaultImageUrl ? (
                                <img src={defaultImageUrl} alt="Product" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <span style={{ fontSize: '2rem', opacity: 0.2 }}>📷</span>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label className="text-md" style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.8 }}>Product Image</label>
                            <p style={{ fontSize: '0.85rem', opacity: 0.5, lineHeight: '1.4' }}>
                                Click the box to upload an image from your computer.
                                <br />This image will be applied to all generated variants.
                            </p>
                        </div>
                    </div>

                    <hr style={{ borderColor: 'var(--border)', opacity: 0.3 }} />

                    {/* Common Fields Row 1 */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        {/* ... Category ... */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
                                <label className="text-md" style={{ display: 'block', opacity: 0.8 }}>Category</label>
                                <Link href="/inventory/categories" style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>Manage</Link>
                            </div>
                            <select className="input" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} required>
                                <option value="" disabled>Select a category</option>
                                <option value="Uncategorized">Uncategorized</option>
                                {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-md" style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.8 }}>Subcategory <span style={{ fontSize: '0.7em', paddingLeft: '4px', opacity: 0.6 }}>(Optional)</span></label>
                            <select className="input" value={formData.subcategory_id} onChange={e => setFormData({ ...formData, subcategory_id: e.target.value })} disabled={!selectedCategory || filteredSubcategories.length === 0}>
                                <option value="">Select subcategory</option>
                                {filteredSubcategories.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Common Fields Row 2 */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div>
                            <label className="text-md" style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.8 }}>
                                Default Price ($)
                            </label>
                            <input className="input" type="number" step="0.01" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} placeholder="0.00" />
                        </div>
                        <div>
                            <label className="text-md" style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.8 }}>Unit Type</label>
                            <select className="input" value={formData.unit_type} onChange={e => setFormData({ ...formData, unit_type: e.target.value })}>
                                <option value="unit">Units (pcs)</option>
                                <option value="kg">Kilograms (kg)</option>
                            </select>
                        </div>
                    </div>

                    {/* Variants Section (Always Visible) */}
                    <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                            <label className="text-md" style={{ opacity: 0.8 }}>Generate Item Slots</label>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <input
                                    className="input"
                                    type="number"
                                    min="1"
                                    value={batchCount}
                                    onChange={e => setBatchCount(parseInt(e.target.value) || 1)}
                                    style={{ width: '100px' }}
                                />
                                <button
                                    type="button"
                                    onClick={handleGenerateVariants}
                                    className="btn btn-primary"
                                >
                                    Generate
                                </button>
                            </div>
                        </div>

                        {variants.length > 0 && (
                            <div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr 1fr 1fr 40px', gap: '1rem', marginBottom: '0.5rem', opacity: 0.6, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    <div>ID (Opt)</div>
                                    <div>Name</div>
                                    <div>Price ($)</div>
                                    <div>Quantity</div>
                                    <div>Weight (kg)</div>
                                    <div></div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {variants.map((v, i) => (
                                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr 1fr 1fr 40px', gap: '1rem', alignItems: 'center' }}>
                                            <input
                                                className="input"
                                                value={v.id || ''}
                                                onChange={e => updateVariant(i, 'id', e.target.value)}
                                                placeholder="Auto"
                                                style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
                                            />
                                            <input
                                                className="input"
                                                value={v.name || ''}
                                                onChange={e => updateVariant(i, 'name', e.target.value)}
                                                placeholder="Item name"
                                                required
                                            />
                                            <input
                                                className="input"
                                                type="number"
                                                step="0.01"
                                                value={v.price}
                                                onChange={e => updateVariant(i, 'price', e.target.value)}
                                                placeholder={formData.price || "Price"}
                                            />
                                            <input
                                                className="input"
                                                type="number"
                                                step="any"
                                                value={v.quantity}
                                                onChange={e => updateVariant(i, 'quantity', e.target.value)}
                                                required
                                                placeholder="Qty"
                                            />
                                            <input
                                                className="input"
                                                type="number"
                                                step="0.01"
                                                value={v.weight}
                                                onChange={e => updateVariant(i, 'weight', e.target.value)}
                                                placeholder="0.00 kg"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeVariant(i)}
                                                style={{ color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                                            >
                                                &times;
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    type="button"
                                    onClick={addVariant}
                                    style={{ marginTop: '1rem', background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.875rem' }}
                                >
                                    + Add one more
                                </button>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="text-md" style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.8 }}>Description</label>
                        <textarea className="input" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={3} placeholder="Common description..." style={{ resize: 'vertical' }} />
                    </div>

                    {error && <p style={{ color: 'var(--error)', textAlign: 'center' }}>{error}</p>}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem' }}>
                        <button disabled={isPending || variants.length === 0} className="btn btn-primary" style={{ minWidth: '150px' }}>
                            {isPending ? 'Saving...' : `Create ${variants.length} Items`}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    )
}
