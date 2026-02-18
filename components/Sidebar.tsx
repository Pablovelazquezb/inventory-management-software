'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useTranslation } from '@/hooks/useTranslation'

export default function Sidebar({ user }: { user: any }) {
    const pathname = usePathname()
    const { t } = useTranslation()
    const [mounted, setMounted] = useState(false)
    const [expanded, setExpanded] = useState<Record<string, boolean>>({
        'Ventas': true,
        'Compras': true,
        'Inventario': true
    })

    useEffect(() => {
        setMounted(true)
    }, [])

    const toggle = (label: string) => {
        setExpanded(prev => ({ ...prev, [label]: !prev[label] }))
    }

    const isActive = (href: string, exact = false) => {
        if (exact) return pathname === href
        return pathname === href || pathname.startsWith(href + '/')
    }

    if (!mounted) return null
    if (!user) return null

    const MENU_ITEMS = [
        {
            label: t.common.dashboard,
            href: '/dashboard',
            icon: '📊'
        },
        {
            label: t.common.sales,
            icon: '💰',
            id: 'Ventas',
            subItems: [
                { label: t.sidebar.newSale, href: '/inventory/sell' },
                { label: t.sidebar.salesHistory, href: '/inventory/sales' },
                { label: t.purchases.customersTitle || 'Customers', href: '/inventory/customers' },
            ]
        },
        {
            label: t.common.purchases,
            icon: '🛒',
            id: 'Compras',
            subItems: [
                { label: t.sidebar.suppliers, href: '/inventory/suppliers' },
                { label: t.sidebar.newPurchase, href: '/inventory/purchases/new' },
                { label: t.sidebar.purchaseHistory, href: '/inventory/purchases' },
            ]
        },
        {
            label: t.common.inventory,
            icon: '📦',
            id: 'Inventario',
            subItems: [
                { label: t.sidebar.list, href: '/inventory', exact: true },
                { label: t.sidebar.catalog, href: '/inventory/catalog' },
                { label: t.sidebar.categories, href: '/inventory/categories' },
                { label: t.sidebar.addItem, href: '/inventory/add' },
            ]
        },
        {
            label: t.common.settings,
            href: '/inventory/settings',
            icon: '⚙️'
        }
    ]

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
                                        onClick={() => toggle(item.id!)}
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
                                            transform: expanded[item.id!] ? 'rotate(180deg)' : 'rotate(0deg)',
                                            transition: 'transform 0.2s',
                                            fontSize: '0.8rem',
                                            opacity: 0.5
                                        }}>
                                            ▼
                                        </span>
                                    </button>

                                    {expanded[item.id!] && (
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
                                                            color: isActive(sub.href, (sub as any).exact) ? 'var(--primary)' : 'var(--text-muted)',
                                                            fontSize: '0.9rem',
                                                            fontWeight: isActive(sub.href, (sub as any).exact) ? 600 : 400,
                                                            background: isActive(sub.href, (sub as any).exact) ? 'var(--active-item-bg)' : 'transparent',
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
                                        color: isActive(item.href!) ? 'var(--foreground)' : 'var(--text-muted)',
                                        fontWeight: 500,
                                        background: isActive(item.href!) ? 'var(--active-item-bg)' : 'transparent',
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
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user?.email}
                </div>
                <form action="/auth/signout" method="post">
                    <button className="btn" style={{
                        width: '100%',
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: 'var(--error)',
                        fontSize: '0.875rem'
                    }}>
                        {t.common.logout}
                    </button>
                </form>
            </div>
        </aside>
    )
}
