import type { Field } from 'payload'
import { group, hero, link, list, pageGlobal, photo, text, textarea } from './fields'

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
      { type: 'row', fields: [{ name: 'title', type: 'text', required: true, maxLength: 80 }, { name: 'category', type: 'relationship', relationTo: 'product-categories', required: true }] },
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

const chapter = (name: string, label: string, tokens = '') =>
  group(name, label, [
    { type: 'row', fields: [text('eyebrow', 'Small label', 40), text('title', 'Heading', 80)] },
    textarea('body', 'Text', 400),
    text('note', 'Small print', 160),
  ], tokens ? `Tokens filled from the product on show: ${tokens}.` : undefined)

const section = (name: string, label: string, extra: Field[] = []): Field =>
  group(name, label, [{ type: 'row', fields: [text('eyebrow', 'Small label', 40), text('heading', 'Heading', 160)] }, ...extra])

export const HomePageGlobal = pageGlobal('page-home', 'Home page', '/', [
  {
    type: 'tabs',
    tabs: [
      {
        label: '3D banner',
        fields: [
          group('hero', 'Banner', [
            text('eyebrow', 'Small label', 60),
            text('heading', 'Heading', 160),
            textarea('text', 'Intro line', 300),
            { type: 'row', fields: [text('primaryLabel', 'Main button (hoses)', 40), text('railwayPrimaryLabel', 'Main button (railway)', 40), text('secondaryLabel', 'Second button', 40)] },
            group('tabs', 'Family tabs', [
              { type: 'row', fields: [text('hydraulic', 'Hydraulic', 40), text('industrial', 'Industrial & LPG', 40)] },
              { type: 'row', fields: [text('automotive', 'Automotive', 40), text('railway', 'Railway', 40)] },
            ]),
            chapter('cover', 'Scroll step 2 — cover', '{cover}'),
            chapter('fittings', 'Scroll step 3 — fittings'),
            chapter('layers', 'Scroll step 4 — layers', '{tube}, {reinforcement}, {cover}'),
            group('rating', 'Scroll step 5 — rating (heading and text come from the data sheet)', [
              { type: 'row', fields: [text('eyebrow', 'Small label', 40), text('buttonLabel', 'Button', 40)] },
            ]),
          ], 'In the heading, put *stars* around the words shown in blue. Keep texts short: they sit over the 3D model.'),
        ],
      },
      {
        label: 'Sections',
        fields: [
          {
            name: 'facts',
            label: 'Facts strip',
            type: 'array',
            maxRows: 4,
            admin: { description: 'Tokens: {year}, {founders}, {area} (from Company Info).' },
            fields: [{ type: 'row', fields: [text('label', 'Label', 40), text('value', 'Value', 60), text('sub', 'Small text', 120)] }],
          },
          section('railway', 'Railway parts in action', [textarea('text', 'Text', 400), text('detailsLabel', 'Details button', 40)]),
          section('hoses', 'Hose range', [
            {
              name: 'families',
              label: 'Hose families',
              type: 'array',
              fields: [
                { type: 'row', fields: [{ name: 'title', type: 'text', required: true, maxLength: 80 }, { name: 'categories', type: 'relationship', relationTo: 'product-categories', hasMany: true, required: true }] },
                textarea('blurb', 'Text', 400),
                photo(),
              ],
            },
          ]),
          section('finder', 'Hose finder', [textarea('text', 'Text', 400), textarea('noMatch', 'No-match message ({need} = the pressure chosen)', 300)]),
          section('customers', 'Customers (names are edited in Company Info)', [textarea('text', 'Text', 300)]),
          section('works', 'The works (dark section)', [
            { type: 'row', fields: [text('aboutLabel', 'First button', 40), text('contactLabel', 'Second button', 40)] },
            { type: 'row', fields: [text('capabilitiesHeading', 'Capabilities heading', 40), text('certificationHeading', 'Certification heading', 40)] },
          ]),
          group('quote', 'Blue band at the bottom', [
            text('heading', 'Heading', 160),
            textarea('text', 'Text', 300),
            { type: 'row', fields: [text('contactLabel', 'Contact button', 40), text('catalogueLabel', 'Catalogue button', 40)] },
          ]),
        ],
      },
    ],
  },
])

export const ProductsPageGlobal = pageGlobal('page-products', 'Products page', '/products', [
  group('hero', 'Page header', [text('eyebrow', 'Small label', 40), text('title', 'Heading', 120), textarea('lede', 'Intro line', 300)]),
  text('allLabel', '"All" tab label', 30),
  text('searchPlaceholder', 'Search box placeholder', 80),
  textarea('noMatch', 'No-match message ({q} = what was searched)', 300),
])

const titleText = (name: string, label: string, description?: string): Field => ({
  name,
  label,
  type: 'array',
  admin: description ? { description } : undefined,
  fields: [{ type: 'row', fields: [{ name: 'title', type: 'text', required: true, maxLength: 80 }, textarea('text', 'Text', 300)] }],
})

export const CareerPageGlobal = pageGlobal('page-career', 'Career page', '/career', [
  hero(),
  {
    name: 'stats',
    label: 'Numbers strip',
    type: 'array',
    admin: { description: '{landArea} in a value is replaced by the works area from Company Info.' },
    fields: [{ type: 'row', fields: [{ name: 'value', type: 'text', required: true, maxLength: 30 }, { name: 'label', type: 'text', required: true, maxLength: 60 }] }],
  },
  group('why', 'Why work with us', [text('heading', 'Heading', 100), textarea('text', 'Text', 300), titleText('items', 'Reasons')]),
  group('roles', 'Where we hire', [text('heading', 'Heading', 100), textarea('text', 'Text', 300), titleText('items', 'Areas')]),
  group('process', 'Hiring steps', [text('heading', 'Heading', 100), titleText('items', 'Steps')]),
  group('form', 'Application form', [
    text('heading', 'Heading', 80),
    textarea('text', 'Text above the form', 300),
    text('resumeHint', 'Resume hint', 120),
    text('submitLabel', 'Submit button', 40),
    text('successTitle', 'Thank-you heading'),
    textarea('successText', 'Thank-you text', 300),
  ], 'In the thank-you text, {phone} is replaced by the phone number from Company Info. Applications are read under Careers → Applications.'),
])

export const PageGlobals = [HomePageGlobal, ProductsPageGlobal, ContactPageGlobal, CompanyPageGlobal, IndustriesPageGlobal, ResourcesPageGlobal, CareerPageGlobal]
