import type { CollectionConfig } from 'payload'

/**
 * Enquiries — RFQ modal and contact-form submissions.
 * Anyone may create (public form); only logged-in admins may read/update/delete.
 */
export const Enquiries: CollectionConfig = {
  slug: 'enquiries',
  admin: {
    useAsTitle: 'reference',
    defaultColumns: ['reference', 'type', 'fullName', 'companyName', 'email', 'status', 'createdAt'],
    group: 'Leads',
  },
  access: {
    create: () => true,
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        if (operation === 'create') {
          // Server-generated reference: the client never decides it, so it can be trusted in follow-ups.
          data.reference = `VEXTRA-RFQ-${Date.now().toString(36).toUpperCase()}`
          data.status = 'new'
        }
        return data
      },
    ],
  },
  fields: [
    { name: 'reference', type: 'text', admin: { readOnly: true, position: 'sidebar' } },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      options: ['new', 'in-progress', 'quoted', 'closed'].map((v) => ({ label: v, value: v })),
      admin: { position: 'sidebar' },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'rfq',
      options: [
        { label: 'Technical RFQ', value: 'rfq' },
        { label: 'Contact form', value: 'contact' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'fullName', type: 'text', required: true, maxLength: 120 },
    { name: 'companyName', type: 'text', maxLength: 160 },
    { name: 'email', type: 'email', required: true },
    { name: 'phone', type: 'text', maxLength: 40 },
    { name: 'location', type: 'text', maxLength: 160 },
    { name: 'subject', type: 'text', maxLength: 200 },
    { name: 'category', type: 'text', maxLength: 40 },
    { name: 'productSlug', label: 'Product (slug)', type: 'text', maxLength: 120 },
    { name: 'idSize', type: 'text', maxLength: 40 },
    { name: 'workingPressure', type: 'text', maxLength: 40 },
    { name: 'temperature', type: 'text', maxLength: 40 },
    { name: 'lengthMeters', type: 'number', min: 0 },
    { name: 'fittingType', type: 'text', maxLength: 120 },
    { name: 'application', type: 'text', maxLength: 200 },
    { name: 'notes', type: 'textarea', maxLength: 4000 },
  ],
}
