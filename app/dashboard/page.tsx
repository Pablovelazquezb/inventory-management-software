
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import DashboardCharts from './DashboardCharts'

export default async function DashboardPage() {
    const supabase = await createClient()

    // Fetch Sales
    // Note: If table doesn't exist yet, this will error. We should handle it gracefully or let it fail until user runs SQL.
    const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select('*')
        .order('sold_at', { ascending: false })
        .limit(20)

    // Fetch Stock Entries
    const { data: entries, error: entriesError } = await supabase
        .from('stock_entries')
        .select('*, inventory_items(name)')
        .order('added_at', { ascending: false })
        .limit(20)

    // Calculate metrics (MVP: Client side calc from limited set, or assumes fetch all if small. For scale, use count/sum queries)
    const { data: allSales } = await supabase.from('sales').select('total_price, quantity')

    const totalRevenue = allSales?.reduce((sum, s) => sum + (s.total_price || 0), 0) || 0
    const totalItemsSold = allSales?.reduce((sum, s) => sum + (s.quantity || 0), 0) || 0

    const error = salesError || entriesError

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 700 }}>Dashboard</h2>
                <p style={{ color: 'rgba(255,255,255,0.5)' }}>Overview of your inventory performance.</p>
            </div>

            {error && (
                <div style={{ padding: '1rem', background: 'rgba(255,0,0,0.1)', border: '1px solid var(--error)', borderRadius: '8px', marginBottom: '2rem' }}>
                    <h4 style={{ color: 'var(--error)', margin: 0 }}>Database Setup Required</h4>
                    <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                        It looks like the <code>sales</code> or <code>stock_entries</code> tables haven't been created yet.
                        Please run the necessary SQL script in Supabase.
                    </p>
                </div>
            )}

            {/* Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <div className="card" style={{ padding: '1.5rem' }}>
                    <div style={{ fontSize: '0.875rem', opacity: 0.6, marginBottom: '0.5rem' }}>Total Revenue</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success)' }}>
                        ${totalRevenue.toLocaleString()}
                    </div>
                </div>
                <div className="card" style={{ padding: '1.5rem' }}>
                    <div style={{ fontSize: '0.875rem', opacity: 0.6, marginBottom: '0.5rem' }}>Items Sold</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700 }}>
                        {totalItemsSold}
                    </div>
                </div>
                <div className="card" style={{ padding: '1.5rem' }}>
                    <div style={{ fontSize: '0.875rem', opacity: 0.6, marginBottom: '0.5rem' }}>Recent Activity</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>
                        {sales?.length || 0} Salesforce / {entries?.length || 0} Entries
                    </div>
                </div>
            </div>

            {/* Charts */}
            <DashboardCharts sales={sales || []} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Recent Sales */}
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                        <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Recent Sales</h3>
                    </div>
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                            <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
                                <tr>
                                    <th style={{ padding: '1rem', textAlign: 'left', opacity: 0.6 }}>Item</th>
                                    <th style={{ padding: '1rem', textAlign: 'right', opacity: 0.6 }}>Qty</th>
                                    <th style={{ padding: '1rem', textAlign: 'right', opacity: 0.6 }}>Total</th>
                                    <th style={{ padding: '1rem', textAlign: 'right', opacity: 0.6 }}>Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sales?.map(sale => (
                                    <tr key={sale.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '1rem' }}>{sale.item_name}</td>
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>{sale.quantity}</td>
                                        <td style={{ padding: '1rem', textAlign: 'right', color: 'var(--success)' }}>${sale.total_price}</td>
                                        <td style={{ padding: '1rem', textAlign: 'right', opacity: 0.5 }}>
                                            {new Date(sale.sold_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                                {(!sales || sales.length === 0) && (
                                    <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center', opacity: 0.5 }}>No recent sales</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Stock Entries */}
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                        <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Stock Entries</h3>
                    </div>
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                            <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
                                <tr>
                                    <th style={{ padding: '1rem', textAlign: 'left', opacity: 0.6 }}>Item</th>
                                    <th style={{ padding: '1rem', textAlign: 'right', opacity: 0.6 }}>Qty Added</th>
                                    <th style={{ padding: '1rem', textAlign: 'right', opacity: 0.6 }}>Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {entries?.map(entry => (
                                    <tr key={entry.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '1rem' }}>
                                            {/* Supabase returns joined data as object or null if left join fails/item deleted */}
                                            {entry.inventory_items?.name || 'Unknown Item'}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: 'var(--primary)' }}>
                                            +{entry.quantity_added}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right', opacity: 0.5 }}>
                                            {new Date(entry.added_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                                {(!entries || entries.length === 0) && (
                                    <tr><td colSpan={3} style={{ padding: '2rem', textAlign: 'center', opacity: 0.5 }}>No recent entries</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
