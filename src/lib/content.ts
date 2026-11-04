/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Merges a Payload page global onto its defaults (seed/pages.ts).
 * - empty text, null, or an empty list → the default
 * - groups are merged field by field
 * - list items come from the CMS as entered (their own empty fields stay empty)
 * - an uploaded `file` replaces the `src`/`href` path beside it
 */
export function withFallback<T>(doc: any, fb: T): T {
  if (Array.isArray(fb)) return (Array.isArray(doc) && doc.length > 0 ? doc.map(clean) : fb) as T
  if (fb && typeof fb === 'object') {
    const d = resolveFile(doc)
    const out: any = {}
    for (const k of Object.keys(fb)) out[k] = withFallback(d?.[k], (fb as any)[k])
    return out
  }
  if (typeof fb === 'string') return (typeof doc === 'string' && doc.trim() ? doc : fb) as T
  return (doc ?? fb) as T
}

/** Payload list item → plain value: drop ids, nulls → '', uploads → their URL. */
function clean(v: any): any {
  if (Array.isArray(v)) return v.map(clean)
  if (!v || typeof v !== 'object') return v ?? ''
  const r = resolveFile(v)
  const out: any = {}
  for (const [k, x] of Object.entries(r)) if (k !== 'id') out[k] = clean(x)
  return out
}

function resolveFile(v: any): any {
  if (!v || typeof v !== 'object' || !('file' in v)) return v
  const { file, ...rest } = v
  const url = file && typeof file === 'object' ? file.url : undefined
  if (url) rest['href' in rest ? 'href' : 'src'] = url
  return rest
}

/** Fills {tokens} in CMS text, e.g. "call {phone}" → "call +91 …". */
export const fill = (s: string, vars: Record<string, string>) => s.replace(/\{(\w+)\}/g, (m, k) => vars[k] ?? m)
