import type { CollectionConfig } from 'payload'
import { revalidatePath } from 'next/cache'

const textRows = (name: string) => ({
  name,
  type: 'array' as const,
  fields: [{ name: 'text', type: 'text' as const, required: true }],
})

/**
 * Products — the VEXTRA catalogue. Hoses carry data-sheet rows (specs) and get a 3D
 * model; railway components have no data sheets yet, so those fields stay empty.
 */
export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'kind', 'standard', 'maxPressureBar', 'order'],
    group: 'Catalogue',
  },
  defaultSort: 'order',
  access: { read: () => true },
  hooks: {
    afterChange: [
      ({ doc }) => {
        try {
          revalidatePath('/')
          revalidatePath('/products')
          revalidatePath(`/products/${doc.slug}`)
        } catch {
          // outside a Next.js request (e.g. seeding)
        }
        return doc
      },
    ],
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { position: 'sidebar', description: 'URL segment, e.g. sae-100-r1 → /products/sae-100-r1' },
    },
    {
      name: 'kind',
      type: 'select',
      required: true,
      defaultValue: 'hose',
      options: [
        { label: 'Hose (data sheet + 3D hose model)', value: 'hose' },
        { label: 'Component (railway)', value: 'component' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Railway Components', value: 'railway' },
        { label: 'Hydraulic Hoses', value: 'hydraulic' },
        { label: 'Industrial Hoses', value: 'industrial' },
        { label: 'LPG Hoses', value: 'lpg' },
        { label: 'Automotive Hoses', value: 'automotive' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'order', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
    { name: 'isHero', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar', description: 'Shown in the home page 3D story' } },
    { name: 'categoryLabel', type: 'text', required: true },
    { name: 'standard', type: 'text', required: true },
    { name: 'tagline', type: 'text', required: true },
    { name: 'description', type: 'textarea', required: true },
    {
      type: 'row',
      fields: [
        { name: 'maxPressureBar', type: 'number' },
        { name: 'maxPressurePsi', type: 'number' },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'sizeRange', type: 'text' },
        { name: 'temperatureRange', type: 'text' },
      ],
    },
    { name: 'image', type: 'text', admin: { description: 'Authentic product image path, e.g. /assets/sae-100-r1.jpg. Leave empty if none.' } },
    { name: 'imageUpload', type: 'upload', relationTo: 'media' },
    {
      name: 'coverColor',
      type: 'number',
      admin: { description: '3D model cover colour as a decimal RGB integer (e.g. orange LPG hose = 14250014). Empty = black.' },
    },
    {
      name: 'construction',
      type: 'group',
      fields: [
        { name: 'tube', type: 'text' },
        { name: 'reinforcement', type: 'text', admin: { description: 'Drives the 3D model: "Two braid…", "One yarn braided", etc.' } },
        { name: 'cover', type: 'text' },
      ],
    },
    textRows('features'),
    textRows('applications'),
    textRows('recommendedFluids'),
    { name: 'dataNote', type: 'textarea', admin: { description: 'Internal flag for catalogue values that need client confirmation.' } },
    {
      name: 'specs',
      label: 'Technical data sheet rows (from the catalogue)',
      type: 'array',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'code', type: 'text', required: true },
            { name: 'dashSize', type: 'text', required: true },
            { name: 'dn', type: 'number', required: true },
            { name: 'idInch', type: 'text', required: true },
            { name: 'idMm', type: 'number', required: true },
            { name: 'odMm', type: 'number', required: true },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'workingPressureBar', type: 'number', required: true },
            { name: 'workingPressurePsi', type: 'number', required: true },
            { name: 'burstPressureBar', type: 'number', required: true },
            { name: 'burstPressurePsi', type: 'number', required: true },
            { name: 'bendRadiusMm', type: 'number', admin: { description: 'Catalogue prints "–" for some sizes' } },
          ],
        },
      ],
    },
  ],
}
