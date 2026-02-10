import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export default async function PurchasesPage() {
    const supabase = await createClient()

    // Fetch purchases with suppliers
    const { data: purchases, error } = await supabase
        .from('purchases')
        .select('*, suppliers(name)')
        .order('created_at', { ascending: false })

    return (
        <div className="container animate-slide-up" style={{ paddingBottom: '4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <Link href="/inventory" className="btn" style={{ paddingLeft: 0, color: 'rgba(248,250,252,0.6)' }}>
                        ← Back to Inventory
                    </Link>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0, background: 'linear-gradient(to right, #f8fafc, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Purchases</h2>
                </div>
                <Link href="/inventory/purchases/new" className="btn btn-primary">
                    + New Purchase Order
                </Link>
            </div>

            <div className="card" style={{ padding: 0 }}>
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Supplier</th>
                            <th style={{ textAlign: 'center' }}>Status</th>
                            <th style={{ textAlign: 'center' }}>Payment</th>
                            <th style={{ textAlign: 'right' }}>Amount</th>
                            <th style={{ textAlign: 'right' }}>Expected</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {purchases?.map((p, i) => (
                            <tr key={p.id} style={{ animation: `fadeIn 0.3s ease-out ${i * 0.05}s forwards`, opacity: 0 }}>
                                <td style={{ opacity: 0.8 }}>
                                    {new Date(p.created_at).toLocaleDateString()}
                                </td>
                                <td style={{ fontWeight: 500, color: 'var(--foreground)' }}>
                                    {p.suppliers?.name || 'Unknown'}
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <span className={`badge ${p.status === 'ordered' ? 'badge-warning' :
                                        p.status === 'received' ? 'badge-success' :
                                            'badge-neutral'
                                        }`}>
                                        {p.status.toUpperCase()}
                                    </span>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <span className={`badge ${p.payment_status === 'paid' ? 'badge-success' :
                                        p.payment_status === 'partial' ? 'badge-warning' :
                                            'badge-neutral'
                                        }`}>
                                        {(p.payment_status || 'pending').toUpperCase()}
                                    </span>
                                </td>
                                <td style={{ textAlign: 'right', fontWeight: 600 }}>
                                    ${p.total_amount?.toLocaleString() ?? '0.00'}
                                </td>
                                <td style={{ textAlign: 'right', opacity: 0.7 }}>
                                    {p.expected_date ? new Date(p.expected_date).toLocaleDateString() : '-'}
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    <Link
                                        href={`/inventory/purchases/${p.id}`}
                                        className="btn"
                                        style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)' }}
                                    >
                                        View
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {(!purchases || purchases.length === 0) && (
                            <tr>
                                <td colSpan={7} style={{ padding: '4rem', textAlign: 'center', opacity: 0.5 }}>
                                    <div style={{ marginBottom: '1rem', fontSize: '2rem' }}>📦</div>
                                    No purchase orders found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
