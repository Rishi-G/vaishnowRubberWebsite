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
            { name: 'logoLight', label: 'Logo for dark backgrounds', type: 'upload', relationTo: 'media', admin: { description: 'White/light version for the dark footer. Empty = the main logo on a white panel.' } },
            { name: 'tagline', type: 'text', maxLength: 120, admin: { description: 'Short line shown under the footer logo, e.g. "Hoses and railway rubber components since 2014". Empty = not shown.' } },
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
            { name: 'keywords', type: 'text', maxLength: 300, admin: { description: 'Comma-separated, e.g. hydraulic hose, SAE 100 R2, railway rubber components' } },
            { name: 'shareImage', type: 'upload', relationTo: 'media', admin: { description: 'Image shown when a link is shared on WhatsApp, LinkedIn etc. 1200 × 630 px. Empty = /assets/hydraulic-hose.jpg' } },
            {
              name: 'pageSeo',
              label: 'Per-page SEO',
              type: 'group',
              admin: { description: 'Title (inserted into the title pattern) and search description for each page. The home page uses the defaults above; products use their own name and description.' },
              fields: (
                [
                  ['products', 'Products page'],
                  ['company', 'Company page'],
                  ['industries', 'Industries page'],
                  ['resources', 'Resources page'],
                  ['career', 'Career page'],
                  ['contact', 'Contact page'],
                ] as const
              ).map(([name, label]) => ({
                name,
                label,
                type: 'group' as const,
                fields: [
                  { name: 'title', type: 'text' as const, maxLength: 80 },
                  { name: 'description', type: 'textarea' as const, maxLength: 320 },
                ],
              })),
            },
          ],
        },
      ],
    },
  ],
}
