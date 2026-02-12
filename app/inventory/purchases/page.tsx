
import { createClient } from '@/utils/supabase/server'
import PurchasesList from './PurchasesList'
import PurchasesHeader from './PurchasesHeader'

export default async function PurchasesPage() {
    const supabase = await createClient()

    // Fetch purchases with suppliers
    const { data: purchases, error } = await supabase
        .from('purchases')
        .select('*, suppliers(name)')
        .order('created_at', { ascending: false })

    return (
        <div className="container animate-slide-up" style={{ paddingBottom: '4rem' }}>
            <PurchasesHeader />
            <PurchasesList purchases={purchases || []} />
        </div>
    )
}
