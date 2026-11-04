import 'server-only'
import { cache } from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import { SETTINGS as SETTINGS_FALLBACK } from '@/seed/data'
import type { Product, ProductCategory, SiteSettings } from '@/types'

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
  const upload = doc.imageUpload && typeof doc.imageUpload === 'object' ? doc.imageUpload.url : null
  const c = doc.construction
  return {
    id: doc.slug,
    name: doc.name,
    kind: doc.kind,
    category: doc.category as ProductCategory,
    categoryLabel: doc.categoryLabel,
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
    certifications: (d.certifications ?? []).map((x: any) => ({ name: x.name, detail: x.detail ?? '', status: x.status ?? 'stated', documentUrl: x.documentUrl ?? '' })),
    customers: (d.customers ?? []).map((x: any) => ({ name: x.name, group: x.group })),
    strengths: (d.strengths ?? []).map((x: any) => ({ title: x.title, detail: x.detail ?? '' })),
  }
})

const uploadUrl = (u: any): string | undefined => (u && typeof u === 'object' && u.url ? u.url : undefined)

export const getSettings = cache(async (): Promise<SiteSettings> => {
  const payload = await getPayloadClient()
  const d: any = await payload.findGlobal({ slug: 'site-settings', depth: 1 })
  const logoUrl = uploadUrl(d.logo) ?? SETTINGS_FALLBACK.logoUrl
  return {
    logoUrl,
    faviconUrl: uploadUrl(d.favicon) ?? logoUrl,
    shareImageUrl: uploadUrl(d.shareImage) ?? SETTINGS_FALLBACK.shareImageUrl,
    preloaderEnabled: d.preloaderEnabled ?? true,
    preloaderLabel: d.preloaderLabel || SETTINGS_FALLBACK.preloaderLabel,
    defaultTitle: d.defaultTitle || SETTINGS_FALLBACK.defaultTitle,
    titleTemplate: d.titleTemplate || SETTINGS_FALLBACK.titleTemplate,
    description: d.description || SETTINGS_FALLBACK.description,
  }
})
