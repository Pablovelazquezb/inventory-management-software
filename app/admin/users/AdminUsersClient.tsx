'use client'

import { useState, useActionState, useTransition } from 'react'
import { createUserAction, updateUserAction, deleteUserAction, updateMemberRoleAction, removeMemberAction, addMemberAction } from './actions'

interface Membership {
    id: string
    user_id: string
    organization_id: string
    role: string
    orgName: string
}

interface UserRow {
    id: string
    email: string
    full_name: string | null
    created_at: string
    memberships: Membership[]
}

interface Org {
    id: string
    name: string
    slug: string
}

interface Props {
    users: UserRow[]
    orgs: Org[]
}

type Modal =
    | { type: 'create' }
    | { type: 'edit'; user: UserRow }
    | { type: 'delete'; user: UserRow }
    | null

// ─────────────── Shared styles ───────────────────────────────
const overlay: React.CSSProperties = {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.55)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: '1.5rem',
}
const modalBox: React.CSSProperties = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '16px',
    padding: '2rem',
    width: '100%',
    maxWidth: '520px',
    maxHeight: '90vh',
    overflowY: 'auto',
}
const pill = (active: boolean): React.CSSProperties => ({
    padding: '0.2rem 0.6rem',
    borderRadius: '999px',
    background: active ? 'rgba(99,102,241,0.12)' : 'var(--background)',
    border: `1px solid ${active ? 'rgba(99,102,241,0.4)' : 'var(--border)'}`,
    fontSize: '0.73rem',
    fontWeight: 600,
    color: active ? '#6366f1' : 'var(--text-muted)',
    textTransform: 'capitalize' as const,
})
const actionBtn = (danger = false): React.CSSProperties => ({
    padding: '0.35rem 0.75rem',
    borderRadius: '6px',
    border: `1px solid ${danger ? 'rgba(239,68,68,0.3)' : 'var(--border)'}`,
    background: danger ? 'rgba(239,68,68,0.08)' : 'transparent',
    cursor: 'pointer',
    fontSize: '0.8rem',
    color: danger ? 'var(--error)' : 'var(--foreground)',
    fontWeight: 600,
})
// ─────────────────────────────────────────────────────────────

export default function AdminUsersClient({ users: initialUsers, orgs }: Props) {
    const [users, setUsers] = useState<UserRow[]>(initialUsers)
    const [modal, setModal] = useState<Modal>(null)
    const [search, setSearch] = useState('')
    const [deleteInput, setDeleteInput] = useState('')
    const [isDeleting, setIsDeleting] = useState(false)
    const [deleteErr, setDeleteErr] = useState<string | null>(null)

    const filtered = users.filter(u =>
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        (u.full_name ?? '').toLowerCase().includes(search.toLowerCase())
    )

    function closeModal() {
        setModal(null)
        setDeleteInput('')
        setDeleteErr(null)
    }

    async function handleDelete(userId: string) {
        setIsDeleting(true)
        const res = await deleteUserAction(userId)
        setIsDeleting(false)
        if ('error' in res) { setDeleteErr(res.error ?? 'Error'); return }
        setUsers(prev => prev.filter(u => u.id !== userId))
        closeModal()
    }

    // Called by child forms to refresh user list without full reload
    function refreshUser(updated: UserRow) {
        setUsers(prev => prev.map(u => u.id === updated.id ? updated : u))
    }

    function addUser(newUser: UserRow) {
        setUsers(prev => [newUser, ...prev])
    }

    const tCell: React.CSSProperties = { padding: '0.875rem 1.25rem', verticalAlign: 'middle' }
    const tHead: React.CSSProperties = {
        ...tCell,
        fontSize: '0.72rem', fontWeight: 700,
        color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.05em',
    }

    return (
        <div>
            {/* ── Header ── */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>Usuarios</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                        {users.length} usuario{users.length !== 1 ? 's' : ''} en la plataforma
                    </p>
                </div>
                <button onClick={() => setModal({ type: 'create' })} className="btn btn-primary" style={{ fontWeight: 600 }}>
                    + Nuevo Usuario
                </button>
            </div>

            {/* ── Search ── */}
            <input
                type="text"
                placeholder="🔍  Buscar por nombre o email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="form-input"
                style={{ maxWidth: 380, width: '100%', marginBottom: '1.25rem' }}
            />

            {/* ── Table ── */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'var(--background)', borderBottom: '1px solid var(--border)' }}>
                            <th style={tHead}>Usuario</th>
                            <th style={tHead}>Email</th>
                            <th style={tHead}>Empresas</th>
                            <th style={tHead}>Registrado</th>
                            <th style={{ ...tHead, textAlign: 'right' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((user, i) => (
                            <tr key={user.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                {/* Avatar + name */}
                                <td style={tCell}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{
                                            width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                                            background: `hsl(${user.email.charCodeAt(0) * 13 % 360},65%,55%)`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: '#fff', fontWeight: 800, fontSize: '0.9rem',
                                        }}>
                                            {(user.full_name?.[0] ?? user.email[0]).toUpperCase()}
                                        </div>
                                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                                            {user.full_name || <em style={{ color: 'var(--text-muted)', fontStyle: 'normal' }}>Sin nombre</em>}
                                        </span>
                                    </div>
                                </td>
                                {/* Email */}
                                <td style={{ ...tCell, color: 'var(--text-muted)', fontSize: '0.875rem' }}>{user.email}</td>
                                {/* Orgs */}
                                <td style={tCell}>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                                        {user.memberships.length === 0
                                            ? <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sin empresa</span>
                                            : user.memberships.map(m => (
                                                <span key={m.id} style={pill(false)}>
                                                    {m.orgName} · <span style={{ color: 'var(--primary)' }}>{m.role}</span>
                                                </span>
                                            ))
                                        }
                                    </div>
                                </td>
                                {/* Date */}
                                <td style={{ ...tCell, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                    {new Date(user.created_at).toLocaleDateString('es-MX')}
                                </td>
                                {/* Actions */}
                                <td style={{ ...tCell, textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                        <button onClick={() => setModal({ type: 'edit', user })} style={actionBtn()}>
                                            ✏️ Editar
                                        </button>
                                        <button onClick={() => setModal({ type: 'delete', user })} style={actionBtn(true)}>
                                            🗑 Eliminar
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                    No se encontraron usuarios.
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
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem' }}>Nuevo Usuario</h2>
                        <CreateUserForm orgs={orgs} onClose={closeModal} onCreated={addUser} />
                    </div>
                </div>
            )}

            {/* ─── EDIT MODAL ─── */}
            {modal?.type === 'edit' && (
                <div style={overlay} onClick={e => e.target === e.currentTarget && closeModal()}>
                    <div style={modalBox}>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem' }}>Editar Usuario</h2>
                        <EditUserForm user={modal.user} orgs={orgs} onClose={closeModal} onUpdated={refreshUser} />
                    </div>
                </div>
            )}

            {/* ─── DELETE MODAL ─── */}
            {modal?.type === 'delete' && (
                <div style={overlay} onClick={e => e.target === e.currentTarget && closeModal()}>
                    <div style={{ ...modalBox, maxWidth: 420 }}>
                        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>⚠️</div>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Eliminar usuario</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                Esta acción es <strong>irreversible</strong>. El usuario <strong>{modal.user.email}</strong> será eliminado permanentemente de Supabase Auth.
                            </p>
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
                                Escribe <strong>{modal.user.email}</strong> para confirmar:
                            </label>
                            <input
                                type="text"
                                value={deleteInput}
                                onChange={e => setDeleteInput(e.target.value)}
                                className="form-input"
                                style={{ width: '100%' }}
                                placeholder={modal.user.email}
                            />
                        </div>
                        {deleteErr && <div style={{ color: 'var(--error)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>{deleteErr}</div>}
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button onClick={closeModal} style={{ ...actionBtn(), flex: 1, padding: '0.75rem', borderRadius: '8px' }}>Cancelar</button>
                            <button
                                disabled={deleteInput !== modal.user.email || isDeleting}
                                onClick={() => handleDelete(modal.user.id)}
                                style={{
                                    flex: 1, padding: '0.75rem', borderRadius: '8px', border: 'none', fontWeight: 700,
                                    background: 'var(--error)', color: '#fff', cursor: 'pointer',
                                    opacity: deleteInput !== modal.user.email ? 0.45 : 1,
                                }}
                            >
                                {isDeleting ? 'Eliminando...' : 'Eliminar usuario'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

// ═══════════════════════════════════════════════════════════════
// CREATE USER FORM
// ═══════════════════════════════════════════════════════════════
function CreateUserForm({ orgs, onClose, onCreated }: { orgs: Org[]; onClose: () => void; onCreated: (u: UserRow) => void }) {
    const [state, action, isPending] = useActionState(
        async (prev: any, fd: FormData) => {
            const res = await createUserAction(prev, fd)
            if (res?.success) {
                // Build a temporary UserRow so the table updates immediately (real data on refresh)
                const newUser: UserRow = {
                    id: res.userId ?? '',
                    email: fd.get('email') as string,
                    full_name: fd.get('full_name') as string || null,
                    created_at: new Date().toISOString(),
                    memberships: [],
                }
                onCreated(newUser)
                onClose()
            }
            return res
        },
        null
    )

    return (
        <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Field label="Nombre completo" name="full_name" type="text" placeholder="Juan Pérez" />
            <Field label="Email *" name="email" type="email" placeholder="juan@empresa.com" required />
            <Field label="Contraseña *" name="password" type="password" placeholder="Mínimo 6 caracteres" required />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Empresa (opcional)</label>
                <select name="org_id" className="form-input">
                    <option value="">Sin empresa</option>
                    {orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Rol en la empresa</label>
                <select name="role" className="form-input">
                    <option value="member">Miembro</option>
                    <option value="admin">Admin</option>
                    <option value="owner">Owner</option>
                </select>
            </div>
            {state?.error && <ErrorBox msg={state.error} />}
            <ModalActions onClose={onClose} loading={isPending} submitLabel="Crear Usuario" />
        </form>
    )
}

// ═══════════════════════════════════════════════════════════════
// EDIT USER FORM (info + org memberships)
// ═══════════════════════════════════════════════════════════════
function EditUserForm({ user, orgs, onClose, onUpdated }: {
    user: UserRow; orgs: Org[]; onClose: () => void; onUpdated: (u: UserRow) => void
}) {
    const [memberships, setMemberships] = useState<Membership[]>(user.memberships)
    const [addingOrg, setAddingOrg] = useState(false)
    const [selectedOrgId, setSelectedOrgId] = useState('')
    const [selectedRole, setSelectedRole] = useState<'member' | 'admin' | 'owner'>('member')
    const [orgMsg, setOrgMsg] = useState<{ ok?: string; err?: string } | null>(null)
    const [isPendingOrg, startOrgTransition] = useTransition()

    const availableOrgs = orgs.filter(o => !memberships.find(m => m.organization_id === o.id))

    const [state, action, isPending] = useActionState(
        async (prev: any, fd: FormData) => {
            const res = await updateUserAction(prev, fd)
            if (res?.success) {
                onUpdated({ ...user, memberships })
                onClose()
            }
            return res
        },
        null
    )

    function handleRemoveMembership(membershipId: string) {
        startOrgTransition(async () => {
            const res = await removeMemberAction(membershipId)
            if ('error' in res) { setOrgMsg({ err: res.error ?? 'Error' }); return }
            setMemberships(prev => prev.filter(m => m.id !== membershipId))
            setOrgMsg({ ok: 'Removido exitosamente' })
        })
    }

    function handleChangeRole(membershipId: string, role: string) {
        startOrgTransition(async () => {
            const res = await updateMemberRoleAction(membershipId, role)
            if ('error' in res) { setOrgMsg({ err: res.error ?? 'Error' }); return }
            setMemberships(prev => prev.map(m => m.id === membershipId ? { ...m, role } : m))
            setOrgMsg({ ok: 'Rol actualizado' })
        })
    }

    function handleAddToOrg() {
        if (!selectedOrgId) return
        const org = orgs.find(o => o.id === selectedOrgId)
        startOrgTransition(async () => {
            // We call createUserAction approach? No — we need an "addMember" action
            const res = await addMemberAction(user.id, selectedOrgId, selectedRole)
            if ('error' in res) { setOrgMsg({ err: res.error ?? 'Error' }); return }
            const newMembership: Membership = {
                id: res.memberId!,
                user_id: user.id,
                organization_id: selectedOrgId,
                role: selectedRole,
                orgName: org?.name ?? '—',
            }
            setMemberships(prev => [...prev, newMembership])
            setAddingOrg(false)
            setSelectedOrgId('')
            setOrgMsg({ ok: `Añadido a ${org?.name}` })
        })
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* ─ Basic info ─ */}
            <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input type="hidden" name="user_id" value={user.id} />
                <Field label="Nombre completo" name="full_name" type="text" defaultValue={user.full_name ?? ''} />
                <Field label="Email" name="email" type="email" defaultValue={user.email} />
                <Field label="Nueva contraseña (dejar vacío para no cambiar)" name="password" type="password" placeholder="••••••••" />
                {state?.error && <ErrorBox msg={state.error} />}
                <ModalActions onClose={onClose} loading={isPending} submitLabel="Guardar cambios" />
            </form>

            {/* ─ Org memberships ─ */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Empresas ({memberships.length})
                    </span>
                    {availableOrgs.length > 0 && (
                        <button
                            onClick={() => setAddingOrg(v => !v)}
                            style={{ ...actionBtn(), fontSize: '0.78rem' }}
                        >
                            {addingOrg ? '✕ Cancelar' : '+ Añadir empresa'}
                        </button>
                    )}
                </div>

                {/* Add to org form */}
                {addingOrg && availableOrgs.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                        <select
                            value={selectedOrgId}
                            onChange={e => setSelectedOrgId(e.target.value)}
                            className="form-input"
                            style={{ flex: 1, minWidth: 140 }}
                        >
                            <option value="">Seleccionar empresa</option>
                            {availableOrgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                        </select>
                        <select
                            value={selectedRole}
                            onChange={e => setSelectedRole(e.target.value as any)}
                            className="form-input"
                            style={{ width: 110 }}
                        >
                            <option value="member">Miembro</option>
                            <option value="admin">Admin</option>
                            <option value="owner">Owner</option>
                        </select>
                        <button
                            onClick={handleAddToOrg}
                            disabled={!selectedOrgId || isPendingOrg}
                            className="btn btn-primary"
                            style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                        >
                            {isPendingOrg ? '...' : 'Añadir'}
                        </button>
                    </div>
                )}

                {/* Membership list */}
                {memberships.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Este usuario no pertenece a ninguna empresa.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {memberships.map(m => (
                            <div key={m.id} style={{
                                display: 'flex', alignItems: 'center', gap: '0.75rem',
                                padding: '0.625rem 0.875rem',
                                background: 'var(--background)',
                                borderRadius: '8px', border: '1px solid var(--border)',
                            }}>
                                <span style={{ flex: 1, fontWeight: 600, fontSize: '0.875rem' }}>🏢 {m.orgName}</span>
                                <select
                                    value={m.role}
                                    onChange={e => handleChangeRole(m.id, e.target.value)}
                                    disabled={isPendingOrg}
                                    style={{
                                        padding: '0.25rem 0.5rem', borderRadius: '6px',
                                        border: '1px solid var(--border)', background: 'var(--surface)',
                                        fontSize: '0.8rem', color: 'var(--foreground)', cursor: 'pointer'
                                    }}
                                >
                                    <option value="member">Miembro</option>
                                    <option value="admin">Admin</option>
                                    <option value="owner">Owner</option>
                                </select>
                                <button
                                    disabled={isPendingOrg}
                                    style={{ ...actionBtn(true), padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                                    onClick={() => handleRemoveMembership(m.id)}
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Feedback message */}
                {orgMsg?.ok && <p style={{ color: '#22c55e', fontSize: '0.8rem', marginTop: '0.5rem' }}>✅ {orgMsg.ok}</p>}
                {orgMsg?.err && <p style={{ color: 'var(--error)', fontSize: '0.8rem', marginTop: '0.5rem' }}>❌ {orgMsg.err}</p>}
            </div>
        </div>
    )
}

// ═══════════════════════════════════════════════════════════════
// SHARED HELPERS
// ═══════════════════════════════════════════════════════════════
function Field({ label, name, type, placeholder, required, defaultValue }: {
    label: string; name: string; type: string
    placeholder?: string; required?: boolean; defaultValue?: string
}) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>{label}</label>
            <input type={type} name={name} placeholder={placeholder} required={required} defaultValue={defaultValue} className="form-input" />
        </div>
    )
}

function ErrorBox({ msg }: { msg: string }) {
    return (
        <div style={{ color: 'var(--error)', fontSize: '0.875rem', padding: '0.625rem', background: 'rgba(239,68,68,0.1)', borderRadius: '8px' }}>
            {msg}
        </div>
    )
}

function ModalActions({ onClose, loading, submitLabel }: { onClose: () => void; loading: boolean; submitLabel: string }) {
    return (
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
            <button type="button" onClick={onClose} style={{
                flex: 1, padding: '0.75rem', borderRadius: '8px',
                border: '1px solid var(--border)', background: 'transparent',
                cursor: 'pointer', fontWeight: 600, color: 'var(--foreground)',
            }}>Cancelar</button>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 1 }}>
                {loading ? 'Guardando...' : submitLabel}
            </button>
        </div>
    )
}

