import { createClient } from '@/utils/supabase/server'
import KPIGrid from './KPIGrid'
import RevenueChart from './RevenueChart'
import TopSellingList from './TopSellingList'
import TopCustomersList from './TopCustomersList'
import RecentSalesList from './RecentSalesList'

export default async function DashboardPage() {
    const supabase = await createClient()

    // 1. Fetch Sales with Customer info
    const { data: sales, error } = await supabase
        .from('sales')
        .select('*, customers(name)')
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
    const totalRevenue = safeSales.reduce((sum, s) => sum + (s.total_price || 0), 0) // Gross
    const totalTax = safeSales.reduce((sum, s) => sum + (s.tax_amount || 0), 0)
    const netRevenue = totalRevenue - totalTax

    const totalItemsSold = safeSales.reduce((sum, s) => sum + (s.quantity || 0), 0)
    const totalSalesCount = safeSales.length
    const totalStockEntries = entriesCount || 0

    return (
        <div className="container animate-slide-up" style={{ paddingBottom: '4rem', paddingTop: '2rem' }}>
            {/* KPI Cards */}
            <div className="animate-scale-in" style={{ animationDelay: '0.1s' }}>
                <KPIGrid
                    totalRevenue={totalRevenue}
                    netRevenue={netRevenue}
                    totalTax={totalTax}
                    totalItemsSold={totalItemsSold}
                    totalSalesCount={totalSalesCount}
                    totalStockEntries={totalStockEntries}
                />
            </div>

            {/* Main Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem', alignItems: 'stretch' }}>

                {/* Revenue Chart (Full Width) */}
                <div style={{ gridColumn: '1 / -1' }}>
                    <RevenueChart sales={safeSales} />
                </div>

                {/* Top Selling Items */}
                <TopSellingList sales={safeSales} />

                {/* Top Customers */}
                <TopCustomersList sales={safeSales} />

                {/* Recent Activity */}
                <RecentSalesList sales={safeSales} />

            </div>
        </div>
    )
}
