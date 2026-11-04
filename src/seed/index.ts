/**
 * Seeds Payload from src/seed/data.ts (VEXTRA catalogue + company facts).
 * Idempotent: products are upserted by slug.
 *
 *   npm run seed
 *
 * Optional: SEED_ADMIN_EMAIL + SEED_ADMIN_PASSWORD create the first admin user.
 */
import { getPayload } from 'payload'
import config from '@payload-config'
import { PRODUCTS, COMPANY, SETTINGS, NAVIGATION, CATEGORIES, THEME } from './data'
import { PAGES } from './pages'

const wrap = (arr: string[]) => arr.map((text) => ({ text }))
const payload = await getPayload({ config })

// Categories first: products and the category pickers in Navigation and Pages link to them by id.
const categoryId: Record<string, number> = {}
for (const [order, c] of CATEGORIES.entries()) {
  const existing = await payload.find({ collection: 'product-categories', where: { slug: { equals: c.slug } }, limit: 1 })
  const doc = existing.docs[0]
    ? await payload.update({ collection: 'product-categories', id: existing.docs[0].id, data: { ...c, order } })
    : await payload.create({ collection: 'product-categories', data: { ...c, order } })
  categoryId[c.slug] = doc.id
}

/** Seed data names categories by slug; the CMS stores ids. Replaces every `category`/`categories` value. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const withCategoryIds = (v: any): any => {
  if (Array.isArray(v)) return v.map(withCategoryIds)
  if (!v || typeof v !== 'object') return v
  return Object.fromEntries(
    Object.entries(v).map(([k, x]) => [
      k,
      k === 'category' && typeof x === 'string' ? categoryId[x] : k === 'categories' && Array.isArray(x) ? x.map((s) => categoryId[s]) : withCategoryIds(x),
    ]),
  )
}

for (const [order, p] of PRODUCTS.entries()) {
  const data = {
    name: p.name,
    slug: p.id,
    kind: p.kind,
    category: categoryId[p.category],
    order,
    isHero: Boolean(p.isHero),
    standard: p.standard,
    tagline: p.tagline,
    description: p.description,
    maxPressureBar: p.maxPressureBar,
    maxPressurePsi: p.maxPressurePsi,
    sizeRange: p.sizeRange,
    temperatureRange: p.temperatureRange,
    image: p.image || undefined,
    coverColor: p.coverColor,
    dataNote: p.dataNote,
    construction: p.construction,
    features: wrap(p.features),
    applications: wrap(p.applications),
    recommendedFluids: wrap(p.recommendedFluids),
    specs: p.specs,
  }
  const existing = await payload.find({ collection: 'products', where: { slug: { equals: p.id } }, limit: 1 })
  if (existing.docs[0]) await payload.update({ collection: 'products', id: existing.docs[0].id, data })
  else await payload.create({ collection: 'products', data })
  payload.logger.info(`${existing.docs[0] ? 'updated' : 'created'} ${p.kind} ${p.id}`)
}

await payload.updateGlobal({
  slug: 'company-info',
  data: {
    name: COMPANY.name,
    brandName: COMPANY.brandName,
    incorporated: COMPANY.incorporated,
    landArea: COMPANY.landArea,
    location: COMPANY.location,
    phone: COMPANY.phone,
    whatsapp: COMPANY.whatsapp,
    businessHours: COMPANY.businessHours,
    mapUrl: COMPANY.mapUrl,
    profile: COMPANY.profile,
    founders: COMPANY.founders.map((name) => ({ name })),
    emails: COMPANY.emails.map((email) => ({ email })),
    capabilities: wrap(COMPANY.capabilities),
    certifications: COMPANY.certifications,
    customers: COMPANY.customers,
    strengths: COMPANY.strengths,
  },
})

// Text settings only: uploads stay empty so the public/assets fallbacks are used until an editor uploads.
await payload.updateGlobal({
  slug: 'site-settings',
  data: {
    preloaderEnabled: SETTINGS.preloaderEnabled,
    preloaderLabel: SETTINGS.preloaderLabel,
    defaultTitle: SETTINGS.defaultTitle,
    titleTemplate: SETTINGS.titleTemplate,
    description: SETTINGS.description,
    pageSeo: SETTINGS.pageSeo,
  },
})

await payload.updateGlobal({ slug: 'theme', data: THEME as never })
await payload.updateGlobal({ slug: 'navigation', data: withCategoryIds(NAVIGATION) })

for (const [slug, data] of Object.entries(PAGES)) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await payload.updateGlobal({ slug: `page-${slug}` as any, data: withCategoryIds(data) })
}

const { SEED_ADMIN_EMAIL: email, SEED_ADMIN_PASSWORD: password } = process.env
if (email && password) {
  const users = await payload.find({ collection: 'users', where: { email: { equals: email } }, limit: 1 })
  if (!users.docs[0]) {
    await payload.create({ collection: 'users', data: { email, password } })
    payload.logger.info(`created admin ${email}`)
  }
}

payload.logger.info(`Seed complete: ${CATEGORIES.length} categories, ${PRODUCTS.length} products, company info, site settings, navigation, ${Object.keys(PAGES).length} pages.`)
process.exit(0)
