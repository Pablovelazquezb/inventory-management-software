'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { useTranslation } from '@/hooks/useTranslation'

export default function RevenueChart({ sales }: { sales: any[] }) {
    const { t } = useTranslation()

    // Process data for chart
    // Group by date
    const salesByDate = sales.reduce((acc: any, sale) => {
        const date = new Date(sale.sold_at).toLocaleDateString()
        if (!acc[date]) acc[date] = { gross: 0 }

        const total = sale.total_price || 0

        acc[date].gross += total
        return acc
    }, {})

    const data = Object.keys(salesByDate).map(date => ({
        date,
        gross: salesByDate[date].gross
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // Fill in missing dates if needed, for now just showing active days

    return (
        <div className="card" style={{ padding: '2rem', height: '400px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>{t.dashboard.revenueTrends}</h3>
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', opacity: 0.5 }}>{t.dashboard.grossRevenueSubtitle}</p>
            </div>

            <div style={{ flex: 1, width: '100%', minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: 30, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorGross" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
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
                            width={80}
                        />
                        <Tooltip
                            contentStyle={{ background: 'var(--surface)', backdropFilter: 'blur(8px)', border: '1px solid var(--border)', borderRadius: '12px', boxShadow: 'var(--card-shadow-hover)', color: 'var(--foreground)' }}
                            itemStyle={{ color: 'var(--foreground)' }}
                            formatter={(value: any) => [`$${Number(value || 0).toFixed(2)}`, t.dashboard.grossRevenue]}
                        />
                        <Area
                            type="monotone"
                            dataKey="gross"
                            stroke="#10b981"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorGross)"
                            animationDuration={1500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
