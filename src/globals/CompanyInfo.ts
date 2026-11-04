import type { GlobalConfig } from 'payload'
import { revalidatePath } from 'next/cache'

const textRows = (name: string) => ({ name, type: 'array' as const, fields: [{ name: 'text', type: 'text' as const, required: true }] })

export const CompanyInfo: GlobalConfig = {
  slug: 'company-info',
  label: 'Company Info',
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
    { name: 'name', type: 'text', required: true },
    { name: 'brandName', type: 'text' },
    { name: 'incorporated', type: 'text', admin: { description: 'e.g. 14 November 2014' } },
    { name: 'landArea', type: 'text' },
    { name: 'location', type: 'textarea' },
    { name: 'phone', type: 'text', admin: { description: 'Shown in the header, footer, contact page, quote form and error messages.' } },
    { name: 'whatsapp', type: 'text', admin: { description: 'Number with country code, digits only, e.g. 919810294483. Empty = no WhatsApp link.' } },
    { name: 'businessHours', type: 'text', admin: { description: 'e.g. Mon–Sat, 9:30 am – 6:00 pm IST. Empty = not shown.' } },
    { name: 'mapUrl', type: 'text', admin: { description: 'Google Maps link to the works. Empty = no map link.' } },
    { name: 'profile', type: 'textarea' },
    { name: 'founders', type: 'array', fields: [{ name: 'name', type: 'text', required: true }] },
    { name: 'emails', type: 'array', admin: { description: 'The first email is the main one (header, quote form).' }, fields: [{ name: 'email', type: 'email', required: true }] },
    {
      name: 'socials',
      type: 'array',
      admin: { description: 'Shown in the footer.' },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'platform',
              type: 'select',
              required: true,
              options: ['LinkedIn', 'Facebook', 'Instagram', 'YouTube', 'X'].map((v) => ({ label: v, value: v.toLowerCase() })),
            },
            { name: 'url', type: 'text', required: true },
          ],
        },
      ],
    },
    textRows('capabilities'),
    {
      name: 'certifications',
      type: 'array',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'detail', type: 'textarea' },
        {
          name: 'status',
          type: 'select',
          defaultValue: 'stated',
          options: [
            { label: 'Verified — certificate on file', value: 'verified' },
            { label: 'Stated by company — certificate not yet supplied', value: 'stated' },
          ],
        },
        { name: 'documentUrl', type: 'text', admin: { description: 'e.g. /documents/iso-14001-certificate.pdf' } },
      ],
    },
    {
      name: 'customers',
      type: 'array',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'group', type: 'text', required: true },
      ],
    },
    {
      name: 'strengths',
      type: 'array',
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'detail', type: 'text' },
      ],
    },
  ],
}
