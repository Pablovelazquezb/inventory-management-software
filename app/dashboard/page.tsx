import { createClient } from '@/utils/supabase/server'
import KPIGrid from './KPIGrid'
import RevenueChart from './RevenueChart'
import TopSellingList from './TopSellingList'

export default async function DashboardPage() {
    const supabase = await createClient()

    // 1. Fetch Sales (All time for now, or last 30 days)
    // To get "Income February", we'd need to filter by date. 
    // For MVP, we'll fetch all and filter in JS or just show All Time.
    // Let's fetch last 1000 sales to be safe for now
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
        <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '4rem' }}>
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
                <div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>Dashboard</h2>
                    <p style={{ color: 'rgba(255,255,255,0.5)', margin: '0.5rem 0 0' }}>Overview of your inventory performance.</p>
                </div>
                <div style={{ textAlign: 'right', opacity: 0.5, fontSize: '0.875rem' }}>
                    Data: Real-time
                </div>
            </div>

            {/* KPI Cards */}
            <KPIGrid
                totalRevenue={totalRevenue}
                totalItemsSold={totalItemsSold}
                totalSalesCount={totalSalesCount}
                totalStockEntries={totalStockEntries}
            />

            {/* Main Content Grid: Chart (Left) + Top Items (Right) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '1.5rem', alignItems: 'stretch' }}>

                {/* Revenue Chart */}
                <RevenueChart sales={safeSales} />

                {/* Top Selling Items */}
                <TopSellingList sales={safeSales} />

            </div>
        </div>
    )
}
