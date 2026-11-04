/**
 * Static data source used only for the GitHub Pages build (STATIC_EXPORT=true).
 * scripts/static-export.mjs copies this over src/lib/cms.ts before `next build`,
 * so the exported site reads from src/seed/snapshot.json (written by `npm run snapshot` from the
 * CMS) instead of Payload/SQLite.
 */
import { cache } from 'react'
import type { Category, Navigation, Theme, Product, SiteSettings } from '@/types'
import snapshotJson from '@/seed/snapshot.json'
import type { PageContent, PageSlug } from '@/seed/pages'

const snap = snapshotJson as unknown as {
  products: Product[]
  categories: Category[]
  company: CompanyFacts
  settings: SiteSettings
  navigation: Navigation
  theme: Theme
  pages: { [K in PageSlug]: PageContent<K> }
}

export interface Certification {
  name: string
  detail: string
  status: 'verified' | 'stated'
  documentUrl: string
}

export interface CompanyFacts {
  name: string
  brandName: string
  incorporated: string
  landArea: string
  location: string
  phone: string
  whatsapp: string
  businessHours: string
  mapUrl: string
  socials: { platform: string; url: string }[]
  profile: string
  founders: string[]
  emails: string[]
  capabilities: string[]
  certifications: Certification[]
  customers: { name: string; group: string }[]
  strengths: { title: string; detail: string }[]
}

export const getProducts = cache(async (): Promise<Product[]> => snap.products)

export const getProduct = cache(async (slug: string): Promise<Product | null> => snap.products.find((p) => p.id === slug) ?? null)

export const getCompany = cache(async (): Promise<CompanyFacts> => snap.company)

export const getSettings = cache(async (): Promise<SiteSettings> => snap.settings)

export const getNavigation = cache(async (): Promise<Navigation> => snap.navigation)

export const getPage = cache(async <K extends PageSlug>(slug: K): Promise<PageContent<K>> => snap.pages[slug])

export const getCategories = cache(async (): Promise<Category[]> => snap.categories)

export const getTheme = cache(async (): Promise<Theme> => snap.theme)
