'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'

export default function RevenueChart({ sales }: { sales: any[] }) {
    // Process data for chart
    // Group by date
    const salesByDate = sales.reduce((acc: any, sale) => {
        const date = new Date(sale.sold_at).toLocaleDateString()
        if (!acc[date]) acc[date] = { net: 0, tax: 0 }

        const tax = sale.tax_amount || 0
        const total = sale.total_price || 0
        const net = total - tax

        acc[date].net += net
        acc[date].tax += tax
        return acc
    }, {})

    const data = Object.keys(salesByDate).map(date => ({
        date,
        net: salesByDate[date].net,
        tax: salesByDate[date].tax
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // Fill in missing dates if needed, for now just showing active days

    return (
        <div className="card" style={{ padding: '2rem', height: '400px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>Revenue Trends</h3>
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', opacity: 0.5 }}>Net Income vs Tax Collected</p>
            </div>

            <div style={{ flex: 1, width: '100%', minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorTax" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                        <XAxis
                            dataKey="date"
                            stroke="var(--text-muted)"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                        />
                        <YAxis
                            stroke="var(--text-muted)"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `$${value}`}
                            dx={-10}
                        />
                        <Tooltip
                            contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)' }}
                            itemStyle={{ color: '#fff' }}
                            formatter={(value: any, name: any) => [`$${Number(value || 0).toFixed(2)}`, name === 'net' ? 'Net Revenue' : 'Tax Collected']}
                        />
                        <Area
                            type="monotone"
                            dataKey="net"
                            stackId="1"
                            stroke="#8b5cf6"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorNet)"
                            animationDuration={1500}
                        />
                        <Area
                            type="monotone"
                            dataKey="tax"
                            stackId="1"
                            stroke="#f59e0b"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorTax)"
                            animationDuration={1500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
