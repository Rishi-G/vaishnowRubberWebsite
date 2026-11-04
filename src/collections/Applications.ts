import type { CollectionConfig } from 'payload'

const MAX_BYTES = 5 * 1024 * 1024

/**
 * Career applications. Each record is the applicant's details plus the uploaded resume
 * (the upload itself is the record, so one request stores both).
 * Anyone may apply; only logged-in admins may read, change or delete — resumes are personal data.
 * Files are stored in /applications, which is git-ignored.
 */
export const Applications: CollectionConfig = {
  slug: 'applications',
  labels: { singular: 'Application', plural: 'Applications' },
  admin: {
    useAsTitle: 'fullName',
    defaultColumns: ['fullName', 'email', 'phone', 'status', 'createdAt'],
    group: 'Careers',
  },
  access: {
    create: () => true,
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  upload: {
    staticDir: 'applications',
    mimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
  },
  hooks: {
    beforeValidate: [
      ({ req, operation, data }) => {
        // only the server decides the status; the public form cannot set it
        if (operation === 'create' && !req.user && data) data.status = 'new'
        const size = req.file?.size
        if (size && size > MAX_BYTES) throw new Error('The resume must be 5 MB or smaller.')
        return data
      },
    ],
  },
  fields: [
    { name: 'fullName', type: 'text', required: true, maxLength: 120 },
    { type: 'row', fields: [{ name: 'email', type: 'email', required: true }, { name: 'phone', type: 'text', required: true, maxLength: 40 }] },
    { name: 'coverNote', type: 'textarea', maxLength: 3000 },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      options: ['new', 'shortlisted', 'interviewed', 'hired', 'rejected'].map((v) => ({ label: v, value: v })),
      admin: { position: 'sidebar' },
    },
  ],
}
