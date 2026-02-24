'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface Organization {
    id: string
    name: string
    slug: string
    logo_url?: string
    plan: string
    role: string
}

interface OrganizationContextValue {
    currentOrg: Organization | null
    orgs: Organization[]
    switchOrg: (org: Organization) => void
    isLoading: boolean
}

const OrganizationContext = createContext<OrganizationContextValue>({
    currentOrg: null,
    orgs: [],
    switchOrg: () => { },
    isLoading: true,
})

export function OrganizationProvider({
    children,
    initialOrgs,
    initialOrgId,
}: {
    children: ReactNode
    initialOrgs: Organization[]
    initialOrgId: string | null
}) {
    const [orgs] = useState<Organization[]>(initialOrgs)
    const [currentOrg, setCurrentOrg] = useState<Organization | null>(
        initialOrgs.find(o => o.id === initialOrgId) ?? initialOrgs[0] ?? null
    )
    const [isLoading, setIsLoading] = useState(false)

    const switchOrg = async (org: Organization) => {
        setIsLoading(true)
        setCurrentOrg(org)
        // Persist choice via API route (sets httpOnly cookie server-side)
        await fetch('/api/org/switch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orgId: org.id }),
        })
        setIsLoading(false)
        // Refresh to reload server data for new org
        window.location.href = '/dashboard'
    }

    return (
        <OrganizationContext.Provider value={{ currentOrg, orgs, switchOrg, isLoading }}>
            {children}
        </OrganizationContext.Provider>
    )
}

export function useOrganization() {
    return useContext(OrganizationContext)
}
