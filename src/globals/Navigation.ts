import type { Field, GlobalConfig } from 'payload'
import { revalidatePath } from 'next/cache'

/** Internal path (/company) or full URL (https://…); anything else would be a broken link. */
const validHref = (v: string | null | undefined) =>
  !v || /^\/(?!\/)/.test(v) || /^https?:\/\//.test(v) ? true : 'Start with / for a page on this site, or https:// for another site'

const links = (name: string, label: string, description: string): Field => ({
  name,
  label,
  type: 'array',
  admin: { description },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'label', type: 'text', required: true, maxLength: 40 },
        { name: 'href', label: 'Link', type: 'text', required: true, validate: validHref, admin: { description: 'e.g. /company or /products?category=lpg' } },
      ],
    },
  ],
})

/**
 * Navigation — header menu, products mega menu and footer link columns.
 * Empty fields fall back to the defaults in seed/data.ts (see getNavigation in lib/cms.ts).
 */
export const Navigation: GlobalConfig = {
  slug: 'navigation',
  label: 'Navigation',
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
          label: 'Header',
          fields: [
            { name: 'productsLabel', label: 'Products menu label', type: 'text', maxLength: 30 },
            links('headerLinks', 'Menu links', 'Shown after Home and Products, on desktop and in the phone menu.'),
          ],
        },
        {
          label: 'Products menu',
          fields: [
            {
              name: 'megaColumns',
              label: 'Columns',
              type: 'array',
              maxRows: 4,
              admin: { description: 'Up to 4 columns; each lists the products of the chosen categories. Also used for the phone menu.' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'title', type: 'text', required: true, maxLength: 40 },
                    { name: 'categories', type: 'relationship', relationTo: 'product-categories', hasMany: true, required: true },
                    { name: 'maxItems', label: 'Max products shown', type: 'number', min: 1, max: 12, defaultValue: 6 },
                  ],
                },
              ],
            },
            {
              name: 'catalogueCard',
              label: 'Catalogue card',
              type: 'group',
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'badge', type: 'text', maxLength: 20 },
                    { name: 'title', type: 'text', maxLength: 60 },
                  ],
                },
                { name: 'text', type: 'textarea', maxLength: 200 },
                {
                  type: 'row',
                  fields: [
                    { name: 'browseLabel', label: 'Browse button', type: 'text', maxLength: 40 },
                    { name: 'downloadLabel', label: 'Download button', type: 'text', maxLength: 40 },
                  ],
                },
              ],
            },
            { name: 'catalogueFile', label: 'Catalogue PDF', type: 'upload', relationTo: 'media', admin: { description: 'Used by the products menu, footer and home page. Empty = the link below.' } },
            {
              name: 'catalogueUrl',
              label: 'Or catalogue link',
              type: 'text',
              validate: validHref,
              admin: { description: 'Used by the products menu and the footer, e.g. /documents/vextra-hose-catalogue.pdf' },
            },
          ],
        },
        {
          label: 'Footer',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'footerProductsHeading', label: 'Products heading', type: 'text', maxLength: 30 },
                { name: 'footerCompanyHeading', label: 'Company heading', type: 'text', maxLength: 30 },
                { name: 'footerContactHeading', label: 'Address heading', type: 'text', maxLength: 30 },
              ],
            },
            links('footerProductLinks', 'Product links', 'An "All products →" link is always added at the end.'),
            links('footerCompanyLinks', 'Company links', ''),
            { name: 'footerCatalogueLabel', label: 'Catalogue button', type: 'text', maxLength: 40 },
          ],
        },
      ],
    },
  ],
}
