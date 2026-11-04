/**
 * Writes what the CMS holds right now to src/seed/snapshot.json, using the same readers the live
 * site uses. The GitHub Pages build (cms.static.ts) reads this file, so run it before pushing
 * whenever content was edited in the admin:
 *
 *   npm run snapshot
 *
 * Needs the local database (vaishno.db). Files uploaded through the admin live on this server only,
 * so for the Pages site use file paths from /public instead of uploads.
 */
import fs from 'node:fs'
import { PAGES } from './pages'

// lib/cms.ts imports 'server-only', a Next.js-only package that does not exist under `payload run`.
// Resolve it to an empty module for this script.
const { registerHooks } = await import('node:module')
registerHooks({
  resolve(specifier, context, nextResolve) {
    return specifier === 'server-only' ? { url: 'data:text/javascript,', shortCircuit: true } : nextResolve(specifier, context)
  },
})

const cms = await import('@/lib/cms')

const pages: Record<string, unknown> = {}
for (const slug of Object.keys(PAGES)) pages[slug] = await cms.getPage(slug as keyof typeof PAGES)

const products = await cms.getProducts()
const snapshot = {
  products,
  categories: await cms.getCategories(),
  company: await cms.getCompany(),
  settings: await cms.getSettings(),
  navigation: await cms.getNavigation(),
  theme: await cms.getTheme(),
  pages,
}

fs.writeFileSync('src/seed/snapshot.json', JSON.stringify(snapshot, null, 2) + '\n')
console.log(`snapshot written: ${products.length} products, ${snapshot.categories.length} categories, ${Object.keys(pages).length} pages`)
process.exit(0)
