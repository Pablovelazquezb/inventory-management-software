'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

interface PreferencesContextType {
    lowStockWarning: boolean
    setLowStockWarning: (value: boolean) => void
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined)

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
    const [lowStockWarning, setLowStockWarning] = useState<boolean>(true)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        const savedWarning = localStorage.getItem('low_stock_warning')
        if (savedWarning !== null) {
            setLowStockWarning(savedWarning === 'true')
        }
        setMounted(true)
    }, [])

    useEffect(() => {
        if (!mounted) return
        localStorage.setItem('low_stock_warning', String(lowStockWarning))
    }, [lowStockWarning, mounted])

    return (
        <PreferencesContext.Provider value={{ lowStockWarning, setLowStockWarning }}>
            {children}
        </PreferencesContext.Provider>
    )
}

export function usePreferences() {
    const context = useContext(PreferencesContext)
    if (context === undefined) {
        throw new Error('usePreferences must be used within a PreferencesProvider')
    }
    return context
}
