'use client'

import { useTranslation } from '@/hooks/useTranslation'
import { useTheme } from '@/context/ThemeContext'
import { usePreferences } from '@/context/PreferencesContext'
import { useState, useEffect } from 'react'

export default function SettingsPage() {
    const { language, setLanguage, t } = useTranslation()
    const { theme, setTheme } = useTheme()
    const { lowStockWarning, setLowStockWarning } = usePreferences()
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
                            style={{ flex: 1, padding: '1rem', justifyContent: 'center', opacity: language === 'es' ? 1 : 0.5 }}
                        >
                            🇪🇸 Español
                        </button>
                        <button
                            onClick={() => setLanguage('en')}
                            className={`btn ${language === 'en' ? 'btn-primary' : 'btn-secondary'}`}
                            style={{ flex: 1, padding: '1rem', justifyContent: 'center', opacity: language === 'en' ? 1 : 0.5 }}
                        >
                            🇺🇸 English
                        </button>
                    </div>
                </div>

                <div style={{ marginBottom: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                        {t.settings.theme}
                    </label>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            onClick={() => setTheme('light')}
                            className={`btn`}
                            style={{
                                flex: 1,
                                padding: '1rem',
                                justifyContent: 'center',
                                background: theme === 'light' ? 'var(--surface-highlight)' : 'transparent',
                                border: theme === 'light' ? '1px solid var(--primary)' : '1px solid var(--border)',
                                color: theme === 'light' ? 'var(--foreground)' : 'var(--text-muted)'
                            }}
                        >
                            ☀️ {t.settings.light}
                        </button>
                        <button
                            onClick={() => setTheme('dark')}
                            className={`btn`}
                            style={{
                                flex: 1,
                                padding: '1rem',
                                justifyContent: 'center',
                                background: theme === 'dark' ? 'var(--surface-highlight)' : 'transparent',
                                border: theme === 'dark' ? '1px solid var(--primary)' : '1px solid var(--border)',
                                color: theme === 'dark' ? 'var(--foreground)' : 'var(--text-muted)'
                            }}
                        >
                            🌙 {t.settings.dark}
                        </button>
                    </div>
                </div>

                <div style={{ marginBottom: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                        {t.settings.lowStockWarning}
                    </label>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            onClick={() => setLowStockWarning(true)}
                            className={`btn`}
                            style={{
                                flex: 1,
                                padding: '1rem',
                                justifyContent: 'center',
                                background: lowStockWarning ? 'var(--surface-highlight)' : 'transparent',
                                border: lowStockWarning ? '1px solid var(--primary)' : '1px solid var(--border)',
                                color: lowStockWarning ? 'var(--foreground)' : 'var(--text-muted)'
                            }}
                        >
                            🔔 {t.settings.enabled}
                        </button>
                        <button
                            onClick={() => setLowStockWarning(false)}
                            className={`btn`}
                            style={{
                                flex: 1,
                                padding: '1rem',
                                justifyContent: 'center',
                                background: !lowStockWarning ? 'var(--surface-highlight)' : 'transparent',
                                border: !lowStockWarning ? '1px solid var(--primary)' : '1px solid var(--border)',
                                color: !lowStockWarning ? 'var(--foreground)' : 'var(--text-muted)'
                            }}
                        >
                            🔕 {t.settings.disabled}
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
