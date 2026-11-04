import type { Field, GlobalConfig } from 'payload'
import { revalidatePath } from 'next/cache'

const hex = (v: string | null | undefined) => (!v || /^#[0-9a-fA-F]{6}$/.test(v) ? true : 'Use a 6-digit hex colour such as #0c6db4')

const colour = (name: string, label: string, description: string): Field => ({
  name,
  label,
  type: 'text',
  validate: hex,
  maxLength: 7,
  admin: { description: `${description} Format: #rrggbb. Empty = the current colour.` },
})

/** Font choices are limited to the ones the site loads (see app/(frontend)/layout.tsx). */
export const BODY_FONTS = ['Plus Jakarta Sans', 'Inter', 'DM Sans', 'Manrope']
export const HEADING_FONTS = ['Space Grotesk', 'Sora', 'Outfit', 'Plus Jakarta Sans']

const options = (list: string[]) => list.map((v) => ({ label: v, value: v }))

export const Theme: GlobalConfig = {
  slug: 'theme',
  label: 'Theme (colours & fonts)',
  admin: { group: 'Company', description: 'Changes apply to every page within a minute. Empty fields keep the current look.' },
  access: { read: () => true },
  hooks: {
    afterChange: [
      ({ doc }) => {
        try {
          revalidatePath('/', 'layout')
        } catch {
          /* outside request scope (seeding) */
        }
        return doc
      },
    ],
  },
  fields: [
    {
      name: 'colors',
      label: 'Colours',
      type: 'group',
      fields: [
        colour('brandBlue', 'Main brand colour', 'Buttons, links, highlights.'),
        colour('brandHover', 'Brand colour on hover', 'Slightly darker than the main colour.'),
        colour('accent', 'Accent colour', 'Orange details, line-art highlights, hover accents.'),
        colour('ink', 'Dark background', 'Hero bands, footer and dark sections.'),
        colour('paper', 'Page background', 'Light grey behind content sections.'),
      ],
    },
    {
      name: 'fonts',
      label: 'Fonts',
      type: 'group',
      fields: [
        { name: 'body', label: 'Body text font', type: 'select', options: options(BODY_FONTS) },
        { name: 'heading', label: 'Heading font', type: 'select', options: options(HEADING_FONTS) },
      ],
    },
  ],
}
