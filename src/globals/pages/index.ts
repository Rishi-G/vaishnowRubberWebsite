import type { Field } from 'payload'
import { group, hero, link, list, pageGlobal, photo, text, textarea } from './fields'

const CATEGORY_OPTIONS = [
  { label: 'Railway Components', value: 'railway' },
  { label: 'Hydraulic Hoses', value: 'hydraulic' },
  { label: 'Industrial Hoses', value: 'industrial' },
  { label: 'LPG Hoses', value: 'lpg' },
  { label: 'Automotive Hoses', value: 'automotive' },
]

const button = (): Field[] => [
  { type: 'row', fields: [text('buttonLabel', 'Button label', 40), link('buttonHref', 'Button link')] },
]

export const ContactPageGlobal = pageGlobal('page-contact', 'Contact page', '/contact', [
  hero(),
  group('infoBox', 'Dark box under the contact details', [text('title', 'Heading'), textarea('text', 'Text', 300)]),
  group('form', 'Message form', [
    text('heading', 'Heading', 80),
    list('subjects', 'Subject options'),
    text('submitLabel', 'Send button', 40),
    text('successTitle', 'Thank-you heading'),
    textarea('successText', 'Thank-you text', 300),
  ], 'In the thank-you text, {phone} is replaced by the phone number from Company Info.'),
])

export const CompanyPageGlobal = pageGlobal('page-company', 'Company page', '/company', [
  hero(),
  group('facts', 'Facts row (values come from Company Info)', [
    { type: 'row', fields: [text('incorporatedLabel', 'Incorporated label', 40), text('areaLabel', 'Works area label', 40)] },
    { type: 'row', fields: [text('foundersLabel', 'Founders label', 40), text('locationLabel', 'Location label', 40)] },
    text('location', 'Location shown', 80),
  ]),
  group('profile', 'Profile section', [
    text('heading', 'Heading', 120),
    textarea('paragraph1', 'First paragraph'),
    textarea('paragraph2', 'Second paragraph'),
    photo(),
  ], 'Tokens filled from Company Info: {incorporated}, {founders}, {profile}, {landArea}.'),
  text('strengthsHeading', 'Strengths heading (strengths are edited in Company Info)', 120),
  group('plant', 'Manufacturing section (equipment list is edited in Company Info)', [text('heading', 'Heading', 120), textarea('text', 'Text', 300), photo()]),
  text('certificationsHeading', 'Certification heading (certificates are edited in Company Info)', 80),
  group('partnership', 'Blue band at the bottom', [text('heading', 'Heading', 120), textarea('text', 'Text', 400), ...button()]),
])

export const IndustriesPageGlobal = pageGlobal('page-industries', 'Industries page', '/industries', [
  hero(),
  {
    name: 'sectors',
    label: 'Sectors',
    type: 'array',
    admin: { description: 'Each sector lists up to 8 products of its category. Leave the photo empty for the line drawing.' },
    fields: [
      { type: 'row', fields: [{ name: 'title', type: 'text', required: true, maxLength: 80 }, { name: 'category', type: 'select', required: true, options: CATEGORY_OPTIONS }] },
      textarea('lead', 'Lead sentence', 300),
      textarea('body', 'Details', 800),
      photo(),
    ],
  },
  group('cta', 'Dark band at the bottom', [textarea('text', 'Text', 400), ...button()]),
])

export const ResourcesPageGlobal = pageGlobal('page-resources', 'Resources page', '/resources', [
  hero(),
  group('downloads', 'Downloads', [
    text('heading', 'Heading', 80),
    {
      name: 'items',
      label: 'Files',
      type: 'array',
      fields: [
        { name: 'title', type: 'text', required: true, maxLength: 120 },
        textarea('text', 'Description', 300),
        { name: 'file', label: 'Upload PDF', type: 'upload', relationTo: 'media' },
        { name: 'href', label: 'Or file path', type: 'text', admin: { description: 'e.g. /documents/vextra-hose-catalogue.pdf' } },
      ],
    },
  ]),
  group('calculators', 'Calculators', [
    { type: 'row', fields: [text('flowHeading', 'Flow calculator heading', 80), text('pressureHeading', 'Pressure converter heading', 80)] },
    { type: 'row', fields: [textarea('flowText', 'Flow calculator intro', 300), textarea('pressureText', 'Pressure converter intro', 300)] },
  ]),
  group('guidance', 'Installation guidance', [
    text('heading', 'Heading', 120),
    textarea('text', 'Intro', 300),
    {
      name: 'items',
      label: 'Points',
      type: 'array',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'kind', label: 'Drawing', type: 'select', required: true, options: ['twist', 'slack', 'radius', 'adaptor', 'length', 'elbow', 'plane', 'clamp'].map((v) => ({ label: v, value: v })) },
            { name: 'title', type: 'text', required: true, maxLength: 120 },
          ],
        },
        textarea('text', 'Text', 400),
      ],
    },
  ]),
])

export const PageGlobals = [ContactPageGlobal, CompanyPageGlobal, IndustriesPageGlobal, ResourcesPageGlobal]
