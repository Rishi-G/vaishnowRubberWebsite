import 'server-only'
import { cache } from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import { NAVIGATION as NAV_FALLBACK, SETTINGS as SETTINGS_FALLBACK, THEME as THEME_FALLBACK } from '@/seed/data'
import { PAGES, type PageContent, type PageSlug } from '@/seed/pages'
import { withFallback } from '@/lib/content'
import type { Theme, Category, Navigation, NavLink, Product, SeoPage, SiteSettings } from '@/types'

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

export const getPayloadClient = cache(() => getPayload({ config }))

/* eslint-disable @typescript-eslint/no-explicit-any */
const texts = (arr: any[] | null | undefined): string[] => (arr ?? []).map((i) => i.text)

/** Payload document → frontend Product */
function toProduct(doc: any): Product {
  const cat = doc.category && typeof doc.category === 'object' ? doc.category : null
  const upload = doc.imageUpload && typeof doc.imageUpload === 'object' ? doc.imageUpload.url : null
  const c = doc.construction
  return {
    id: doc.slug,
    name: doc.name,
    kind: doc.kind,
    category: cat?.slug ?? '',
    categoryLabel: cat?.name ?? '',
    standard: doc.standard,
    tagline: doc.tagline,
    description: doc.description,
    features: texts(doc.features),
    construction: c?.reinforcement || c?.tube || c?.cover ? { tube: c.tube ?? '', reinforcement: c.reinforcement ?? '', cover: c.cover ?? '' } : undefined,
    temperatureRange: doc.temperatureRange ?? undefined,
    applications: texts(doc.applications),
    recommendedFluids: texts(doc.recommendedFluids),
    maxPressureBar: doc.maxPressureBar ?? undefined,
    maxPressurePsi: doc.maxPressurePsi ?? undefined,
    sizeRange: doc.sizeRange ?? undefined,
    image: upload || doc.image || undefined,
    isHero: Boolean(doc.isHero),
    coverColor: doc.coverColor ?? undefined,
    dataNote: doc.dataNote ?? undefined,
    specs: (doc.specs ?? []).map(({ id: _id, bendRadiusMm, ...row }: any) => ({ ...row, bendRadiusMm: bendRadiusMm ?? undefined })),
  }
}

export const getProducts = cache(async (): Promise<Product[]> => {
  const payload = await getPayloadClient()
  const res = await payload.find({ collection: 'products', limit: 200, sort: 'order', depth: 1 })
  return res.docs.map(toProduct)
})

export const getProduct = cache(async (slug: string): Promise<Product | null> => {
  const products = await getProducts()
  return products.find((p) => p.id === slug) ?? null
})

export const getCompany = cache(async (): Promise<CompanyFacts> => {
  const payload = await getPayloadClient()
  const d: any = await payload.findGlobal({ slug: 'company-info' })
  return {
    name: d.name ?? 'Vaishno Rubber Industries Pvt. Ltd.',
    brandName: d.brandName ?? 'VEXTRA',
    incorporated: d.incorporated ?? '',
    landArea: d.landArea ?? '',
    location: d.location ?? '',
    phone: d.phone ?? '',
    whatsapp: d.whatsapp ?? '',
    businessHours: d.businessHours ?? '',
    mapUrl: d.mapUrl ?? '',
    socials: (d.socials ?? []).map((x: any) => ({ platform: x.platform, url: x.url })),
    profile: d.profile ?? '',
    founders: (d.founders ?? []).map((x: any) => x.name),
    emails: (d.emails ?? []).map((x: any) => x.email),
    capabilities: texts(d.capabilities),
    certifications: (d.certifications ?? []).map((x: any) => ({ name: x.name, detail: x.detail ?? '', status: x.status ?? 'stated', documentUrl: uploadUrl(x.document) ?? x.documentUrl ?? '' })),
    customers: (d.customers ?? []).map((x: any) => ({ name: x.name, group: x.group })),
    strengths: (d.strengths ?? []).map((x: any) => ({ title: x.title, detail: x.detail ?? '' })),
  }
})

const uploadUrl = (u: any): string | undefined => (u && typeof u === 'object' && u.url ? u.url : undefined)

export const getSettings = cache(async (): Promise<SiteSettings> => {
  const payload = await getPayloadClient()
  const d: any = await payload.findGlobal({ slug: 'site-settings', depth: 1 })
  const logoUrl = uploadUrl(d.logo) ?? SETTINGS_FALLBACK.logoUrl
  const pageSeo = Object.fromEntries(
    (Object.keys(SETTINGS_FALLBACK.pageSeo) as SeoPage[]).map((k) => {
      const fb = SETTINGS_FALLBACK.pageSeo[k]
      return [k, { title: d.pageSeo?.[k]?.title || fb.title, description: d.pageSeo?.[k]?.description || fb.description }]
    }),
  ) as SiteSettings['pageSeo']
  return {
    logoUrl,
    logoLightUrl: uploadUrl(d.logoLight) ?? '',
    tagline: d.tagline ?? '',
    keywords: (d.keywords ?? '').split(',').map((k: string) => k.trim()).filter(Boolean),
    pageSeo,
    faviconUrl: uploadUrl(d.favicon) ?? logoUrl,
    shareImageUrl: uploadUrl(d.shareImage) ?? SETTINGS_FALLBACK.shareImageUrl,
    preloaderEnabled: d.preloaderEnabled ?? true,
    preloaderLabel: d.preloaderLabel || SETTINGS_FALLBACK.preloaderLabel,
    defaultTitle: d.defaultTitle || SETTINGS_FALLBACK.defaultTitle,
    titleTemplate: d.titleTemplate || SETTINGS_FALLBACK.titleTemplate,
    description: d.description || SETTINGS_FALLBACK.description,
  }
})

const navLinks = (arr: any[] | null | undefined, fallback: NavLink[]): NavLink[] =>
  arr?.length ? arr.map((l) => ({ label: l.label, href: l.href })) : fallback

export const getNavigation = cache(async (): Promise<Navigation> => {
  const payload = await getPayloadClient()
  const d: any = await payload.findGlobal({ slug: 'navigation' })
  const fb = NAV_FALLBACK
  const card = d.catalogueCard ?? {}
  return {
    productsLabel: d.productsLabel || fb.productsLabel,
    headerLinks: navLinks(d.headerLinks, fb.headerLinks),
    megaColumns: d.megaColumns?.length
      ? d.megaColumns.map((c: any) => ({ title: c.title, categories: (c.categories ?? []).map((x: any) => (typeof x === 'object' ? x.slug : x)), maxItems: c.maxItems ?? 6 }))
      : fb.megaColumns,
    catalogueCard: {
      badge: card.badge || fb.catalogueCard.badge,
      title: card.title || fb.catalogueCard.title,
      text: card.text || fb.catalogueCard.text,
      browseLabel: card.browseLabel || fb.catalogueCard.browseLabel,
      downloadLabel: card.downloadLabel || fb.catalogueCard.downloadLabel,
    },
    catalogueUrl: uploadUrl(d.catalogueFile) || d.catalogueUrl || fb.catalogueUrl,
    footerProductsHeading: d.footerProductsHeading || fb.footerProductsHeading,
    footerCompanyHeading: d.footerCompanyHeading || fb.footerCompanyHeading,
    footerContactHeading: d.footerContactHeading || fb.footerContactHeading,
    footerProductLinks: navLinks(d.footerProductLinks, fb.footerProductLinks),
    footerCompanyLinks: navLinks(d.footerCompanyLinks, fb.footerCompanyLinks),
    footerCatalogueLabel: d.footerCatalogueLabel || fb.footerCatalogueLabel,
  }
})

/** Text and images for one page; empty CMS fields keep the defaults in seed/pages.ts. */
export const getPage = cache(async <K extends PageSlug>(slug: K): Promise<PageContent<K>> => {
  const payload = await getPayloadClient()
  const d = await payload.findGlobal({ slug: `page-${slug}` as any, depth: 1 })
  return withFallback(d, PAGES[slug])
})

/** Colours and fonts; an empty or invalid value falls back to the current look. */
export const getTheme = cache(async (): Promise<Theme> => {
  const payload = await getPayloadClient()
  const d: any = await payload.findGlobal({ slug: 'theme' })
  const fb = THEME_FALLBACK
  const c = (v: unknown, def: string) => (typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v) ? v : def)
  return {
    colors: {
      brandBlue: c(d.colors?.brandBlue, fb.colors.brandBlue),
      brandHover: c(d.colors?.brandHover, fb.colors.brandHover),
      accent: c(d.colors?.accent, fb.colors.accent),
      ink: c(d.colors?.ink, fb.colors.ink),
      paper: c(d.colors?.paper, fb.colors.paper),
    },
    fonts: { body: d.fonts?.body || fb.fonts.body, heading: d.fonts?.heading || fb.fonts.heading },
  }
})

export const getCategories = cache(async (): Promise<Category[]> => {
  const payload = await getPayloadClient()
  const res = await payload.find({ collection: 'product-categories', limit: 100, sort: 'order', depth: 0 })
  return res.docs.map((c: any) => ({ slug: c.slug, name: c.name, tabLabel: c.tabLabel, shortLabel: c.shortLabel, enquiryLabel: c.enquiryLabel ?? '' }))
})
