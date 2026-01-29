
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import EditItemForm from './EditItemForm'

export default async function EditItemPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    const { data: item, error } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('id', id)
        .single()

    if (error || !item) {
        redirect('/inventory')
    }

    const { data: categories } = await supabase.from('categories').select('*').order('name', { ascending: true })
    const { data: subcategories } = await supabase.from('subcategories').select('*').order('name', { ascending: true })

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <Link href="/inventory" style={{ fontSize: '0.875rem', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    ← Back to Inventory
                </Link>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Edit Item</h2>
                </div>
            </div>

            <EditItemForm
                item={item}
                categories={categories || []}
                subcategories={subcategories || []}
            />
        </div>
    )
}
