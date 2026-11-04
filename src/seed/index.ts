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
import { PRODUCTS, COMPANY, SETTINGS } from './data'

const wrap = (arr: string[]) => arr.map((text) => ({ text }))
const payload = await getPayload({ config })

for (const [order, p] of PRODUCTS.entries()) {
  const data = {
    name: p.name,
    slug: p.id,
    kind: p.kind,
    category: p.category,
    order,
    isHero: Boolean(p.isHero),
    categoryLabel: p.categoryLabel,
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
  },
})

const { SEED_ADMIN_EMAIL: email, SEED_ADMIN_PASSWORD: password } = process.env
if (email && password) {
  const users = await payload.find({ collection: 'users', where: { email: { equals: email } }, limit: 1 })
  if (!users.docs[0]) {
    await payload.create({ collection: 'users', data: { email, password } })
    payload.logger.info(`created admin ${email}`)
  }
}

payload.logger.info(`Seed complete: ${PRODUCTS.length} products, company info, site settings.`)
process.exit(0)
