/**
 * GitHub Pages build helper.
 *   node scripts/static-export.mjs prepare  — swap the CMS for static seed data and drop Payload routes
 *   node scripts/static-export.mjs postbuild — prefix /assets and /documents with the Pages basePath
 * Only run in CI (it rewrites files in the checkout).
 */
import fs from 'node:fs'
import path from 'node:path'

const BASE = process.env.PAGES_BASE_PATH ?? '/vaishnowRubberWebsite'
const step = process.argv[2]

if (step === 'prepare') {
  fs.copyFileSync('src/lib/cms.static.ts', 'src/lib/cms.ts')
  fs.rmSync('src/app/(payload)', { recursive: true, force: true })
  const layout = 'src/app/(frontend)/layout.tsx'
  fs.writeFileSync(layout, fs.readFileSync(layout, 'utf8').replace(/export const revalidate = \d+/, 'export const revalidate = false'))
  console.log('static-export: prepared')
} else if (step === 'postbuild') {
  if (!BASE) process.exit(0)
  const re = /(["'`(=])\/(assets\/|documents\/|favicon\.svg)/g
  let n = 0
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name)
      if (e.isDirectory()) walk(p)
      else if (/\.(html|js|txt|css|json)$/.test(e.name)) {
        const src = fs.readFileSync(p, 'utf8')
        const out = src.replace(re, `$1${BASE}/$2`)
        if (out !== src) { fs.writeFileSync(p, out); n++ }
      }
    }
  }
  walk('out')
  fs.writeFileSync('out/.nojekyll', '')
  console.log(`static-export: rewrote asset paths in ${n} files`)
} else {
  console.error('usage: static-export.mjs prepare|postbuild')
  process.exit(1)
}
