/**
 * Page text as it is today. Used three ways: seeded into the page globals (npm run seed),
 * as the fallback for any field an editor leaves empty, and by the static GitHub Pages build.
 * {tokens} are filled from Company Info when the page renders.
 */
import type { ProductCategory } from '@/types'
import type { PictKind } from '@/components/site/graphics'

const t = (...items: string[]) => items.map((text) => ({ text }))
const photo = (src: string, alt: string, caption = '') => ({ src, alt, caption })

export const PAGES = {
  contact: {
    hero: {
      title: 'Talk to the Moradabad works.',
      lede: 'Send a requirement, specification or drawing for a quotation, or ask about export and technology partnerships.',
    },
    infoBox: {
      title: 'Have a product and size in mind?',
      text: 'Put the product, size and working pressure in your message.',
    },
    form: {
      heading: 'Send a message',
      subjects: t('General enquiry', 'Railway components', 'Hose or hose assembly', 'Export / technology partnership', 'Other'),
      submitLabel: 'Send message',
      successTitle: 'Thank you, your message has been received.',
      successText: 'Our sales team will get back to you. For anything urgent, call {phone}.',
    },
  },

  company: {
    hero: {
      title: 'Vaishno Rubber Industries Pvt. Ltd.',
      lede: 'Maker of VEXTRA hoses and railway rubber components, at a works in Moradabad, Uttar Pradesh.',
    },
    facts: {
      incorporatedLabel: 'Incorporated',
      areaLabel: 'Works area',
      foundersLabel: 'Founded by',
      locationLabel: 'Located at',
      location: 'Moradabad, Uttar Pradesh',
    },
    profile: {
      heading: 'A works built around rubber, steel and testing.',
      paragraph1: 'Vaishno Rubber Industries Pvt. Ltd. was incorporated on {incorporated} by {founders}. {profile}',
      paragraph2: 'The production unit in Moradabad (U.P.) is spread over {landArea}. The company also runs a laboratory (R&D) that tests the quality of each batch of rubber it makes.',
      photo: photo('/assets/photos/hose-range.jpg', 'VEXTRA hose assemblies laid out on a pallet at the works', 'VEXTRA hose assemblies, photographed at the works.'),
    },
    strengthsHeading: 'Why buyers choose VEXTRA',
    plant: {
      heading: 'Manufacturing and testing',
      text: 'Equipment and facilities as listed by the company.',
      photo: photo('/assets/photos/vestibule-label.jpg', 'Moulded VEXTRA label with month, year and batch number on a rubber vestibule', 'Each moulding carries the maker’s mark, month and year, and a batch number.'),
    },
    certificationsHeading: 'Certification',
    partnership: {
      heading: 'Export and technology partnerships',
      text: 'We are looking for technology-transfer partners in Europe, China and the USA for selected products, and welcome export enquiries.',
      buttonLabel: 'Start a conversation',
      buttonHref: '/contact',
    },
  },

  industries: {
    hero: {
      title: 'Where VEXTRA products work.',
      lede: 'The sectors we supply today, and the products we make for each.',
    },
    sectors: [
      {
        title: 'Railways',
        lead: 'Our core market: Indian Railways, its production units and railway OEMs.',
        body: 'Elastomeric pads, air brake hose couplings (BP & FP), inter-car gangway mountings, UIC elastomer flange connections, bonded items for FIAT bogies, PU side bearers, elastic rings and spheriblocs — plus hydraulic hoses and assemblies.',
        category: 'railway' as ProductCategory,
        photo: photo('/assets/photos/vestibule.jpg', 'Black rubber inter-car vestibule frame laid out at the works', 'Inter-car gangway vestibule frame.'),
      },
      {
        title: 'Earthmoving and heavy equipment',
        lead: 'High-pressure hydraulic hoses and hose assemblies for earthmovers.',
        body: 'SAE 100 R1 and R2, SH33 extra-high-pressure, jack and loader hoses, with end fittings and adapters.',
        category: 'hydraulic' as ProductCategory,
        photo: photo('/assets/photos/hose-fittings.jpg', 'Hydraulic hose assemblies with crimped steel fittings and blue dust caps', 'Hydraulic hose assemblies with crimped fittings.'),
      },
      {
        title: 'Oil and gas distribution',
        lead: 'LPG hoses and hose assemblies for PSU oil companies and OEMs.',
        body: 'LPG hoses to BS EN 1762 Type-D and IS 9573 Type-I and Type-II.',
        category: 'lpg' as ProductCategory,
        photo: photo('', ''),
      },
    ],
    cta: {
      text: 'Working in a sector not listed here, such as defence? Tell us the requirement, and we will say whether we can supply it.',
      buttonLabel: 'Send an enquiry',
      buttonHref: '/contact',
    },
  },

  resources: {
    hero: {
      title: 'Catalogue, certificate and hose guidance.',
      lede: 'Downloads, installation guidance and two calculators taken from the VEXTRA catalogue.',
    },
    downloads: {
      heading: 'Downloads',
      items: [
        { title: 'VEXTRA hose catalogue', text: 'Hydraulic, industrial, LPG and automotive hose data sheets, flow chart and installation guidance.', href: '/documents/vextra-hose-catalogue.pdf' },
        { title: 'ISO 9001:2015 certificate (BSCIC)', text: 'Quality Management System certificate issued by BSCIC Certifications Pvt. Ltd., valid to 5 December 2027.', href: '/documents/iso-9001-bscic-certificate.pdf' },
        { title: 'ISO 9001:2015 certificate (QFS)', text: 'Quality Management System certificate issued by QFS Management Systems LLP, valid to 14 March 2027.', href: '/documents/iso-9001-qfs-certificate.pdf' },
        { title: 'ISO 14001:2015 certificate', text: 'Environmental Management System certificate issued by QFS Management Systems LLP.', href: '/documents/iso-14001-certificate.pdf' },
      ],
    },
    calculators: {
      flowHeading: 'Hose size from flow',
      flowText: 'The catalogue’s flow-capacity method, with the result drawn against the standard sizes.',
      pressureHeading: 'Pressure units',
      pressureText: 'Convert between bar, psi and MPa.',
    },
    guidance: {
      heading: 'Installation: do’s and don’ts',
      text: 'Eight points from the catalogue. In the drawings, red marks the mistake and blue marks the right way.',
      items: [
        { kind: 'twist' as PictKind, title: 'Do not twist the hose', text: 'Pressure applied to a twisted hose can result in hose failure or loosening of connections.' },
        { kind: 'slack' as PictKind, title: 'Allow slack for length change', text: 'When a hose is installed straight, leave enough slack to provide for the length changes that occur when pressure is applied.' },
        { kind: 'radius' as PictKind, title: 'Keep bend radii as large as possible', text: 'To avoid hose collapse and flow restriction, refer to the hose specification tables for minimum bend radii.' },
        { kind: 'adaptor' as PictKind, title: 'Use proper angle adaptors', text: 'Angle adaptors avoid a sharp twist or bend in the hose.' },
        { kind: 'length' as PictKind, title: 'Allow adequate hose length', text: 'Enough length distributes movement on flexing applications and avoids abrasion.' },
        { kind: 'elbow' as PictKind, title: 'Use elbows and adaptors to relieve strain', text: 'They give neater installations that are more accessible for inspection and maintenance.' },
        { kind: 'plane' as PictKind, title: 'Bend in the plane of the motion', text: 'Prevent twisting and distortion by bending the hose in the same plane as the motion of the part it connects to.' },
        { kind: 'clamp' as PictKind, title: 'Avoid rubbing and abrasion', text: 'Route hose away from moving parts. Clamps of the correct size can support long runs; a loose clamp lets the hose move inside it and causes abrasion.' },
      ],
    },
  },
}

export type PageSlug = keyof typeof PAGES
export type PageContent<K extends PageSlug> = (typeof PAGES)[K]
