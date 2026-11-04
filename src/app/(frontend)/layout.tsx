import React from 'react'
import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Space_Grotesk, JetBrains_Mono, Inter, DM_Sans, Manrope, Sora, Outfit } from 'next/font/google'
import '@/styles/globals.css'
import { getCategories, getCompany, getNavigation, getProducts, getSettings, getTheme } from '@/lib/cms'
import { SiteProvider } from '@/lib/site-context'
import { SiteShell } from '@/components/site/SiteShell'
import { Preloader } from '@/components/site/Preloader'

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta', display: 'swap' })
const grotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-grotesk', display: 'swap' })
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains', display: 'swap' })
// Alternative fonts for the Theme global. preload: false, so a visitor only downloads the ones the theme picks.
// next/font needs literal options, so each one is written out.
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap', preload: false })
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dmsans', display: 'swap', preload: false })
const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope', display: 'swap', preload: false })
const sora = Sora({ subsets: ['latin'], variable: '--font-sora', display: 'swap', preload: false })
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit', display: 'swap', preload: false })

/** Theme font name → the CSS variable its next/font declared. */
const FONT_VAR: Record<string, string> = {
  'Plus Jakarta Sans': '--font-jakarta',
  'Space Grotesk': '--font-grotesk',
  Inter: '--font-inter',
  'DM Sans': '--font-dmsans',
  Manrope: '--font-manrope',
  Sora: '--font-sora',
  Outfit: '--font-outfit',
}

export async function generateMetadata(): Promise<Metadata> {
  const [s, company] = await Promise.all([getSettings(), getCompany()])
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'),
    title: { default: s.defaultTitle, template: s.titleTemplate },
    description: s.description,
    ...(s.keywords.length > 0 && { keywords: s.keywords }),
    icons: { icon: s.faviconUrl },
    openGraph: { type: 'website', siteName: company.name, images: [s.shareImageUrl] },
  }
}

// Re-render from the CMS at most once a minute; product saves also revalidate instantly via hooks.
export const revalidate = 60

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  const [products, categories, company, settings, navigation, theme] = await Promise.all([getProducts(), getCategories(), getCompany(), getSettings(), getNavigation(), getTheme()])
  const { colors: c, fonts: f } = theme
  // Overrides the defaults in styles/globals.css (@theme and :root) for every page.
  const themeVars = {
    '--color-brand-blue': c.brandBlue,
    '--color-brand-hover': c.brandHover,
    '--color-brand-accent': c.accent,
    '--color-ink': c.ink,
    '--color-paper': c.paper,
    '--brand-blue': c.brandBlue,
    '--brand-blue-hover': c.brandHover,
    '--brand-accent': c.accent,
    '--font-sans': `var(${FONT_VAR[f.body] ?? '--font-jakarta'}), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`,
    '--font-display': `var(${FONT_VAR[f.heading] ?? '--font-grotesk'}), var(--font-jakarta), sans-serif`,
  } as React.CSSProperties

  return (
    <html lang="en" data-theme="light" className={[jakarta, grotesk, jetbrains, inter, dmSans, manrope, sora, outfit].map((x) => x.variable).join(' ')} style={themeVars} suppressHydrationWarning>
      <head>
        {/* applies the saved light/dark choice before first paint, so there is no flash */}
        <script dangerouslySetInnerHTML={{ __html: "try{var t=localStorage.getItem('vextra-theme');if(t==='dark'||t==='light')document.documentElement.dataset.theme=t}catch(e){}" }} />
      </head>
      <body className="bg-white text-slate-900 font-sans antialiased selection:bg-brand-blue selection:text-white">
        {settings.preloaderEnabled && <Preloader logoUrl={settings.logoUrl} label={settings.preloaderLabel} />}
        <SiteProvider products={products} categories={categories} company={company} settings={settings} navigation={navigation}>
          <SiteShell>{children}</SiteShell>
        </SiteProvider>
      </body>
    </html>
  )
}
