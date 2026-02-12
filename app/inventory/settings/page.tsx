'use client'

import { useTranslation } from '@/hooks/useTranslation'
import { useState, useEffect } from 'react'

export default function SettingsPage() {
    const { language, setLanguage, t } = useTranslation()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    return (
        <div className="container animate-slide-up" style={{ maxWidth: '800px' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>
                    {t.settings.title}
                </h1>
                <p style={{ opacity: 0.5, margin: '0.5rem 0 0' }}>
                    {t.settings.selectLanguage}
                </p>
            </div>

            <div className="card">
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                        {t.settings.language}
                    </label>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            onClick={() => setLanguage('es')}
                            className={`btn ${language === 'es' ? 'btn-primary' : 'btn-secondary'}`}
                            style={{ flex: 1, padding: '1rem', justifyContent: 'center' }}
                        >
                            🇪🇸 Español
                        </button>
                        <button
                            onClick={() => setLanguage('en')}
                            className={`btn ${language === 'en' ? 'btn-primary' : 'btn-secondary'}`}
                            style={{ flex: 1, padding: '1rem', justifyContent: 'center' }}
                        >
                            🇺🇸 English
                        </button>
                    </div>
                </div>

                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '0.9rem', opacity: 0.8 }}>
                    <p style={{ margin: 0 }}>
                        {language === 'es'
                            ? 'La configuración de idioma se guarda en este dispositivo.'
                            : 'Language settings are saved on this device.'}
                    </p>
                </div>
            </div>
        </div>
    )
}
