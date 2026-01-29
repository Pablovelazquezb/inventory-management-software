'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

export default function DashboardCharts({ sales }: { sales: any[] }) {
    // Process data for charts
    // 1. Sales by Item Name
    const salesByItem = sales.reduce((acc: any, sale) => {
        const name = sale.item_name
        if (!acc[name]) {
            acc[name] = { name, quantity: 0, revenue: 0 }
        }
        acc[name].quantity += sale.quantity
        acc[name].revenue += sale.total_price
        return acc
    }, {})

    const chartData = Object.values(salesByItem)

    // 2. Recent Trends (using timestamp, simplified for now to just show sequence)
    const trendData = [...sales].reverse().map(s => ({
        date: new Date(s.sold_at).toLocaleDateString(),
        amount: s.total_price
    }))

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
            <div className="card" style={{ padding: '1.5rem', height: '350px' }}>
                <h3 style={{ fontSize: '1rem', opacity: 0.7, marginBottom: '1rem' }}>Top Selling Items (Qty)</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                        <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
                        <Tooltip
                            contentStyle={{ background: '#18181b', border: '1px solid #333' }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Bar dataKey="quantity" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="card" style={{ padding: '1.5rem', height: '350px' }}>
                <h3 style={{ fontSize: '1rem', opacity: 0.7, marginBottom: '1rem' }}>Recent Sales Revenue</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                        <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
                        <Tooltip
                            contentStyle={{ background: '#18181b', border: '1px solid #333' }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Line type="monotone" dataKey="amount" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
