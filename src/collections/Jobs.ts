import type { CollectionConfig } from 'payload'
import { revalidatePath } from 'next/cache'

/**
 * Not used any more: the Career page now has an application form instead of a job list.
 * Kept (hidden) because removing it would make the SQLite schema push rebuild tables; delete it
 * together with its table in a planned migration.
 */
export const Jobs: CollectionConfig = {
  slug: 'jobs',
  labels: { singular: 'Job opening', plural: 'Job openings' },
  admin: { hidden: true, useAsTitle: 'title', defaultColumns: ['title', 'location', 'type', 'open', 'order'], group: 'Careers' },
  defaultSort: 'order',
  access: { read: () => true },
  hooks: {
    afterChange: [
      () => {
        try {
          revalidatePath('/career')
        } catch {
          /* outside request scope (seeding) */
        }
      },
    ],
  },
  fields: [
    { name: 'title', type: 'text', required: true, maxLength: 120 },
    {
      type: 'row',
      fields: [
        { name: 'location', type: 'text', maxLength: 80, admin: { description: 'e.g. Moradabad, Uttar Pradesh' } },
        {
          name: 'type',
          type: 'select',
          defaultValue: 'full-time',
          options: [
            { label: 'Full-time', value: 'full-time' },
            { label: 'Part-time', value: 'part-time' },
            { label: 'Contract', value: 'contract' },
            { label: 'Internship', value: 'internship' },
          ],
        },
        { name: 'department', type: 'text', maxLength: 80, admin: { description: 'e.g. Production, Quality, Sales' } },
      ],
    },
    { name: 'summary', type: 'textarea', maxLength: 300, admin: { description: 'One or two lines shown on the card.' } },
    { name: 'description', type: 'textarea', maxLength: 2000, admin: { description: 'Responsibilities and requirements. A blank line starts a new paragraph.' } },
    { type: 'row', fields: [{ name: 'open', type: 'checkbox', defaultValue: true, admin: { description: 'Untick to hide this opening.' } }, { name: 'order', type: 'number', defaultValue: 0, admin: { description: 'Lower numbers show first.' } }] },
  ],
}
