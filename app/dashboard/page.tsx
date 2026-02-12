import { createClient } from '@/utils/supabase/server'
import KPIGrid from './KPIGrid'
import DashboardHeader from './DashboardHeader'
import RevenueChart from './RevenueChart'
import TopSellingList from './TopSellingList'

export default async function DashboardPage() {
    const supabase = await createClient()

    // 1. Fetch Sales
    const { data: sales, error } = await supabase
        .from('sales')
        .select('*')
        .order('sold_at', { ascending: false })
        .limit(1000)

    // 2. Fetch Stock Entries count
    const { count: entriesCount } = await supabase
        .from('stock_entries')
        .select('*', { count: 'exact', head: true })

    if (error) {
        return <div style={{ padding: '2rem', color: 'var(--error)' }}>Error loading dashboard data.</div>
    }

    const safeSales = sales || []

    // Calculate totals
    const totalRevenue = safeSales.reduce((sum, s) => sum + (s.total_price || 0), 0)
    const totalItemsSold = safeSales.reduce((sum, s) => sum + (s.quantity || 0), 0)
    const totalSalesCount = safeSales.length
    const totalStockEntries = entriesCount || 0

    return (
        <div className="container animate-slide-up" style={{ paddingBottom: '4rem' }}>
            <DashboardHeader />

            {/* KPI Cards */}
            <div className="animate-scale-in" style={{ animationDelay: '0.1s' }}>
                <KPIGrid
                    totalRevenue={totalRevenue}
                    totalItemsSold={totalItemsSold}
                    totalSalesCount={totalSalesCount}
                    totalStockEntries={totalStockEntries}
                />
            </div>

            {/* Main Content Grid: Chart (Left) + Top Items (Right) */}
            <div className="animate-scale-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', alignItems: 'stretch', animationDelay: '0.2s' }}>

                {/* Revenue Chart */}
                <RevenueChart sales={safeSales} />

                {/* Top Selling Items */}
                <TopSellingList sales={safeSales} />

            </div>
        </div>
    )
}
