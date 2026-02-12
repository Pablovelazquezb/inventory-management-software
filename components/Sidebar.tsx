'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const MENU_ITEMS = [
    {
        label: 'Dashboard',
        href: '/dashboard',
        icon: '📊'
    },
    {
        label: 'Ventas',
        icon: '💰',
        subItems: [
            { label: 'Nueva Venta', href: '/inventory/sell' },
            { label: 'Historial', href: '/inventory/sales' },
        ]
    },
    {
        label: 'Compras',
        icon: '🛒',
        subItems: [
            { label: 'Proveedores', href: '/inventory/suppliers' },
            { label: 'Nueva Compra', href: '/inventory/purchases/new' },
            { label: 'Historial', href: '/inventory/purchases' },
        ]
    },
    {
        label: 'Inventario',
        icon: '📦',
        subItems: [
            { label: 'Lista', href: '/inventory', exact: true },
            { label: 'Catálogo', href: '/inventory/catalog' },
            { label: 'Categorías', href: '/inventory/categories' },
            { label: 'Agregar Item', href: '/inventory/add' },
        ]
    }
]

export default function Sidebar({ user }: { user: any }) {
    const pathname = usePathname()
    const [expanded, setExpanded] = useState<Record<string, boolean>>({
        'Ventas': true,
        'Compras': true,
        'Inventario': true
    })

    const toggle = (label: string) => {
        setExpanded(prev => ({ ...prev, [label]: !prev[label] }))
    }

    const isActive = (href: string, exact = false) => {
        if (exact) return pathname === href
        return pathname === href || pathname.startsWith(href + '/')
    }

    if (!user) return null

    return (
        <aside style={{
            width: '260px',
            background: 'var(--surface)',
            borderRight: '1px solid var(--border)',
            padding: '2rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
            overflowY: 'auto'
        }}>
            <div style={{ marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.025em' }}>
                    Inventory<span style={{ color: 'var(--primary)' }}>.</span>
                </h1>
            </div>

            <nav style={{ flex: 1 }}>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: 0 }}>
                    {MENU_ITEMS.map((item) => (
                        <li key={item.label}>
                            {item.subItems ? (
                                <div>
                                    <button
                                        onClick={() => toggle(item.label)}
                                        style={{
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '0.75rem 1rem',
                                            borderRadius: '8px',
                                            color: 'var(--foreground)',
                                            fontWeight: 500,
                                            background: 'transparent',
                                            border: 'none',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            fontSize: '1rem'
                                        }}
                                        className="hover-bg"
                                    >
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <span>{item.icon}</span>
                                            {item.label}
                                        </span>
                                        <span style={{
                                            transform: expanded[item.label] ? 'rotate(180deg)' : 'rotate(0deg)',
                                            transition: 'transform 0.2s',
                                            fontSize: '0.8rem',
                                            opacity: 0.5
                                        }}>
                                            ▼
                                        </span>
                                    </button>

                                    {expanded[item.label] && (
                                        <ul style={{
                                            listStyle: 'none',
                                            paddingLeft: '2.5rem',
                                            marginTop: '0.25rem',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '0.25rem'
                                        }}>
                                            {item.subItems.map(sub => (
                                                <li key={sub.href}>
                                                    <Link
                                                        href={sub.href}
                                                        style={{
                                                            display: 'block',
                                                            padding: '0.5rem 0.75rem',
                                                            borderRadius: '6px',
                                                            color: isActive(sub.href, (sub as any).exact) ? 'var(--primary)' : 'rgba(255,255,255,0.6)',
                                                            fontSize: '0.9rem',
                                                            fontWeight: isActive(sub.href, (sub as any).exact) ? 600 : 400,
                                                            background: isActive(sub.href, (sub as any).exact) ? 'rgba(var(--primary-rgb), 0.1)' : 'transparent',
                                                            transition: 'all 0.2s'
                                                        }}
                                                    >
                                                        {sub.label}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ) : (
                                <Link
                                    href={item.href!}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '8px',
                                        color: isActive(item.href!) ? 'var(--foreground)' : 'rgba(255,255,255,0.8)',
                                        fontWeight: 500,
                                        background: isActive(item.href!) ? 'rgba(255,255,255,0.05)' : 'transparent',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <span>{item.icon}</span>
                                    {item.label}
                                </Link>
                            )}
                        </li>
                    ))}
                </ul>
            </nav>

            <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', marginBottom: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user?.email}
                </div>
                <form action="/auth/signout" method="post">
                    <button className="btn" style={{
                        width: '100%',
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: 'var(--error)',
                        fontSize: '0.875rem'
                    }}>
                        Sign Out
                    </button>
                </form>
            </div>
        </aside>
    )
}
