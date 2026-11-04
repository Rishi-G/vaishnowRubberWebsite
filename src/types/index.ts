/** A product category's slug (from the Product Categories collection). "railway" switches on the railway layouts. */
export type ProductCategory = string

export interface Category {
  slug: ProductCategory
  name: string
  tabLabel: string
  shortLabel: string
  /** '' when the category is not offered in the quote form */
  enquiryLabel: string
}
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
export type SeoPage = 'products' | 'company' | 'industries' | 'resources' | 'contact'

export interface SiteSettings {
  logoUrl: string
  /** '' when no light logo is uploaded; the footer then puts the main logo on a white panel */
  logoLightUrl: string
  tagline: string
  keywords: string[]
  faviconUrl: string
  shareImageUrl: string
  preloaderEnabled: boolean
  preloaderLabel: string
  defaultTitle: string
  titleTemplate: string
  description: string
  pageSeo: Record<SeoPage, { title: string; description: string }>
}

export interface NavLink {
  label: string
  href: string
}

/** Header, products mega menu and footer links from the Navigation global. */
export interface Navigation {
  productsLabel: string
  headerLinks: NavLink[]
  megaColumns: { title: string; categories: ProductCategory[]; maxItems: number }[]
  catalogueCard: { badge: string; title: string; text: string; browseLabel: string; downloadLabel: string }
  catalogueUrl: string
  footerProductsHeading: string
  footerCompanyHeading: string
  footerContactHeading: string
  footerProductLinks: NavLink[]
  footerCompanyLinks: NavLink[]
  footerCatalogueLabel: string
}
