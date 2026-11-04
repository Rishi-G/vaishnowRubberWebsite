import type { Field, GlobalConfig } from 'payload'
import { revalidatePath } from 'next/cache'

/**
 * Field builders shared by the page globals. Every field is optional: an empty value
 * falls back to today's text in seed/pages.ts (see withFallback in lib/content.ts).
 */

/** Internal path (/company) or full URL (https://…); anything else would be a broken link. */
export const validHref = (v: string | null | undefined) =>
  !v || /^\/(?!\/)/.test(v) || /^https?:\/\//.test(v) ? true : 'Start with / for a page on this site, or https:// for another site'

export const text = (name: string, label?: string, maxLength = 200): Field => ({ name, label, type: 'text', maxLength })
export const textarea = (name: string, label?: string, maxLength = 1200): Field => ({ name, label, type: 'textarea', maxLength })
export const link = (name: string, label?: string): Field => ({ name, label, type: 'text', validate: validHref, admin: { description: 'e.g. /contact or https://…' } })

export const group = (name: string, label: string, fields: Field[], description?: string): Field => ({
  name,
  label,
  type: 'group',
  admin: description ? { description } : undefined,
  fields,
})

/** List of one-line texts, stored as [{ text }]. */
export const list = (name: string, label: string): Field => ({
  name,
  label,
  type: 'array',
  fields: [{ name: 'text', type: 'text', required: true }],
})

/** Image: an upload wins; otherwise the path (a file in /public) is used. */
export const photo = (name = 'photo', label = 'Photo'): Field =>
  group(name, label, [
    { name: 'file', label: 'Upload', type: 'upload', relationTo: 'media' },
    {
      type: 'row',
      fields: [
        { name: 'src', label: 'Or file path', type: 'text', admin: { description: 'e.g. /assets/photos/vestibule.jpg' } },
        { name: 'alt', label: 'Alt text (describe the image)', type: 'text', maxLength: 200 },
      ],
    },
    { name: 'caption', type: 'text', maxLength: 200 },
  ])

export const hero = (): Field =>
  group('hero', 'Page header', [text('title', 'Heading', 120), textarea('lede', 'Intro line', 300)])

/** A page global in the "Pages" group; saving it refreshes that page. */
export const pageGlobal = (slug: string, label: string, path: string, fields: Field[]): GlobalConfig => ({
  slug,
  label,
  admin: { group: 'Pages', description: 'Empty fields keep the current text of the page.' },
  access: { read: () => true },
  hooks: {
    afterChange: [
      ({ doc }) => {
        try {
          revalidatePath(path)
        } catch {
          /* outside request scope (seeding) */
        }
        return doc
      },
    ],
  },
  fields,
})
