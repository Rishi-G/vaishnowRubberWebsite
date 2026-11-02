import React from 'react'
import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Space_Grotesk, JetBrains_Mono } from 'next/font/google'
import '@/styles/globals.css'
import { getCompany, getProducts } from '@/lib/cms'
import { SiteProvider } from '@/lib/site-context'
import { SiteShell } from '@/components/site/SiteShell'

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta', display: 'swap' })
const grotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-grotesk', display: 'swap' })
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains', display: 'swap' })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'),
  title: {
    default: 'Vaishno Rubber Industries | VEXTRA® High-Pressure Hydraulic & Industrial Hoses',
    template: '%s | Vaishno Rubber Industries (VEXTRA®)',
  },
  description:
    'Vaishno Rubber Industries Pvt. Ltd. (VEXTRA) — manufacturer of SAE 100 R1, R2, SH33 hydraulic hoses, industrial, rock drill, steam and automotive hoses conforming to DIN, EN, SAE, IS standards.',
  icons: { icon: '/assets/logo.png' },
  openGraph: { type: 'website', siteName: 'Vaishno Rubber Industries', images: ['/assets/hydraulic-hose.jpg'] },
}

// Re-render from the CMS at most once a minute; product saves also revalidate instantly via hooks.
export const revalidate = 60

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  const [products, company] = await Promise.all([getProducts(), getCompany()])

  return (
    <html lang="en" data-theme="light" className={`${jakarta.variable} ${grotesk.variable} ${jetbrains.variable}`}>
      <body className="bg-white text-slate-900 font-sans antialiased selection:bg-brand-blue selection:text-white">
        <SiteProvider products={products} company={company}>
          <SiteShell>{children}</SiteShell>
        </SiteProvider>
      </body>
    </html>
  )
}
