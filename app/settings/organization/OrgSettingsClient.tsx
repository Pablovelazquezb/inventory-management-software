'use client'

import { useState } from 'react'
import { useOrganization } from '@/context/OrganizationContext'
import { useTranslation } from '@/hooks/useTranslation'

interface Props {
    user: any
    orgs: any[]
}

// ── Role badge colors ──────────────────────────────────────────
function RoleBadge({ role }: { role: string }) {
    const colors: Record<string, { bg: string; color: string; border: string }> = {
        owner: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: 'rgba(245,158,11,0.3)' },
        admin: { bg: 'rgba(99,102,241,0.12)', color: 'var(--primary)', border: 'rgba(99,102,241,0.3)' },
        member: { bg: 'rgba(16,185,129,0.12)', color: '#22c55e', border: 'rgba(16,185,129,0.3)' },
    }
    const c = colors[role] ?? colors.member
    return (
        <span style={{
            padding: '0.2rem 0.65rem', borderRadius: '999px',
            fontSize: '0.72rem', fontWeight: 700, textTransform: 'capitalize',
            background: c.bg, color: c.color, border: `1px solid ${c.border}`,
        }}>
            {role}
        </span>
    )
}

// ── Section card ──────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: '16px', overflow: 'hidden', marginBottom: '1.25rem',
        }}>
            <div style={{
                padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)',
                fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)',
                textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>
                {title}
            </div>
            <div style={{ padding: '1.5rem' }}>
                {children}
            </div>
        </div>
    )
}

// ── Org avatar initials ───────────────────────────────────────
function OrgAvatar({ name, size = 52 }: { name: string; size?: number }) {
    const initials = name
        .split(' ')
        .map(w => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    return (
        <div style={{
            width: size, height: size, borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800,
            fontSize: size > 40 ? '1.1rem' : '0.85rem',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
        }}>
            {initials}
        </div>
    )
}

export default function OrgSettingsClient({ user, orgs }: Props) {
    const { t } = useTranslation()
    const { currentOrg, switchOrg } = useOrganization()
    const [inviteEmail, setInviteEmail] = useState('')
    const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member')
    const [inviteMsg, setInviteMsg] = useState<{ ok?: string; error?: string } | null>(null)
    const [inviting, setInviting] = useState(false)

    const myOrg = orgs.find(o => o.id === currentOrg?.id) ?? orgs[0]
    const isManager = myOrg?.role === 'owner' || myOrg?.role === 'admin'

    async function handleInvite(e: React.FormEvent) {
        e.preventDefault()
        setInviting(true)
        setInviteMsg(null)

        const res = await fetch('/api/org/invite', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: inviteEmail, role: inviteRole, orgId: myOrg?.id }),
        })
        const data = await res.json()

        if (res.ok) {
            setInviteMsg({ ok: `✓ Invitación enviada a ${inviteEmail}` })
            setInviteEmail('')
        } else {
            setInviteMsg({ error: data.error ?? 'Error al invitar' })
        }
        setInviting(false)
    }

    return (
        <div style={{ maxWidth: '640px' }}>

            {/* ── Back link ── */}
            <div style={{ marginBottom: '1.75rem' }}>
                <a href="/dashboard" style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                    fontSize: '0.875rem', color: 'var(--primary)', textDecoration: 'none',
                    fontWeight: 600,
                }}>
                    ← Volver al Dashboard
                </a>
            </div>

            {/* ── Active org card ── */}
            <Section title="Empresa Activa">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <OrgAvatar name={myOrg?.name ?? 'O'} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>{myOrg?.name ?? '—'}</span>
                            {myOrg?.role && <RoleBadge role={myOrg.role} />}
                            {myOrg?.plan && (
                                <span style={{
                                    padding: '0.2rem 0.65rem', borderRadius: '999px',
                                    fontSize: '0.72rem', fontWeight: 700, textTransform: 'capitalize',
                                    background: 'rgba(99,102,241,0.1)', color: 'var(--primary)',
                                    border: '1px solid rgba(99,102,241,0.25)',
                                }}>
                                    Plan {myOrg.plan}
                                </span>
                            )}
                        </div>
                        {myOrg?.slug && (
                            <div style={{
                                marginTop: '0.35rem', fontSize: '0.78rem',
                                color: 'var(--text-muted)', fontFamily: 'monospace',
                            }}>
                                slug: {myOrg.slug}
                            </div>
                        )}
                    </div>
                </div>
            </Section>

            {/* ── Org switcher ── */}
            {orgs.length > 1 && (
                <Section title="Cambiar Empresa">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {orgs.map(org => {
                            const isActive = org.id === myOrg?.id
                            return (
                                <button
                                    key={org.id}
                                    onClick={() => !isActive && switchOrg(org)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '0.875rem',
                                        padding: '0.75rem 1rem', borderRadius: '10px', width: '100%',
                                        border: isActive ? '2px solid var(--primary)' : '1px solid var(--border)',
                                        background: isActive ? 'rgba(99,102,241,0.06)' : 'transparent',
                                        cursor: isActive ? 'default' : 'pointer',
                                        color: 'var(--foreground)', textAlign: 'left',
                                        transition: 'background 0.15s, border-color 0.15s',
                                    }}
                                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--hover-item-bg)' }}
                                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                                >
                                    <OrgAvatar name={org.name} size={36} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{org.name}</div>
                                        {org.slug && (
                                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                                                {org.slug}
                                            </div>
                                        )}
                                    </div>
                                    <RoleBadge role={org.role} />
                                    {isActive && (
                                        <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700 }}>
                                            ✓
                                        </span>
                                    )}
                                </button>
                            )
                        })}
                    </div>
                </Section>
            )}

            {/* ── Invite member ── */}
            {isManager && (
                <Section title="Invitar Miembro">
                    <form onSubmit={handleInvite} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.625rem' }}>
                            <input
                                type="email"
                                placeholder="email@empresa.com"
                                value={inviteEmail}
                                onChange={e => setInviteEmail(e.target.value)}
                                required
                                className="form-input"
                                style={{ flex: 1 }}
                            />
                            <select
                                value={inviteRole}
                                onChange={e => setInviteRole(e.target.value as any)}
                                className="form-input"
                                style={{ width: '120px' }}
                            >
                                <option value="member">Miembro</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        {inviteMsg?.error && (
                            <div style={{
                                padding: '0.625rem 1rem', borderRadius: '8px',
                                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                                color: 'var(--error)', fontSize: '0.875rem',
                            }}>
                                ⚠️ {inviteMsg.error}
                            </div>
                        )}
                        {inviteMsg?.ok && (
                            <div style={{
                                padding: '0.625rem 1rem', borderRadius: '8px',
                                background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)',
                                color: '#22c55e', fontSize: '0.875rem',
                            }}>
                                {inviteMsg.ok}
                            </div>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                            <button
                                type="submit"
                                disabled={inviting}
                                className="btn btn-primary"
                                style={{ padding: '0.6rem 1.5rem' }}
                            >
                                {inviting ? 'Enviando...' : '+ Invitar'}
                            </button>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                                El usuario debe estar registrado en la plataforma.
                            </p>
                        </div>
                    </form>
                </Section>
            )}

            {/* ── Account info ── */}
            <Section title="Tu Cuenta">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                        width: 44, height: 44, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontWeight: 800, fontSize: '1rem', flexShrink: 0,
                    }}>
                        {(user?.email?.[0] ?? '?').toUpperCase()}
                    </div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{user?.email}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                            ID: <span style={{ fontFamily: 'monospace' }}>{user?.id?.slice(0, 8)}...</span>
                        </div>
                    </div>
                </div>
            </Section>

        </div>
    )
}
