import React from 'react'
import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Space_Grotesk, JetBrains_Mono } from 'next/font/google'
import '@/styles/globals.css'
import { getCompany, getProducts, getSettings } from '@/lib/cms'
import { SiteProvider } from '@/lib/site-context'
import { SiteShell } from '@/components/site/SiteShell'
import { Preloader } from '@/components/site/Preloader'

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta', display: 'swap' })
const grotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-grotesk', display: 'swap' })
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains', display: 'swap' })

export async function generateMetadata(): Promise<Metadata> {
  const [s, company] = await Promise.all([getSettings(), getCompany()])
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'),
    title: { default: s.defaultTitle, template: s.titleTemplate },
    description: s.description,
    icons: { icon: s.faviconUrl },
    openGraph: { type: 'website', siteName: company.name, images: [s.shareImageUrl] },
  }
}

// Re-render from the CMS at most once a minute; product saves also revalidate instantly via hooks.
export const revalidate = 60

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  const [products, company, settings] = await Promise.all([getProducts(), getCompany(), getSettings()])

  return (
    <html lang="en" data-theme="light" className={`${jakarta.variable} ${grotesk.variable} ${jetbrains.variable}`}>
      <body className="bg-white text-slate-900 font-sans antialiased selection:bg-brand-blue selection:text-white">
        {settings.preloaderEnabled && <Preloader logoUrl={settings.logoUrl} label={settings.preloaderLabel} />}
        <SiteProvider products={products} company={company} settings={settings}>
          <SiteShell>{children}</SiteShell>
        </SiteProvider>
      </body>
    </html>
  )
}
