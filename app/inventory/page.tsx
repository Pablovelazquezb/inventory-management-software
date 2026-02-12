
import { createClient } from '@/utils/supabase/server'
import InventoryList from './InventoryList'
import InventoryHeader from './InventoryHeader'

export default async function InventoryPage() {
    const supabase = await createClient()

    const { data: items, error } = await supabase
        .from('inventory_items')
        .select(`
            *,
            subcategories (
                name
            )
        `)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching inventory:', error)
    }

    return (
        <div>
            <InventoryHeader />
            <InventoryList initialItems={items || []} />
        </div>
    )
}
