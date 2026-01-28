
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import InventoryList from './InventoryList'

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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Inventory</h2>
                <Link href="/inventory/add" className="btn btn-primary">
                    Add New Item
                </Link>
            </div>

            <InventoryList initialItems={items || []} />
        </div>
    )
}
