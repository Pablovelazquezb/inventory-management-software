
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import SalesList from './SalesList'
import SalesHeader from './SalesHeader'

export default async function SalesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/auth/login')

    const { data: sales } = await supabase
        .from('sales')
        .select('*, customers(name)')
        .order('sold_at', { ascending: false })

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
            <SalesHeader />
            <SalesList sales={sales || []} />
        </div>
    )
}
