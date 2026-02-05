'use client'

import { createClient } from '@/utils/supabase/client'
import { createPurchase } from '../actions' // Corrected import

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function NewPurchasePage() {
    const router = useRouter()
    const [items, setItems] = useState<any[]>([]) // Inventory items for selection
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)

    // Form State
    const [supplierName, setSupplierName] = useState('')
    const [note, setNote] = useState('')
    const [invoiceUrl, setInvoiceUrl] = useState('')
    const [lines, setLines] = useState<any[]>([
        { item_id: '', quantity: '', price_per_unit: '', unit_type: 'unit' } // Default one line
    ])

    useEffect(() => {
        async function fetchItems() {
            const supabase = createClient()
            const { data } = await supabase.from('inventory_items').select('id, name, unit_type, price')
            if (data) setItems(data)
            setLoading(false)
        }
        fetchItems()
    }, [])

    const handleLineChange = (index: number, field: string, value: any) => {
        const newLines = [...lines]
        newLines[index][field] = value

        // Auto-set unit type/price if item changes
        if (field === 'item_id') {
            const item = items.find(i => i.id === value)
            if (item) {
                newLines[index].unit_type = item.unit_type || 'unit'
                newLines[index].price_per_unit = item.price || ''
            }
        }
        setLines(newLines)
    }

    const addLine = () => {
        setLines([...lines, { item_id: '', quantity: '', price_per_unit: '', unit_type: 'unit' }])
    }

    const removeLine = (index: number) => {
        setLines(lines.filter((_, i) => i !== index))
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return

        const file = e.target.files[0]
        setUploading(true)

        const supabase = createClient()
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage.from('documents').upload(filePath, file)

        if (uploadError) {
            alert('Error uploading: ' + uploadError.message)
            setUploading(false)
            return
        }

        const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(filePath)
        setInvoiceUrl(publicUrl)
        setUploading(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const formData = new FormData()
        formData.append('supplier_name', supplierName)
        formData.append('note', note)
        formData.append('invoice_url', invoiceUrl)

        // Filter out empty lines
        const validLines = lines.filter(l => l.item_id && l.quantity)
        formData.append('items', JSON.stringify(validLines))

        // Call server action dynamically imported or we can just fetch
        // For now, let's use the standard fetch or import.
        // Importing server action in client component.
        // We need to import it at top.
        // Let's assume createPurchase is available.

        const { createPurchase } = await import('../actions')
        const result = await createPurchase(null, formData)

        if (result?.error) {
            alert(result.error)
        }
    }

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <Link href="/inventory/purchases" style={{ fontSize: '0.875rem', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    ← Back to Purchases
                </Link>
                <h2 style={{ fontSize: '1.875rem', fontWeight: 700 }}>New Purchase Order</h2>
            </div>

            <div className="card">
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Header Info */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div>
                            <label className="label">Supplier Name</label>
                            <input className="input" value={supplierName} onChange={e => setSupplierName(e.target.value)} required placeholder="e.g. Vendor Corp" />
                        </div>
                        <div>
                            <label className="label">Invoice / PO (PDF/XML)</label>
                            <input type="file" className="input" onChange={handleFileUpload} accept=".pdf,.xml,.jpg,.png" />
                            {uploading && <span style={{ fontSize: '0.8em', color: 'var(--primary)' }}>Uploading...</span>}
                            {invoiceUrl && <span style={{ fontSize: '0.8em', color: 'var(--success)' }}>✓ Attached</span>}
                        </div>
                    </div>

                    <div>
                        <label className="label">Note</label>
                        <textarea className="input" value={note} onChange={e => setNote(e.target.value)} rows={2} placeholder="Optional notes..." />
                    </div>

                    <hr style={{ borderColor: 'var(--border)', opacity: 0.5 }} />

                    {/* Items */}
                    <div>
                        <label className="label" style={{ marginBottom: '1rem', display: 'block' }}>Items</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {lines.map((line, index) => (
                                <div key={index} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr 40px', gap: '1rem', alignItems: 'end' }}>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', opacity: 0.6, marginBottom: '4px', display: index === 0 ? 'block' : 'none' }}>Item</label>
                                        <select className="input" value={line.item_id} onChange={e => handleLineChange(index, 'item_id', e.target.value)} required>
                                            <option value="">Select Item...</option>
                                            {items.map(i => (
                                                <option key={i.id} value={i.id}>{i.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', opacity: 0.6, marginBottom: '4px', display: index === 0 ? 'block' : 'none' }}>Qty</label>
                                        <input type="number" step="any" className="input" value={line.quantity} onChange={e => handleLineChange(index, 'quantity', e.target.value)} required />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', opacity: 0.6, marginBottom: '4px', display: index === 0 ? 'block' : 'none' }}>Unit</label>
                                        <select className="input" value={line.unit_type} onChange={e => handleLineChange(index, 'unit_type', e.target.value)}>
                                            <option value="unit">Units</option>
                                            <option value="kg">Kg</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', opacity: 0.6, marginBottom: '4px', display: index === 0 ? 'block' : 'none' }}>Cost ($)</label>
                                        <input type="number" step="0.01" className="input" value={line.price_per_unit} onChange={e => handleLineChange(index, 'price_per_unit', e.target.value)} required placeholder="Unit Cost" />
                                    </div>
                                    <button type="button" onClick={() => removeLine(index)} style={{ color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer', paddingBottom: '0.5rem' }}>✕</button>
                                </div>
                            ))}
                        </div>
                        <button type="button" onClick={addLine} style={{ marginTop: '1rem', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}>+ Add details</button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <Link href="/inventory/purchases" className="btn" style={{ background: 'transparent', border: '1px solid var(--border)' }}>Cancel</Link>
                        <button type="submit" className="btn btn-primary" disabled={uploading}>Create Order</button>
                    </div>

                </form>
            </div>
        </div>
    )
}
