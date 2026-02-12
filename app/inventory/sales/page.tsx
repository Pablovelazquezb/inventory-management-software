import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function SalesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/auth/login')

    const { data: sales } = await supabase
        .from('sales')
        .select('*')
        .order('sold_at', { ascending: false })

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>Sales History</h1>
                    <p style={{ opacity: 0.5, margin: '0.5rem 0 0' }}>Manage and view past sales.</p>
                </div>
                <Link href="/inventory/sell" className="btn btn-primary">
                    + New Sale
                </Link>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                        <tr>
                            <th style={{ textAlign: 'left', padding: '1rem', opacity: 0.7, fontWeight: 600 }}>Date</th>
                            <th style={{ textAlign: 'left', padding: '1rem', opacity: 0.7, fontWeight: 600 }}>Item</th>
                            <th style={{ textAlign: 'center', padding: '1rem', opacity: 0.7, fontWeight: 600 }}>Qty</th>
                            <th style={{ textAlign: 'right', padding: '1rem', opacity: 0.7, fontWeight: 600 }}>Price/Unit</th>
                            <th style={{ textAlign: 'right', padding: '1rem', opacity: 0.7, fontWeight: 600 }}>Total</th>
                            <th style={{ textAlign: 'left', padding: '1rem', opacity: 0.7, fontWeight: 600 }}>Note</th>
                            <th style={{ textAlign: 'center', padding: '1rem', opacity: 0.7, fontWeight: 600 }}>Invoice</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sales && sales.length > 0 ? (
                            sales.map((sale: any) => (
                                <tr key={sale.id} className="hover-bg" style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                                        {new Date(sale.sold_at).toLocaleDateString()}
                                        <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>
                                            {new Date(sale.sold_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem', fontWeight: 500 }}>{sale.item_name}</td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>{sale.quantity}</td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>${sale.price_per_unit?.toFixed(2)}</td>
                                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: 'var(--success)' }}>
                                        ${sale.total_price?.toFixed(2)}
                                    </td>
                                    <td style={{ padding: '1rem', fontSize: '0.9rem', opacity: 0.8, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {sale.note || '-'}
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                        {sale.invoice_url ? (
                                            <a href={sale.invoice_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>
                                                View
                                            </a>
                                        ) : (
                                            <span style={{ opacity: 0.3 }}>-</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', opacity: 0.5 }}>
                                    No sales found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
