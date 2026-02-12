
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import EditItemForm from './EditItemForm'
import EditItemHeader from './EditItemHeader'

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
            <EditItemHeader />

            <EditItemForm
                item={item}
                categories={categories || []}
                subcategories={subcategories || []}
            />
        </div>
    )
}
