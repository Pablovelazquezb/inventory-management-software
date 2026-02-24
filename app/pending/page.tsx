export default function PendingAssignmentPage() {
    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--background)', padding: '2rem',
        }}>
            <div style={{
                textAlign: 'center', maxWidth: 440,
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: '20px', padding: '3rem 2.5rem',
            }}>
                <div style={{ fontSize: '4rem', marginBottom: '1.25rem' }}>🏢</div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                    Cuenta pendiente de asignación
                </h1>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                    Tu cuenta ha sido creada correctamente, pero aún no has sido asignado a ninguna empresa.
                    Contacta al administrador de la plataforma para que te asigne a tu empresa.
                </p>
                <div style={{
                    padding: '0.875rem 1.25rem', borderRadius: '10px',
                    background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
                    fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 600,
                }}>
                    📧 pablo@corlynxai.com
                </div>
                <form action="/auth/signout" method="POST" style={{ marginTop: '1.5rem' }}>
                    <button type="submit" style={{
                        background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px',
                        padding: '0.625rem 1.25rem', cursor: 'pointer', fontSize: '0.875rem',
                        color: 'var(--text-muted)', fontWeight: 600,
                    }}>
                        Cerrar sesión
                    </button>
                </form>
            </div>
        </div>
    )
}
