
export default function Home() {
  return (
    <main style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <div style={{
        background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.1) 0%, rgba(10, 10, 12, 0) 100%)',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '50vh',
        zIndex: -1,
        pointerEvents: 'none'
      }} />

      <h1 style={{
        fontSize: '4rem',
        fontWeight: 800,
        marginBottom: '1rem',
        background: 'linear-gradient(to right, #fff, #aaa)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>
        Inventory<span style={{ color: 'var(--primary)', WebkitTextFillColor: 'initial' }}>.</span>
      </h1>

      <p style={{
        fontSize: '1.25rem',
        color: '#888',
        maxWidth: '600px',
        marginBottom: '3rem',
        lineHeight: 1.6
      }}>
        Streamline your operations with our premium inventory management solution.
      </p>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <a href="/auth/login" className="btn btn-primary">
          Get Started
        </a>
        <a href="https://github.com" className="btn" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          Learn More
        </a>
      </div>
    </main>
  )
}
