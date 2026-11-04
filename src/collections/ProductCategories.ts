import type { CollectionConfig } from 'payload'
import { revalidatePath } from 'next/cache'

/**
 * Product categories. The slug is the URL key (/products?category=lpg) and must not change once
 * products use it. The slug "railway" switches on the railway-component layouts (3D action viewer,
 * home railway section), so keep it for railway parts.
 */
export const ProductCategories: CollectionConfig = {
  slug: 'product-categories',
  labels: { singular: 'Product category', plural: 'Product categories' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'tabLabel', 'order'],
    group: 'Catalogue',
  },
  defaultSort: 'order',
  access: { read: () => true },
  hooks: {
    afterChange: [
      () => {
        try {
          revalidatePath('/', 'layout')
        } catch {
          /* outside request scope (seeding) */
        }
      },
    ],
  },
  fields: [
    { name: 'name', type: 'text', required: true, admin: { description: 'Shown on product pages and breadcrumbs, e.g. "Hydraulic Hoses".' } },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      validate: (v: string | null | undefined) => (v && /^[a-z0-9-]+$/.test(v) ? true : 'Lowercase letters, numbers and dashes only'),
      admin: { position: 'sidebar', description: 'URL key, e.g. lpg → /products?category=lpg. Do not change once in use.' },
    },
    { name: 'order', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
    {
      type: 'row',
      fields: [
        { name: 'tabLabel', label: 'Tab label', type: 'text', required: true, admin: { description: 'Products page tab, e.g. "Hydraulic hoses".' } },
        { name: 'shortLabel', label: 'Short label', type: 'text', required: true, admin: { description: 'Hose finder button, e.g. "Hydraulic".' } },
      ],
    },
    {
      name: 'enquiryLabel',
      label: 'Quote form option',
      type: 'text',
      admin: { description: 'Shown in the quote form\'s "Product Family" list, e.g. "Hydraulic Hoses (SAE 100 R1, R2, SH33, Jack)". Empty = not listed.' },
    },
  ],
}
