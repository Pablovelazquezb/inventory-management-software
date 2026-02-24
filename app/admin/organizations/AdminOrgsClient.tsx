'use client'

import { useState, useActionState, useTransition } from 'react'
import { createOrgAction, renameOrgAction, deleteOrgAction, assignOwnerAction } from './actions'

interface Member { id: string; user_id: string; role: string }
interface Org {
    id: string; name: string; slug: string; plan: string; created_at: string
    organization_members: Member[]
}
interface Profile { id: string; email: string; full_name: string | null }

interface Props { orgs: Org[]; profiles: Profile[] }

type Modal =
    | { type: 'create' }
    | { type: 'rename'; org: Org }
    | { type: 'delete'; org: Org }
    | { type: 'assign'; org: Org }
    | null

const overlay: React.CSSProperties = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: '1.5rem',
}
const modalBox: React.CSSProperties = {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '480px',
}
const tCell: React.CSSProperties = { padding: '0.875rem 1.25rem', verticalAlign: 'middle' }
const tHead: React.CSSProperties = {
    ...tCell, fontSize: '0.72rem', fontWeight: 700,
    color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em',
}

export default function AdminOrgsClient({ orgs: initialOrgs, profiles }: Props) {
    const [orgs, setOrgs] = useState<Org[]>(initialOrgs)
    const [modal, setModal] = useState<Modal>(null)
    const [deleteInput, setDeleteInput] = useState('')
    const [isDeleting, setIsDeleting] = useState(false)
    const [deleteErr, setDeleteErr] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    function closeModal() { setModal(null); setDeleteInput(''); setDeleteErr(null) }

    function getOwner(org: Org) {
        const ownerMember = org.organization_members.find(m => m.role === 'owner')
        if (!ownerMember) return null
        return profiles.find(p => p.id === ownerMember.user_id) ?? null
    }

    async function handleDelete(orgId: string) {
        setIsDeleting(true)
        const res = await deleteOrgAction(orgId)
        setIsDeleting(false)
        if ('error' in res) { setDeleteErr(res.error ?? 'Error'); return }
        setOrgs(prev => prev.filter(o => o.id !== orgId))
        closeModal()
    }

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>Empresas</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                        {orgs.length} empresa{orgs.length !== 1 ? 's' : ''} en la plataforma
                    </p>
                </div>
                <button onClick={() => setModal({ type: 'create' })} className="btn btn-primary" style={{ fontWeight: 600 }}>
                    + Nueva Empresa
                </button>
            </div>

            {/* Table */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'var(--background)', borderBottom: '1px solid var(--border)' }}>
                            <th style={tHead}>Empresa</th>
                            <th style={tHead}>Owner</th>
                            <th style={tHead}>Miembros</th>
                            <th style={tHead}>Creada</th>
                            <th style={{ ...tHead, textAlign: 'right' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orgs.map((org, i) => {
                            const owner = getOwner(org)
                            return (
                                <tr key={org.id} style={{ borderBottom: i < orgs.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                    <td style={tCell}>
                                        <div style={{ fontWeight: 700, marginBottom: '0.1rem' }}>{org.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{org.slug}</div>
                                    </td>
                                    <td style={tCell}>
                                        {owner ? (
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{owner.full_name || owner.email}</div>
                                                {owner.full_name && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{owner.email}</div>}
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setModal({ type: 'assign', org })}
                                                style={{ fontSize: '0.8rem', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                                            >
                                                + Asignar owner
                                            </button>
                                        )}
                                    </td>
                                    <td style={{ ...tCell, fontWeight: 600, color: 'var(--primary)' }}>
                                        {org.organization_members.length}
                                    </td>
                                    <td style={{ ...tCell, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                        {new Date(org.created_at).toLocaleDateString('es-MX')}
                                    </td>
                                    <td style={{ ...tCell, textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                            <button onClick={() => setModal({ type: 'rename', org })} style={{
                                                padding: '0.35rem 0.75rem', borderRadius: '6px',
                                                border: '1px solid var(--border)', background: 'transparent',
                                                cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, color: 'var(--foreground)'
                                            }}>
                                                ✏️ Renombrar
                                            </button>
                                            <button onClick={() => setModal({ type: 'delete', org })} style={{
                                                padding: '0.35rem 0.75rem', borderRadius: '6px',
                                                border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)',
                                                cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, color: 'var(--error)'
                                            }}>
                                                🗑
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                        {orgs.length === 0 && (
                            <tr>
                                <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    No hay empresas. Crea la primera empresa con el botón de arriba.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* ─── CREATE MODAL ─── */}
            {modal?.type === 'create' && (
                <div style={overlay} onClick={e => e.target === e.currentTarget && closeModal()}>
                    <div style={modalBox}>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem' }}>Nueva Empresa</h2>
                        <CreateOrgForm profiles={profiles} onClose={closeModal} onCreated={org => setOrgs(prev => [org, ...prev])} />
                    </div>
                </div>
            )}

            {/* ─── RENAME MODAL ─── */}
            {modal?.type === 'rename' && (
                <div style={overlay} onClick={e => e.target === e.currentTarget && closeModal()}>
                    <div style={modalBox}>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem' }}>Renombrar Empresa</h2>
                        <RenameOrgForm org={modal.org} onClose={closeModal}
                            onRenamed={name => setOrgs(prev => prev.map(o => o.id === modal.org.id ? { ...o, name } : o))}
                        />
                    </div>
                </div>
            )}

            {/* ─── ASSIGN OWNER MODAL ─── */}
            {modal?.type === 'assign' && (
                <div style={overlay} onClick={e => e.target === e.currentTarget && closeModal()}>
                    <div style={modalBox}>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Asignar Owner</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                            Empresa: <strong>{modal.org.name}</strong>
                        </p>
                        <AssignOwnerForm org={modal.org} profiles={profiles} onClose={closeModal} />
                    </div>
                </div>
            )}

            {/* ─── DELETE MODAL ─── */}
            {modal?.type === 'delete' && (
                <div style={overlay} onClick={e => e.target === e.currentTarget && closeModal()}>
                    <div style={{ ...modalBox, maxWidth: 420 }}>
                        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>⚠️</div>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Eliminar empresa</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                Se eliminará <strong>{modal.org.name}</strong> y todos sus datos (inventario, ventas, compras). Esta acción es irreversible.
                            </p>
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
                                Escribe <strong>{modal.org.name}</strong> para confirmar:
                            </label>
                            <input
                                type="text" value={deleteInput} onChange={e => setDeleteInput(e.target.value)}
                                className="form-input" style={{ width: '100%' }} placeholder={modal.org.name}
                            />
                        </div>
                        {deleteErr && <div style={{ color: 'var(--error)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>{deleteErr}</div>}
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button onClick={closeModal} style={{
                                flex: 1, padding: '0.75rem', borderRadius: '8px',
                                border: '1px solid var(--border)', background: 'transparent',
                                cursor: 'pointer', fontWeight: 600, color: 'var(--foreground)'
                            }}>Cancelar</button>
                            <button
                                disabled={deleteInput !== modal.org.name || isDeleting}
                                onClick={() => handleDelete(modal.org.id)}
                                style={{
                                    flex: 1, padding: '0.75rem', borderRadius: '8px', border: 'none',
                                    background: 'var(--error)', color: '#fff', fontWeight: 700, cursor: 'pointer',
                                    opacity: deleteInput !== modal.org.name ? 0.45 : 1,
                                }}
                            >
                                {isDeleting ? 'Eliminando...' : 'Eliminar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

// ─────────────────────── CREATE FORM ──────────────────────────
function CreateOrgForm({ profiles, onClose, onCreated }: {
    profiles: Profile[]; onClose: () => void; onCreated: (org: Org) => void
}) {
    const [state, action, isPending] = useActionState(
        async (prev: any, fd: FormData) => {
            const res = await createOrgAction(prev, fd)
            if (res?.success) {
                const newOrg: Org = {
                    id: res.orgId!, name: res.orgName!,
                    slug: '', plan: 'free',
                    created_at: new Date().toISOString(),
                    organization_members: [],
                }
                onCreated(newOrg)
                onClose()
            }
            return res
        }, null
    )

    return (
        <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Nombre de la empresa *</label>
                <input name="name" type="text" className="form-input" placeholder="Acme Corp" required />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Asignar owner (opcional)</label>
                <select name="owner_user_id" className="form-input">
                    <option value="">Sin owner por ahora</option>
                    {profiles.map(p => (
                        <option key={p.id} value={p.id}>{p.full_name ? `${p.full_name} (${p.email})` : p.email}</option>
                    ))}
                </select>
            </div>
            {state?.error && <div style={{ color: 'var(--error)', fontSize: '0.875rem', padding: '0.625rem', background: 'rgba(239,68,68,0.1)', borderRadius: '8px' }}>{state.error}</div>}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
                <button type="button" onClick={onClose} style={{
                    flex: 1, padding: '0.75rem', borderRadius: '8px',
                    border: '1px solid var(--border)', background: 'transparent',
                    cursor: 'pointer', fontWeight: 600, color: 'var(--foreground)'
                }}>Cancelar</button>
                <button type="submit" disabled={isPending} className="btn btn-primary" style={{ flex: 1 }}>
                    {isPending ? 'Creando...' : 'Crear Empresa'}
                </button>
            </div>
        </form>
    )
}

// ─────────────────────── RENAME FORM ──────────────────────────
function RenameOrgForm({ org, onClose, onRenamed }: {
    org: Org; onClose: () => void; onRenamed: (name: string) => void
}) {
    const [state, action, isPending] = useActionState(
        async (prev: any, fd: FormData) => {
            const res = await renameOrgAction(prev, fd)
            if (res?.success) { onRenamed(fd.get('name') as string); onClose() }
            return res
        }, null
    )

    return (
        <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input type="hidden" name="org_id" value={org.id} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Nuevo nombre</label>
                <input name="name" type="text" className="form-input" defaultValue={org.name} required />
            </div>
            {state?.error && <div style={{ color: 'var(--error)', fontSize: '0.875rem' }}>{state.error}</div>}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" onClick={onClose} style={{
                    flex: 1, padding: '0.75rem', borderRadius: '8px',
                    border: '1px solid var(--border)', background: 'transparent',
                    cursor: 'pointer', fontWeight: 600, color: 'var(--foreground)'
                }}>Cancelar</button>
                <button type="submit" disabled={isPending} className="btn btn-primary" style={{ flex: 1 }}>
                    {isPending ? 'Guardando...' : 'Guardar'}
                </button>
            </div>
        </form>
    )
}

// ─────────────────────── ASSIGN OWNER FORM ────────────────────
function AssignOwnerForm({ org, profiles, onClose }: { org: Org; profiles: Profile[]; onClose: () => void }) {
    const [err, setErr] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    function handleAssign(userId: string) {
        startTransition(async () => {
            const res = await assignOwnerAction(org.id, userId)
            if ('error' in res) { setErr(res.error ?? 'Error'); return }
            onClose()
        })
    }

    const alreadyMembers = org.organization_members.map(m => m.user_id)

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {profiles
                .filter(p => !alreadyMembers.includes(p.id))
                .map(p => (
                    <button key={p.id} onClick={() => handleAssign(p.id)} disabled={isPending} style={{
                        padding: '0.75rem 1rem', borderRadius: '8px',
                        border: '1px solid var(--border)', background: 'var(--background)',
                        cursor: isPending ? 'not-allowed' : 'pointer', textAlign: 'left',
                        display: 'flex', flexDirection: 'column', gap: '0.1rem',
                    }}>
                        <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{p.full_name || p.email}</span>
                        {p.full_name && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.email}</span>}
                    </button>
                ))
            }
            {profiles.filter(p => !alreadyMembers.includes(p.id)).length === 0 && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Todos los usuarios ya pertenecen a esta empresa.</p>
            )}
            {err && <div style={{ color: 'var(--error)', fontSize: '0.875rem' }}>{err}</div>}
            <button onClick={onClose} style={{
                marginTop: '0.5rem', padding: '0.625rem', borderRadius: '8px',
                border: '1px solid var(--border)', background: 'transparent',
                cursor: 'pointer', fontWeight: 600, color: 'var(--foreground)'
            }}>Cancelar</button>
        </div>
    )
}
