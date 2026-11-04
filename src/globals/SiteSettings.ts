import type { GlobalConfig } from 'payload'
import { revalidatePath } from 'next/cache'

/**
 * Site Settings — branding and search defaults. Empty uploads fall back to the
 * files in public/assets (see getSettings in lib/cms.ts), so the site never shows a broken logo.
 */
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  admin: { group: 'Company' },
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
      type: 'tabs',
      tabs: [
        {
          label: 'Branding',
          fields: [
            { name: 'logo', type: 'upload', relationTo: 'media', admin: { description: 'Header, footer and preloader. Wide PNG with a transparent background, about 338 × 142 px. Empty = /assets/logo.png' } },
            { name: 'favicon', type: 'upload', relationTo: 'media', admin: { description: 'Browser tab icon, square PNG. Empty = the logo file.' } },
            {
              type: 'row',
              fields: [
                { name: 'preloaderEnabled', label: 'Show loading screen', type: 'checkbox', defaultValue: true },
                { name: 'preloaderLabel', label: 'Loading screen text', type: 'text', maxLength: 60 },
              ],
            },
          ],
        },
        {
          label: 'SEO',
          fields: [
            { name: 'defaultTitle', type: 'text', required: true, maxLength: 120, admin: { description: 'Home page title, shown in Google results.' } },
            {
              name: 'titleTemplate',
              type: 'text',
              required: true,
              maxLength: 120,
              validate: (v: string | null | undefined) => (v && v.includes('%s') ? true : 'Must contain %s where the page name goes'),
              admin: { description: 'Other pages. %s is replaced by the page name, e.g. "%s | Vaishno Rubber Industries".' },
            },
            { name: 'description', type: 'textarea', required: true, maxLength: 320, admin: { description: 'Default search-result description, about 150–160 characters.' } },
            { name: 'shareImage', type: 'upload', relationTo: 'media', admin: { description: 'Image shown when a link is shared on WhatsApp, LinkedIn etc. 1200 × 630 px. Empty = /assets/hydraulic-hose.jpg' } },
          ],
        },
      ],
    },
  ],
}
