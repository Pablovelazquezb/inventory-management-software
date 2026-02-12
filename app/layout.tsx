import './globals.css'
import type { Metadata } from 'next'

import { LanguageProvider } from '@/hooks/useTranslation'

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
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}
