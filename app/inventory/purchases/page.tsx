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
        <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <Link href="/inventory" style={{ fontSize: '0.875rem', opacity: 0.5, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        ← Back
                    </Link>
                    <h2 style={{ fontSize: '2rem', fontWeight: 700, margin: '0.5rem 0 0' }}>Purchases</h2>
                </div>
                <Link href="/inventory/purchases/new" className="btn btn-primary">
                    + New Purchase Order
                </Link>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
                        <tr>
                            <th style={{ padding: '1rem', textAlign: 'left', opacity: 0.7 }}>Date</th>
                            <th style={{ padding: '1rem', textAlign: 'left', opacity: 0.7 }}>Supplier</th>
                            <th style={{ padding: '1rem', textAlign: 'center', opacity: 0.7 }}>Status</th>
                            <th style={{ padding: '1rem', textAlign: 'center', opacity: 0.7 }}>Payment</th>
                            <th style={{ padding: '1rem', textAlign: 'right', opacity: 0.7 }}>Amount</th>
                            <th style={{ padding: '1rem', textAlign: 'right', opacity: 0.7 }}>Expected</th>
                            <th style={{ padding: '1rem', textAlign: 'right', opacity: 0.7 }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {purchases?.map(p => (
                            <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '1rem', opacity: 0.8 }}>
                                    {new Date(p.created_at).toLocaleDateString()}
                                </td>
                                <td style={{ padding: '1rem', fontWeight: 500 }}>
                                    {p.suppliers?.name || 'Unknown'}
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'center' }}>
                                    <span style={{
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '20px',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        background: p.status === 'ordered' ? 'rgba(255, 165, 0, 0.2)' :
                                            p.status === 'received' ? 'rgba(34, 197, 94, 0.2)' :
                                                'rgba(255,255,255,0.1)',
                                        color: p.status === 'ordered' ? 'orange' :
                                            p.status === 'received' ? '#22c55e' :
                                                'inherit'
                                    }}>
                                        {p.status.toUpperCase()}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'center' }}>
                                    <span style={{
                                        fontSize: '0.75rem',
                                        opacity: 0.8,
                                        padding: '0.25rem 0.5rem',
                                        border: '1px solid var(--border)',
                                        borderRadius: '4px',
                                        background: p.payment_status === 'paid' ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
                                        color: p.payment_status === 'paid' ? '#22c55e' : 'inherit'
                                    }}>
                                        {(p.payment_status || 'pending').toUpperCase()}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>
                                    ${p.total_amount?.toLocaleString() ?? '0.00'}
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'right', opacity: 0.7 }}>
                                    {p.expected_date ? new Date(p.expected_date).toLocaleDateString() : '-'}
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                    <Link
                                        href={`/inventory/purchases/${p.id}`}
                                        className="btn"
                                        style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', background: 'var(--surface)', border: '1px solid var(--border)' }}
                                    >
                                        View
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {(!purchases || purchases.length === 0) && (
                            <tr>
                                <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', opacity: 0.5 }}>
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
