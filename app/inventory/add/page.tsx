'use client'

import { createBatchItems } from '../actions'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'

export default function AddItemPage() {
    const { t } = useTranslation()
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
        description: ''
    })

    // Image Upload State
    const [uploadingVariants, setUploadingVariants] = useState<{ [key: number]: boolean }>({})

    // Batch Mode State (Always Active)
    const [batchCount, setBatchCount] = useState(1)
    const [variants, setVariants] = useState<any[]>([])

    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient()
            const { data: catData } = await supabase.from('categories').select('*').order('name')
            const { data: subData } = await supabase.from('subcategories').select('*').order('name')
            if (catData) setCategories(catData)
            if (subData) setSubcategories(subData)
        }
        fetchData()
    }, [])

    useEffect(() => {
        if (selectedCategory) {
            setFormData(prev => ({ ...prev, category: selectedCategory, subcategory_id: '' }))
            const catObj = categories.find(c => c.name === selectedCategory)
            if (catObj) {
                setFilteredSubcategories(subcategories.filter(s => s.category_id === catObj.id))
            } else {
                setFilteredSubcategories([])
            }
        } else {
            setFilteredSubcategories([])
        }
    }, [selectedCategory, categories, subcategories])

    const handleImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploadingVariants(prev => ({ ...prev, [index]: true }))
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

            updateVariant(index, 'image_url', publicUrl)
        } catch (error: any) {
            console.error('Error uploading image:', error)
            setError('Error uploading image: ' + error.message)
        } finally {
            setUploadingVariants(prev => ({ ...prev, [index]: false }))
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
            image_url: ''
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
        setVariants([...variants, { id: '', name: '', price: '', weight: '', quantity: '1', image_url: '' }])
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsPending(true)
        setError('')

        const submitData = new FormData()
        // submitData.append('name', formData.name) // Removed Group Name
        submitData.append('category', formData.category)
        submitData.append('subcategory_id', formData.subcategory_id)
        submitData.append('description', formData.description)

        // Use variants prices and units
        submitData.append('unit_type', 'unit') // Can be overridden per variant in future if needed

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
                    {t.inventory.backToInventory}
                </Link>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.875rem', fontWeight: 700 }}>{t.inventory.addHeader}</h2>
                </div>
            </div>

            <div className="card">
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Removed Global Image Upload */}

                    {/* Common Fields Row 1 */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        {/* ... Category ... */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
                                <label className="text-md" style={{ display: 'block', opacity: 0.8 }}>{t.inventory.category}</label>
                                <Link href="/inventory/categories" style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>{t.inventory.manage}</Link>
                            </div>
                            <select className="input" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} required>
                                <option value="" disabled>{t.inventory.selectCategory}</option>
                                <option value="Uncategorized">{t.inventory.uncategorized}</option>
                                {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-md" style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.8 }}>{t.inventory.subcategory} <span style={{ fontSize: '0.7em', paddingLeft: '4px', opacity: 0.6 }}>{t.inventory.optional}</span></label>
                            <select className="input" value={formData.subcategory_id} onChange={e => setFormData({ ...formData, subcategory_id: e.target.value })} disabled={!selectedCategory || filteredSubcategories.length === 0}>
                                <option value="">{t.inventory.selectSubcategory}</option>
                                {filteredSubcategories.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Removed Common Fields Row 2 (Price & Unit Type) */}

                    {/* Variants Section (Always Visible) */}
                    <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                            <label className="text-md" style={{ opacity: 0.8 }}>{t.inventory.generateSlots}</label>
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
                                    {t.inventory.generate}
                                </button>
                            </div>
                        </div>

                        {variants.length > 0 && (
                            <div>
                                <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1.5fr 1fr 1fr 1fr 40px', gap: '1rem', marginBottom: '0.5rem', opacity: 0.6, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    <div>📷</div>
                                    <div>{t.inventory.idOpt}</div>
                                    <div>{t.inventory.name}</div>
                                    <div>{t.inventory.price} ($)</div>
                                    <div>{t.inventory.quantity}</div>
                                    <div>{t.inventory.weight} (kg)</div>
                                    <div></div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {variants.map((v, i) => (
                                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1.5fr 1fr 1fr 1fr 40px', gap: '1rem', alignItems: 'center' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '8px', border: '1px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative', background: 'var(--surface)' }}>
                                                {uploadingVariants[i] ? (
                                                    <span style={{ fontSize: '0.6rem', opacity: 0.7 }}>...</span>
                                                ) : v.image_url ? (
                                                    <img src={v.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <span style={{ fontSize: '1rem', opacity: 0.3 }}>+</span>
                                                )}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleImageUpload(i, e)}
                                                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                                                    title={t.inventory.uploading}
                                                />
                                            </div>
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
                                                placeholder={t.inventory.itemNamePlaceholder}
                                                required
                                            />
                                            <input
                                                className="input"
                                                type="number"
                                                step="0.01"
                                                value={v.price}
                                                onChange={e => updateVariant(i, 'price', e.target.value)}
                                                placeholder={"0.00"}
                                                required
                                            />
                                            <input
                                                className="input"
                                                type="number"
                                                step="any"
                                                value={v.quantity}
                                                onChange={e => updateVariant(i, 'quantity', e.target.value)}
                                                required
                                                placeholder={t.inventory.qtyPlaceholder}
                                            />
                                            <input
                                                className="input"
                                                type="number"
                                                step="0.01"
                                                value={v.weight}
                                                onChange={e => updateVariant(i, 'weight', e.target.value)}
                                                placeholder={`0.00 ${t.inventory.kg}`}
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
                                    {t.inventory.addOneMore}
                                </button>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="text-md" style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.8 }}>{t.inventory.description}</label>
                        <textarea className="input" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={3} placeholder={t.inventory.commonDescription} style={{ resize: 'vertical' }} />
                    </div>

                    {error && <p style={{ color: 'var(--error)', textAlign: 'center' }}>{error}</p>}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem' }}>
                        <button disabled={isPending || variants.length === 0} className="btn btn-primary" style={{ minWidth: '150px' }}>
                            {isPending ? t.inventory.saving : `${t.inventory.createItems} (${variants.length})`}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    )
}
