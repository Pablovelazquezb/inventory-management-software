'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'

export default function RevenueChart({ sales }: { sales: any[] }) {
    // Process data for chart
    // Group by date
    const salesByDate = sales.reduce((acc: any, sale) => {
        const date = new Date(sale.sold_at).toLocaleDateString()
        if (!acc[date]) acc[date] = 0
        acc[date] += sale.total_price
        return acc
    }, {})

    const data = Object.keys(salesByDate).map(date => ({
        date,
        amount: salesByDate[date]
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // Fill in missing dates if needed, for now just showing active days

    return (
        <div className="card" style={{ padding: '1.5rem', height: '400px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Revenue Trends</h3>
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem', opacity: 0.5 }}>Income over time</p>
            </div>

            <div style={{ flex: 1, width: '100%', minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis
                            dataKey="date"
                            stroke="rgba(255,255,255,0.3)"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                        />
                        <YAxis
                            stroke="rgba(255,255,255,0.3)"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `$${value}`}
                            dx={-10}
                        />
                        <Tooltip
                            contentStyle={{ background: '#18181b', border: '1px solid #333', borderRadius: '8px' }}
                            itemStyle={{ color: '#fff' }}
                            formatter={(value: any) => [`$${Number(value || 0).toFixed(2)}`, 'Revenue']}
                        />
                        <Area
                            type="monotone"
                            dataKey="amount"
                            stroke="var(--primary)"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorAmount)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
