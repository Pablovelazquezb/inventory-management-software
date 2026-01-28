
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { deleteItem } from './actions'

export default async function InventoryPage() {
    const supabase = await createClient()

    const { data: items, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching inventory:', error)
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Inventory</h2>
                <Link href="/inventory/add" className="btn btn-primary">
                    Add New Item
                </Link>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                        <tr>
                            <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)' }}>Name</th>
                            <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)' }}>Category</th>
                            <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)' }}>Stock</th>
                            <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)' }}>Weight</th>
                            <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)' }}>Price</th>
                            <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items && items.length > 0 ? (
                            items.map((item) => (
                                <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '1rem', fontWeight: 500 }}>{item.name}</td>
                                    <td style={{ padding: '1rem', color: 'rgba(255,255,255,0.7)' }}>
                                        <span style={{
                                            background: 'rgba(255,255,255,0.1)',
                                            padding: '0.25rem 0.6rem',
                                            borderRadius: '4px',
                                            fontSize: '0.75rem'
                                        }}>
                                            {item.category || 'Uncategorized'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            color: item.quantity < 10 ? 'var(--error)' : 'var(--success)',
                                            fontWeight: 500
                                        }}>
                                            {item.quantity} units
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', color: 'rgba(255,255,255,0.7)' }}>
                                        {item.weight ? `${item.weight} kg` : '-'}
                                    </td>
                                    <td style={{ padding: '1rem' }}>${item.price}</td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <form action={deleteItem.bind(null, item.id)}>
                                            <button className="btn" style={{
                                                padding: '0.4rem 0.8rem',
                                                fontSize: '0.8rem',
                                                background: 'transparent',
                                                color: 'var(--error)',
                                                border: '1px solid var(--border)'
                                            }}>
                                                Delete
                                            </button>
                                        </form>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} style={{ padding: '4rem', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
                                    No items found. Start by adding one.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
