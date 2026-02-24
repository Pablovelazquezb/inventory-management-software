'use client'

import { useState, useActionState } from 'react'
import { useOrganization } from '@/context/OrganizationContext'

interface Props {
    user: any
    orgs: any[]
}

export default function OrgSettingsClient({ user, orgs }: Props) {
    const { currentOrg, switchOrg } = useOrganization()
    const [inviteEmail, setInviteEmail] = useState('')
    const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member')
    const [inviteMsg, setInviteMsg] = useState<{ ok?: string; error?: string } | null>(null)
    const [inviting, setInviting] = useState(false)

    const myOrg = orgs.find(o => o.id === currentOrg?.id) ?? orgs[0]

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
            setInviteMsg({ ok: `Invitación enviada a ${inviteEmail}` })
            setInviteEmail('')
        } else {
            setInviteMsg({ error: data.error ?? 'Error al invitar' })
        }
        setInviting(false)
    }

    const card: React.CSSProperties = {
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '2rem',
        marginBottom: '1.5rem',
    }

    return (
        <div style={{ maxWidth: '640px' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem' }}>
                Configuración de Empresa
            </h1>

            {/* Current org info */}
            <div style={card}>
                <h2 style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '1.25rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Empresa Activa
                </h2>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                    {myOrg?.name ?? '—'}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    slug: {myOrg?.slug}
                </div>
                <span style={{
                    display: 'inline-block',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '999px',
                    background: 'var(--primary)',
                    color: '#fff',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textTransform: 'capitalize'
                }}>
                    Plan {myOrg?.plan}
                </span>
            </div>

            {/* Org switcher (if user has multiple orgs) */}
            {orgs.length > 1 && (
                <div style={card}>
                    <h2 style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
                        Cambiar Empresa
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {orgs.map(org => (
                            <button
                                key={org.id}
                                onClick={() => switchOrg(org)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '8px',
                                    border: org.id === myOrg?.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                                    background: org.id === myOrg?.id ? 'rgba(var(--primary-rgb),0.05)' : 'transparent',
                                    cursor: org.id === myOrg?.id ? 'default' : 'pointer',
                                    color: 'var(--foreground)',
                                    textAlign: 'left',
                                    width: '100%',
                                }}
                            >
                                <span style={{ fontWeight: 600 }}>{org.name}</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                                    {org.role}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Invite member */}
            {(myOrg?.role === 'owner' || myOrg?.role === 'admin') && (
                <div style={card}>
                    <h2 style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
                        Invitar Miembro
                    </h2>
                    <form onSubmit={handleInvite} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
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
                                style={{ width: '130px' }}
                            >
                                <option value="member">Miembro</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        {inviteMsg?.error && (
                            <div style={{ color: 'var(--error)', fontSize: '0.875rem' }}>{inviteMsg.error}</div>
                        )}
                        {inviteMsg?.ok && (
                            <div style={{ color: 'var(--success, #22c55e)', fontSize: '0.875rem' }}>{inviteMsg.ok}</div>
                        )}

                        <button
                            type="submit"
                            disabled={inviting}
                            className="btn btn-primary"
                            style={{ alignSelf: 'flex-start' }}
                        >
                            {inviting ? 'Enviando...' : '+ Invitar'}
                        </button>
                    </form>
                    <p style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        El usuario debe estar registrado. Se le añadirá directamente a esta empresa.
                    </p>
                </div>
            )}
        </div>
    )
}
