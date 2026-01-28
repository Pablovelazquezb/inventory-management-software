'use client'

import { useActionState } from 'react'
import { signup } from '../actions'

const initialState = {
    error: '',
}

export default function SignupPage() {
    const [state, formAction, isPending] = useActionState(signup, initialState)

    return (
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
            <div className="card glass" style={{ width: '100%', maxWidth: '400px' }}>
                <h2 style={{ marginBottom: '1.5rem', textAlign: 'center', fontSize: '1.75rem', fontWeight: 700 }}>Create Account</h2>

                <form action={formAction} className="animate-in flex-1 flex flex-col w-full justify-center gap-2 text-foreground">
                    <div style={{ marginBottom: '1rem' }}>
                        <label className="text-md" htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', opacity: 0.8 }}>
                            Email
                        </label>
                        <input
                            className="input"
                            name="email"
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label className="text-md" htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', opacity: 0.8 }}>
                            Password
                        </label>
                        <input
                            className="input"
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {state?.error && (
                        <p style={{ color: 'var(--error)', fontSize: '0.875rem', marginBottom: '1rem', textAlign: 'center' }}>
                            {state.error}
                        </p>
                    )}

                    <button disabled={isPending} className="btn btn-primary" style={{ width: '100%' }}>
                        {isPending ? 'Signing Up...' : 'Sign Up'}
                    </button>

                    <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', opacity: 0.7 }}>
                        Already have an account? <a href="/auth/login" style={{ color: 'var(--primary)' }}>Sign In</a>
                    </p>
                </form>
            </div>
        </div>
    )
}
