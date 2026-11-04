export type ProductCategory = 'railway' | 'hydraulic' | 'industrial' | 'lpg' | 'automotive'
/** kept as an alias — older components still import this name */
export type HoseCategory = ProductCategory

export interface ProductSpecItem {
  /** product code as printed in the VEXTRA catalogue, e.g. "02-8" */
  code: string
  dashSize: string
  dn: number
  idInch: string
  idMm: number
  odMm: number
  workingPressureBar: number
  workingPressurePsi: number
  burstPressureBar: number
  burstPressurePsi: number
  /** the catalogue prints "–" for some sizes */
  bendRadiusMm?: number
}

export interface Product {
  id: string
  name: string
  /** hoses have data-sheet rows and a 3D model; components (railway) have neither yet */
  kind: 'hose' | 'component'
  category: ProductCategory
  categoryLabel: string
  standard: string
  tagline: string
  description: string
  features: string[]
  construction?: { tube: string; reinforcement: string; cover: string }
  temperatureRange?: string
  applications: string[]
  recommendedFluids: string[]
  maxPressureBar?: number
  maxPressurePsi?: number
  sizeRange?: string
  /** authentic product image path; empty when none exists */
  image?: string
  specs: ProductSpecItem[]
  /** cover colour for the 3D model (catalogue shows IS 9573 Type-II in orange) */
  coverColor?: number
  isHero?: boolean
  /** printed-as-is catalogue values that look inconsistent and need the client's confirmation */
  dataNote?: string
}

export interface TechnicalEnquiryData {
  category: ProductCategory | 'custom'
  productId?: string
  idSize: string
  workingPressure: string
  temperature: string
  lengthMeters: number
  fittingType: string
  application: string
  fullName: string
  companyName: string
  email: string
  phone: string
  location: string
  notes?: string
}

export type PageRoute =
  | '/'
  | '/products'
  | `/products/${string}`
  | '/company'
  | '/industries'
  | '/resources'
  | '/contact'

/** Branding and SEO defaults from the Site Settings global; URLs are already resolved to a file path. */
export interface SiteSettings {
  logoUrl: string
  faviconUrl: string
  shareImageUrl: string
  preloaderEnabled: boolean
  preloaderLabel: string
  defaultTitle: string
  titleTemplate: string
  description: string
}
