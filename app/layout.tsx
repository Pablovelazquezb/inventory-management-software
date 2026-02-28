import './globals.css'
import type { Metadata } from 'next'

import { LanguageProvider } from '@/hooks/useTranslation'
import { ThemeProvider } from '@/context/ThemeContext'
import { PreferencesProvider } from '@/context/PreferencesContext'

export const metadata: Metadata = {
  title: 'Inventory Management',
  description: 'Premium Inventory Management Software',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <LanguageProvider>
          <ThemeProvider>
            <PreferencesProvider>
              {children}
            </PreferencesProvider>
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
