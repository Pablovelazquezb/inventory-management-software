'use client'

import { useActionState } from 'react'
import { createOrganizationAction } from './actions'

export default function OnboardingForm() {
    const [state, formAction, isPending] = useActionState(createOrganizationAction, null)

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--background)',
            padding: '2rem'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '480px',
                background: 'var(--surface)',
                borderRadius: '16px',
                border: '1px solid var(--border)',
                padding: '3rem',
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                        Bienvenido 🎉
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                        Crea tu empresa para empezar a gestionar tu inventario.
                    </p>
                </div>

                <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                            Nombre de la empresa
                        </label>
                        <input
                            name="name"
                            type="text"
                            placeholder="Ej. Distribuidora Torres S.A."
                            required
                            className="form-input"
                            style={{ width: '100%' }}
                        />
                    </div>

                    {state?.error && (
                        <div style={{
                            background: 'rgba(239,68,68,0.1)',
                            color: 'var(--error)',
                            padding: '0.75rem 1rem',
                            borderRadius: '8px',
                            fontSize: '0.875rem'
                        }}>
                            {state.error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isPending}
                        className="btn btn-primary"
                        style={{ width: '100%', fontWeight: 600 }}
                    >
                        {isPending ? 'Creando empresa...' : 'Crear empresa →'}
                    </button>
                </form>
            </div>
        </div>
    )
}
