/**
 * Static data source used only for the GitHub Pages build (STATIC_EXPORT=true).
 * scripts/static-export.mjs copies this over src/lib/cms.ts before `next build`,
 * so the exported site reads from src/seed/data.ts instead of Payload/SQLite.
 */
import { cache } from 'react'
import type { Product, SiteSettings } from '@/types'
import { PRODUCTS, COMPANY, SETTINGS } from '@/seed/data'

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

export const getProducts = cache(async (): Promise<Product[]> => PRODUCTS)

export const getProduct = cache(async (slug: string): Promise<Product | null> => PRODUCTS.find((p) => p.id === slug) ?? null)

export const getCompany = cache(async (): Promise<CompanyFacts> => COMPANY)

export const getSettings = cache(async (): Promise<SiteSettings> => SETTINGS)
