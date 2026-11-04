/**
 * VEXTRA product data — transcribed from "Hydraulic Hose Fittings & Adapters.pdf"
 * (the company's hose catalogue), the ISO 14001 certificate, and the client's
 * answers in "Vaishno Rubber Website Redesign.pdf".
 *
 * Rules: nothing here is invented. Where the source is silent the field is left
 * empty rather than filled. Railway components have no data sheets yet.
 */
import type { Product, ProductCategory, ProductSpecItem } from '@/types'

/* ───────────── helpers ───────────── */

const inchToMm = (s: string): number => {
  const parts = s.replace(/"/g, '').replace('-', ' ').trim().split(/\s+/)
  const val = parts.reduce((sum, p) => {
    if (p.includes('/')) {
      const [a, b] = p.split('/').map(Number)
      return sum + a / b
    }
    return sum + Number(p)
  }, 0)
  return Math.round(val * 25.4 * 10) / 10
}

/** one row per line: dash|dn|ID"|OD mm|WP bar|WP psi|burst bar|burst psi|bend mm ("-" if not printed) */
function table(code: (dash: string) => string, rows: string): ProductSpecItem[] {
  return rows
    .trim()
    .split('\n')
    .map((line) => {
      const [dash, dn, id, od, wp, wpPsi, bb, bPsi, bend] = line.split('|').map((s) => s.trim())
      return {
        code: code(dash),
        dashSize: dash,
        dn: Number(dn),
        idInch: id,
        idMm: inchToMm(id),
        odMm: Number(od),
        workingPressureBar: Number(wp),
        workingPressurePsi: Number(wpPsi),
        burstPressureBar: Number(bb),
        burstPressurePsi: Number(bPsi),
        bendRadiusMm: bend && bend !== '-' ? Number(bend) : undefined,
      }
    })
}

const IMG: Record<ProductCategory, string> = {
  hydraulic: '/assets/hydraulic-hose.jpg',
  industrial: '/assets/industrial-hoses.jpg',
  lpg: '/assets/industrial-hoses.jpg',
  automotive: '/assets/automotive-hoses.jpg',
  railway: '',
}
const LABEL: Record<ProductCategory, string> = {
  railway: 'Railway Components',
  hydraulic: 'Hydraulic Hoses',
  industrial: 'Industrial Hoses',
  lpg: 'LPG Hoses',
  automotive: 'Automotive Hoses',
}

interface HoseDef {
  id: string
  name: string
  category: ProductCategory
  standard: string
  tagline: string
  tube: string
  reinforcement: string
  cover: string
  temp: string
  highlight?: string
  applications?: string[]
  fluid: string
  code: (dash: string) => string
  rows: string
  image?: string
  coverColor?: number
  dataNote?: string
  isHero?: boolean
}

const OIL_COVER = 'Oil, weather & abrasion resistant synthetic rubber'
const HYD_TUBE = 'Synthetic rubber, resistant to hydraulic fluids'
const T100 = '-40°C to +100°C (max 120°C intermittent)'

function hose(d: HoseDef): Product {
  const specs = table(d.code, d.rows)
  const first = specs[0], last = specs[specs.length - 1]
  const maxBar = Math.max(...specs.map((s) => s.workingPressureBar))
  const psi = specs.find((s) => s.workingPressureBar === maxBar)!.workingPressurePsi
  return {
    id: d.id,
    name: d.name,
    kind: 'hose',
    category: d.category,
    categoryLabel: LABEL[d.category],
    standard: d.standard,
    tagline: d.tagline,
    description: `${d.tagline}. Tube: ${d.tube}. Reinforcement: ${d.reinforcement.toLowerCase()}. Cover: ${d.cover.toLowerCase()}.`,
    features: d.highlight ? [d.highlight] : [],
    construction: { tube: d.tube, reinforcement: d.reinforcement, cover: d.cover },
    temperatureRange: d.temp,
    applications: d.applications ?? (d.highlight ? [d.highlight.replace(/^Suitable for /, '').replace(/\.$/, '')] : []),
    recommendedFluids: [d.fluid],
    maxPressureBar: maxBar,
    maxPressurePsi: psi,
    sizeRange: `${first.idInch} to ${last.idInch} (DN${first.dn}–DN${last.dn})`,
    image: d.image ?? IMG[d.category],
    specs,
    coverColor: d.coverColor,
    dataNote: d.dataNote,
    isHero: d.isHero,
  }
}

const component = (id: string, name: string, tagline: string, description: string, applications: string[]): Product => ({
  id,
  name,
  kind: 'component',
  category: 'railway',
  categoryLabel: LABEL.railway,
  standard: 'Specification & drawings on request',
  tagline,
  description,
  features: [],
  applications,
  recommendedFluids: [],
  specs: [],
})

const WORKS =
  'Manufactured at the Moradabad works, which has in-house compound mixing, automated rubber injection moulding and shear-fatigue testing.'

/* ───────────── products ───────────── */

export const PRODUCTS: Product[] = [
  /* — Railway components (listed in the ISO 14001 scope and the client brief) — */
  component(
    'elastomeric-pads-design-b',
    'Elastomeric Pads (Design-B)',
    'Elastomeric pads for Indian Railways and OEMs',
    `Elastomeric pads (Design-B) supplied to Indian Railways and railway OEMs. ${WORKS}`,
    ['Indian Railways', 'Railway OEMs'],
  ),
  component(
    'air-brake-hose-coupling',
    'Air Brake Hose Coupling (BP & FP)',
    'Brake pipe and feed pipe hose couplings for railway brake systems',
    `Connection for brake system and air brake hose coupling for brake pipe (BP) and feed pipe (FP), used in railway applications. ${WORKS}`,
    ['Indian Railways', 'Railway OEMs'],
  ),
  component(
    'inter-car-gangway-mounting',
    'Inter-car Gangway Mounting (Vestibules)',
    'Inter-car gangway mountings for passenger coaches',
    `Inter-car gangway mounting (vestibule) products for Indian Railways. ${WORKS}`,
    ['Indian Railways'],
  ),
  component(
    'uic-elastomer-flange-connections',
    'UIC Type Elastomer Flange Connections',
    'Inter-communication between passenger coaches',
    `UIC type elastomer flange connections for inter-communication between passenger coaches. ${WORKS}`,
    ['Passenger coaches'],
  ),
  component(
    'elastomer-metal-bonded-fiat-bogie',
    'Elastomer-Metal Bonded Items for FIAT Bogie',
    'Rubber-to-metal bonded components for FIAT bogies',
    `Elastomer-metal bonded items for FIAT bogies. ${WORKS}`,
    ['Railway bogies'],
  ),
  component(
    'pu-constant-contact-side-bearers',
    'PU Constant Contact Side Bearers (PU CCSB)',
    'Polyurethane side bearers for freight stock bogies',
    `Polyurethane constant contact side bearers (PU CCSB) used in freight stock operating on bogies. The works has PU casting machinery from Covestro Elastomers SAS, France.`,
    ['Freight stock bogies'],
  ),
  component(
    'elastic-ring-traction-link',
    'Elastic Ring for Traction Link',
    'Elastic rings for three-phase electric locomotives',
    `Elastic ring used in the traction link of three-phase electric locomotives. ${WORKS}`,
    ['Three-phase electric locomotives'],
  ),
  component(
    'spheriblocs',
    'Spheriblocs',
    'Spheriblocs for Indian Railways',
    `Spheriblocs for Indian Railways. ${WORKS}`,
    ['Indian Railways'],
  ),

  /* — Hydraulic hoses — */
  hose({
    id: 'sae-100-r1',
    name: 'SAE 100 R1 AT / EN 853 1SN',
    category: 'hydraulic',
    standard: 'SAE 100 R1 AT Hi-Impulse / DIN 20022 Part 3 / EN 853-1SN',
    tagline: 'Single wire braided hydraulic hose',
    tube: HYD_TUBE,
    reinforcement: 'One braid of high tensile steel wire',
    cover: OIL_COVER,
    temp: T100,
    fluid: 'Hydraulic fluids',
    applications: ['Hydraulic hoses and assemblies for earthmovers and Indian Railways'],
    code: (d) => `01-${d}`,
    image: '/assets/sae-100-r1.jpg',
    rows: `
4|6|1/4"|13.4|225|3263|900|13050|100
5|8|5/16"|15.0|215|3118|850|12325|115
6|10|3/8"|17.4|180|2610|720|10440|130
8|12|1/2"|20.5|160|2320|640|9280|180
10|16|5/8"|23.6|130|1885|520|7540|200
12|19|3/4"|27.7|105|1523|420|6090|240
16|25|1"|35.4|88|1276|350|5075|300
20|31|1 1/4"|43.7|63|914|250|3625|420
24|38|1 1/2"|50.0|50|725|200|2900|500
32|51|2"|63.7|40|580|160|2320|630`,
  }),
  hose({
    id: 'sae-100-r2',
    name: 'SAE 100 R2 AT / EN 853 2SN',
    category: 'hydraulic',
    standard: 'SAE 100 R2 AT Hi-Impulse / DIN 20022 Part 4 / EN 853-2SN',
    tagline: 'Double wire braided hydraulic hose',
    tube: HYD_TUBE,
    reinforcement: 'Two braid of high tensile steel wire',
    cover: OIL_COVER,
    temp: T100,
    fluid: 'Hydraulic fluids',
    applications: ['Hydraulic hoses and assemblies for earthmovers and Indian Railways'],
    code: (d) => `02-${d}`,
    isHero: true,
    rows: `
4|6|1/4"|14.9|400|5800|1600|23200|100
5|8|5/16"|16.6|350|5075|1400|20300|115
6|10|3/8"|18.9|330|4785|1320|19140|130
8|12|1/2"|22.1|275|3988|1100|15950|180
10|16|5/8"|25.4|250|3625|1000|14500|200
12|19|3/4"|29.3|215|3118|850|12325|240
16|25|1"|37.6|165|2393|650|9425|300
20|31|1 1/4"|47.5|125|1813|500|7250|420
24|38|1 1/2"|54.5|90|1305|360|5220|500
32|51|2"|67.0|80|1160|320|4640|630`,
  }),
  hose({
    id: 'sh33-extra-high-pressure',
    name: 'SH33 — Extra High Pressure Hose',
    category: 'hydraulic',
    standard: 'VR proprietary SH33',
    tagline: 'Extra high pressure hose, three braids of steel wire',
    tube: HYD_TUBE,
    reinforcement: 'Three braid of high tensile steel wire',
    cover: OIL_COVER,
    temp: T100,
    fluid: 'Hydraulic fluids',
    code: (d) => `VR 33-${d}`,
    rows: `
8|12|1/2"|24.8|470|6815|1880|27260|160
10|16|5/8"|27.8|400|5800|1600|23200|216
12|19|3/4"|32.5|355|5148|1420|20590|260
16|25|1"|40.0|310|4495|1240|17980|310
20|31|1 1/4"|46.5|240|3480|960|13920|410`,
  }),
  hose({
    id: 'jack-hose',
    name: 'Jack Hose 725 Bar WP',
    category: 'hydraulic',
    standard: 'VR Jack Hose 725 bar working pressure',
    tagline: 'Two-braid hose for hydraulic jacking',
    tube: HYD_TUBE,
    reinforcement: 'Two braid of high tensile steel wire',
    cover: OIL_COVER,
    temp: '-40°C to +50°C',
    highlight: 'Ideal for hydraulic jacking systems.',
    fluid: 'Hydraulic fluids',
    code: (d) => `Jack-${d}`,
    rows: `
4|6|1/4"|14.2|725|10513|1450|21025|100
6|10|3/8"|17.5|725|10513|1450|21025|130`,
  }),
  hose({
    id: 'loader-hose',
    name: 'Loader Hose — Super Loader Series',
    category: 'hydraulic',
    standard: 'VR Super Loader Series',
    tagline: 'Two-braid hose for extra high pressure loader application',
    tube: HYD_TUBE,
    reinforcement: 'Two braid of high tensile steel wire',
    cover: OIL_COVER,
    temp: T100,
    highlight: 'Suitable for extra high pressure loader application.',
    fluid: 'Hydraulic fluids',
    code: (d) => `Loader-${d}`,
    rows: `
8|12|1/2"|22.5|345|5000|1380|20010|180
12|19|3/4"|29.5|260|3770|1040|15080|240
16|25|1"|38.0|220|3200|880|12760|300`,
  }),
  hose({
    id: 'sae-100-r3',
    name: 'SAE 100 R3',
    category: 'hydraulic',
    standard: 'SAE 100 R3',
    tagline: 'Double textile braided hydraulic hose',
    tube: HYD_TUBE,
    reinforcement: 'Two textile braided',
    cover: OIL_COVER,
    temp: '-40°C to +100°C',
    highlight: 'Suitable for use with petroleum & water based hydraulic fluids.',
    fluid: 'Petroleum & water based hydraulic fluids',
    code: (d) => `03-${d}`,
    rows: `
4|6|1/4"|14.8|87|1262|348|5046|75
5|8|5/16"|17.3|84|1218|336|4872|100
6|10|3/8"|19.0|78|1131|312|4524|100
8|12|1/2"|23.8|70|1015|280|4060|125
10|16|5/8"|26.9|61|885|244|3538|140
12|19|3/4"|31.5|52|754|208|3016|150
16|25|1"|38.0|39|566|156|2262|205`,
  }),
  hose({
    id: 'sae-100-r6',
    name: 'SAE 100 R6',
    category: 'hydraulic',
    standard: 'SAE 100 R6 (not covered under SAE)',
    tagline: 'Single textile braided hydraulic hose',
    tube: HYD_TUBE,
    reinforcement: 'Single textile braided',
    cover: OIL_COVER,
    temp: '-40°C to +100°C',
    fluid: 'Hydraulic fluids',
    code: (d) => `06-${d}${d === '16' ? '*' : ''}`,
    rows: `
4|6|1/4"|13.0|28|406|112|1624|65
5|8|5/16"|14.2|28|406|112|1624|75
6|10|3/8"|15.7|28|406|112|1624|75
8|12|1/2"|19.7|28|406|112|1624|100
10|16|5/8"|23.2|24|348|96|1392|125
12|19|3/4"|26.0|21|305|84|1218|150
16|25|1"|33.1|15|218|60|870|177`,
  }),
  hose({
    id: 'sae-100-r5',
    name: 'SAE 100 R5',
    category: 'hydraulic',
    standard: 'SAE 100 R5',
    tagline: 'Textile braid separated by one wire braid, cotton braid cover',
    tube: HYD_TUBE,
    reinforcement: 'One braid of high tensile steel wire & textile braided',
    cover: 'Oil & mildew resistant rubber impregnated black cotton braid',
    temp: '-40°C to +100°C',
    highlight: 'Suitable for use with petroleum & water based hydraulic fluids.',
    fluid: 'Petroleum & water based hydraulic fluids',
    code: (d) => `05-${d}`,
    rows: `
4|5|3/16"|13.4|210|3045|840|12180|75
5|6|1/4"|14.8|210|3045|840|12180|85
6|8|5/16"|17.2|157|2277|628|9108|100
8|10|13/32"|19.3|140|2030|560|8120|115
10|12|1/2"|23.3|122|1769|488|7076|140
12|16|5/8"|27.4|105|1523|420|6090|165
16|22|7/8"|31.3|56|812|224|3248|185
20|29|1 1/8"|38.4|43|625|172|2494|230
24|35|1 3/8"|44.9|35|500|140|2030|265
32|46|1 13/16"|56.2|24|350|96|1392|335`,
  }),
  hose({
    id: 'sae-100-r5r',
    name: 'SAE 100 R5R',
    category: 'hydraulic',
    standard: 'SAE 100 R5R',
    tagline: 'Textile inner braid and wire reinforcement with rubber outer cover',
    tube: HYD_TUBE,
    reinforcement: 'One braid of high tensile steel wire & textile braided',
    cover: OIL_COVER,
    temp: '-40°C to +100°C',
    highlight: 'Suitable for use with petroleum & water based hydraulic fluids.',
    fluid: 'Petroleum & water based hydraulic fluids',
    code: (d) => `5R-${d}`,
    rows: `
4|5|3/16"|13.2|210|3045|840|12180|75
5|6|1/4"|14.7|210|3045|840|12180|85
6|8|5/16"|17.0|157|2277|628|9108|100
8|10|13/32"|19.3|140|2030|560|8120|115
10|12|1/2"|23.3|122|1769|488|7076|140
12|16|5/8"|27.2|105|1523|420|6090|165
16|22|7/8"|31.2|56|812|224|3248|185
20|29|1 1/8"|38.1|43|625|172|2494|230
24|35|1 3/8"|44.7|35|500|140|2030|265
32|46|1 13/16"|56.4|24|350|96|1392|335`,
  }),

  /* — Industrial hoses — */
  hose({
    id: 'steam-hose-type-2',
    name: 'Steam Hose Type-2 — 51 Series',
    category: 'industrial',
    standard: 'IS 10655 Type-2',
    tagline: 'Single wire braided steam hose, WP 10 bar',
    tube: 'Synthetic rubber, saturated steam & heat resistant',
    reinforcement: 'One high tensile steel wire braided',
    cover: 'Steam & heat resistant synthetic rubber',
    temp: '-40°C to +195°C',
    highlight: 'Suitable for use with saturated steam application.',
    fluid: 'Saturated steam',
    code: (d) => `51 - ${d}`,
    rows: `
6|10|3/8"|18.9|10|145|100|1450|130
8|12|1/2"|22.0|10|145|100|1450|180
10|16|5/8"|25.4|10|145|100|1450|200
12|19|3/4"|28.7|10|145|100|1450|240
16|25|1"|35.9|10|145|100|1450|300
20|31|1 1/4"|43.5|10|145|100|1450|400
24|38|1 1/2"|50.5|10|145|100|1450|500
32|51|2"|63.5|10|145|100|1450|650`,
  }),
  hose({
    id: 'steam-hose-type-3',
    name: 'Steam Hose Type-3 — 52 Series',
    category: 'industrial',
    standard: 'IS 10655 Type-3',
    tagline: 'Double wire braided steam hose, WP 17 bar',
    tube: 'Synthetic rubber, saturated steam & heat resistant',
    reinforcement: 'Two high tensile steel wire braided',
    cover: 'Steam & heat resistant synthetic rubber',
    temp: '-40°C to +210°C',
    highlight: 'Suitable for use with saturated steam application.',
    fluid: 'Saturated steam',
    code: (d) => `52 - ${d}`,
    rows: `
6|10|3/8"|21.0|17|247|160|2320|130
8|12|1/2"|24.0|17|247|160|2320|180
10|16|5/8"|27.6|17|247|160|2320|200
12|19|3/4"|30.9|17|247|160|2320|240
16|25|1"|38.6|17|247|160|2320|300
20|31|1 1/4"|46.0|17|247|160|2320|400
24|38|1 1/2"|54.3|17|247|160|2320|500
32|51|2"|67.5|17|247|160|2320|650`,
  }),
  hose({
    id: 'rock-drill-hose-wire',
    name: 'Super Dynamic Rock Drill Hose — Wire Braided',
    category: 'industrial',
    standard: 'IS 446 Type-3 (wire braided), WP 500 psi',
    tagline: 'Wire braided rock drill hose for pneumatic service',
    tube: 'Synthetic rubber',
    reinforcement: 'One high tensile steel wire braided',
    cover: OIL_COVER,
    temp: '-40°C to +70°C',
    highlight: 'Suitable for heavy duty high pressure pneumatic application (with oil resistance).',
    fluid: 'Compressed air (pneumatic)',
    code: (d) => `RDH - ${d} (1W)`,
    rows: `
8|12|1/2"|21.2|35|500|138|2000|180
10|16|5/8"|24.0|35|500|138|2000|200
12|19|3/4"|27.7|35|500|138|2000|240
16|25|1"|35.7|35|500|138|2000|300
20|31|1 1/4"|43.0|35|500|138|2000|420
24|38|1 1/2"|50.5|35|500|138|2000|500
32|51|2"|63.5|35|500|138|2000|630`,
  }),
  hose({
    id: 'rock-drill-hose-yarn',
    name: 'Super Dynamic Rock Drill Hose — Yarn Braided',
    category: 'industrial',
    standard: 'IS 446 Type-3 (yarn braided)',
    tagline: 'Yarn braided rock drill hose for pneumatic service',
    tube: 'Synthetic rubber',
    reinforcement: 'One yarn braided',
    cover: OIL_COVER,
    temp: '-40°C to +70°C',
    highlight: 'Suitable for high pressure pneumatic application (with oil resistance).',
    fluid: 'Compressed air (pneumatic)',
    code: (d) => `RDH - ${d} (1Y)`,
    rows: `
8|12|1/2"|21.2|21|300|83|1200|-
12|19|3/4"|27.7|21|300|83|1200|-
16|25|1"|36.0|21|300|83|1200|-
20|31|1 1/4"|43.0|14|200|55|800|-
24|38|1 1/2"|50.5|14|200|55|800|-
32|51|2"|63.5|14|200|55|800|-`,
  }),

  /* — LPG hoses — */
  hose({
    id: 'lpg-hose-en-1762-type-d',
    name: 'LPG Hose — BS EN 1762 Type-D',
    category: 'lpg',
    standard: 'BS EN 1762 Type-D',
    tagline: 'Single wire braided LPG hose',
    tube: 'Synthetic rubber, resistant to LPG',
    reinforcement: 'One high tensile steel wire braided',
    cover: OIL_COVER,
    temp: '-40°C to +70°C',
    fluid: 'LPG',
    code: (d) => `1762D - ${d}`,
    rows: `
8|12|1/2"|22.7|25|363|100|1450|100
10|16|5/8"|25.4|25|363|100|1450|125
12|19|3/4"|30.5|25|363|100|1450|160
16|25|1"|37.5|25|363|100|1450|200`,
  }),
  hose({
    id: 'lpg-hose-is-9573-type-ii',
    name: 'LPG Hose — IS 9573 Type-II',
    category: 'lpg',
    standard: 'IS 9573 Type-II',
    tagline: 'Single wire braided LPG hose with orange cover',
    tube: 'Synthetic rubber, resistant to LPG',
    reinforcement: 'One high tensile steel wire braided',
    cover: 'Oil & weather resistant synthetic rubber, orange colour',
    temp: '-40°C to +70°C',
    fluid: 'LPG',
    coverColor: 0xd9741a,
    code: (d) => `95734 - ${d}`,
    rows: `
5|8|5/16"|15.0|10|145|50|725|95
6|10|3/8"|18.0|10|145|50|725|120
8|12|1/2"|20.2|10|145|50|725|150`,
  }),
  hose({
    id: 'lpg-hose-is-9573-type-i',
    name: 'LPG Hose — IS 9573 Type-I (ARAI Approved)',
    category: 'lpg',
    standard: 'IS 9573 Type-I — ARAI Approved',
    tagline: 'Single wire braided LPG hose',
    tube: 'Synthetic rubber, resistant to LPG',
    reinforcement: 'One high tensile steel wire braided',
    cover: OIL_COVER,
    temp: '-40°C to +70°C',
    fluid: 'LPG',
    code: (d) => `9573-${d}`,
    rows: `4|6|1/4"|13.2|25|363|125|1813|70`,
  }),

  /* — Automotive hoses — */
  hose({
    id: 'governor-hose',
    name: 'Governor Hose',
    category: 'automotive',
    standard: 'VEXTRA Governor Hose',
    tagline: 'Single wire braided governor hose',
    tube: 'Synthetic rubber, resistant to oil & petroleum based fuel',
    reinforcement: 'One high tensile steel wire braided',
    cover: OIL_COVER,
    temp: '-40°C to +55°C',
    fluid: 'Oil & petroleum based fuel',
    code: (d) => `GH-${d}`,
    dataNote: 'Burst pressure (414 bar / 6000 psi) is printed as-is from the catalogue and is out of proportion to the 7 bar working pressure — confirm with the client before publishing.',
    rows: `4|6|1/4"|12.8|7|100|414|6000|100`,
  }),
  hose({
    id: 'tractor-trolley-hose',
    name: 'Tractor Trolley Hose',
    category: 'automotive',
    standard: 'VEXTRA Tractor Trolley Hose',
    tagline: 'Two-braid hydraulic hose for tractor trolleys',
    tube: 'Synthetic rubber, resistant to hydraulic fluids',
    reinforcement: 'Two braid of high tensile steel wire',
    cover: OIL_COVER,
    temp: '-40°C to +70°C',
    fluid: 'Hydraulic fluids',
    code: (d) => `TT - ${d} (2w)`,
    rows: `
6|10|3/8"|18.5|207|3000|690|10000|130
8|12|1/2"|21.7|172|2500|552|8000|180`,
  }),
  hose({
    id: 'cng-hose',
    name: 'CNG Hose — SAE J30 R6',
    category: 'automotive',
    standard: 'SAE J30 R6',
    tagline: 'Yarn braided fuel hose',
    tube: 'Fuel resistant synthetic rubber',
    reinforcement: 'One yarn braided',
    cover: 'Oil & highly weather resistant synthetic rubber',
    temp: '-40°C to +70°C',
    fluid: 'Fuel',
    code: (d) => `CNG-${d}`,
    rows: `
4|6|1/4"|12.7|21|305|48|700|65
5|8|5/16"|14.3|21|305|48|700|75
6|10|3/8"|15.8|21|305|48|700|75
8|12|1/2"|19.8|21|305|48|700|100
10|16|5/8"|23.8|21|305|48|700|125
12|19|3/4"|28.6|21|305|48|700|150
16|25|1"|35.0|21|305|48|700|177`,
  }),
  hose({
    id: 'ac-suction-hose',
    name: 'Air Conditioning Suction Hose — SAE J2064 Type-B',
    category: 'automotive',
    standard: 'SAE J2064 Type-B',
    tagline: 'Low permeation, one wire braided A/C suction hose',
    tube: 'Low permeable synthetic rubber',
    reinforcement: 'One wire braided',
    cover: 'Weather & heat resistant synthetic rubber',
    temp: '-30°C to +125°C',
    fluid: 'Air-conditioning refrigerant (as per SAE J2064)',
    code: (d) => `AC Suction - ${d}`,
    rows: `
5|8|5/16"|17.0|34.5|500|138|2000|115
6.5|10|13/32"|19.5|34.5|500|138|2000|130
8|12|1/2"|22.5|34.5|500|138|2000|140
10|16|5/8"|25.5|34.5|500|138|2000|165
12|19|3/4"|28.7|34.5|500|138|2000|180
14|22|7/8"|31.4|34.5|500|138|2000|190
18|29|1 1/8"|38.5|34.5|500|138|2000|230`,
  }),
]

/* ───────────── company ───────────── */

export const COMPANY = {
  name: 'Vaishno Rubber Industries Pvt. Ltd.',
  brandName: 'VEXTRA',
  incorporated: '14 November 2014',
  founders: ['Mr. Satvir Singh', 'Dr. (Mrs.) Roopam Singh'],
  landArea: 'Approximately 5 acres',
  location:
    'NH-24 (Delhi-Haridwar Bypass Road), Village Kokerpur, P.O. Aghwanpur, Moradabad - 244001 (U.P.), India',
  phone: '+91 98102 94483',
  whatsapp: '',
  businessHours: '',
  mapUrl: '',
  socials: [] as { platform: string; url: string }[],
  emails: ['info@vaishnorubber.com', 'satvir21@gmail.com'],
  profile:
    'The company makes wire and textile braided hoses and hose assemblies (LPG, industrial and hydraulic hoses) conforming to DIN, EN, SAE, IS and BS specifications, alongside railway rubber and rubber-metal components. Long-length hoses are produced on flexible nylon mandrels for capacity and consistent quality.',
  capabilities: [
    'In-house compound mixing (intermix & kneader)',
    'Automated rubber injection moulding — Klöckner DESMA Elastomertechnik GmbH, Germany',
    'PU casting machine — Covestro Elastomers SAS, France',
    'Long-length hose production on flexible nylon mandrels',
    'Rheometer',
    'Heat release rate tester',
    'Toxicity tester',
    'Ozone test apparatus',
    'Universal testing machine',
    'Shear fatigue testing machines (single, two and four axis)',
    'Cold chamber (down to −50°C)',
  ],
  certifications: [
    {
      name: 'ISO 14001:2015',
      detail:
        'Environmental Management System — certified by QFS Management Systems LLP (SCC accredited). Certificate no. SCC/2609VU/3448, valid 30.09.2026 to 29.09.2029; scope covers railway brake hose couplings, UIC elastomer flange connections, elastomer-metal bonded items, elastomeric pads, PU CCSB, elastic rings and spheriblocs.',
      status: 'verified' as const,
      documentUrl: '/documents/iso-14001-certificate.pdf',
    },
    {
      name: 'ISO 9001:2015 · BSCIC',
      detail:
        'Quality Management System — certified by BSCIC Certifications Pvt. Ltd. (NABCB accredited, IAF member). Certificate no. BN23392/22379, issued 06.12.2024, valid to 05.12.2027; scope covers hydraulic, industrial and LPG hoses and hose assemblies, brake hose connections, air brake hose couplings, UIC elastomer flange connections, elastomer-metal bonded items for FIAT bogies and elastomeric pads.',
      status: 'verified' as const,
      documentUrl: '/documents/iso-9001-bscic-certificate.pdf',
    },
    {
      name: 'ISO 9001:2015 · QFS',
      detail:
        'Quality Management System — certified by QFS Management Systems LLP (SCC accredited). Certificate no. SCC/2403VU/2032, dated 11.02.2026, valid to 14.03.2027; scope covers railway brake hose couplings, UIC elastomer flange connections, elastomer-metal bonded items for FIAT bogies and elastomeric pads.',
      status: 'verified' as const,
      documentUrl: '/documents/iso-9001-qfs-certificate.pdf',
    },
    { name: 'IRIS', detail: 'Railway industry standard — stated by the company; certificate not yet supplied.', status: 'stated' as const, documentUrl: '' },
  ],
  customers: [
    { name: 'RDSO, Lucknow', group: 'Indian Railways' },
    { name: 'Integral Coach Factory (ICF), Chennai', group: 'Indian Railways' },
    { name: 'Modern Coach Factory (MCF), Raebareli', group: 'Indian Railways' },
    { name: 'Rail Coach Factory (RCF), Kapurthala', group: 'Indian Railways' },
    { name: 'All Indian Railways (Zonal Railways)', group: 'Indian Railways' },
    { name: 'Knorr-Bremse India Pvt. Ltd.', group: 'Railway OEMs' },
    { name: 'Faiveley Transport Rail Technologies India Pvt. Ltd. (Wabtec Corp., USA)', group: 'Railway OEMs' },
    { name: 'Sona BLW Precision Forgings Ltd.', group: 'Railway OEMs' },
    { name: 'Hindusthan Engineering and Industries Limited (HEIL)', group: 'Railway OEMs' },
    { name: 'Titagarh Rail Systems Limited', group: 'Railway OEMs' },
    { name: 'Texmaco Rail & Engineering Limited', group: 'Railway OEMs' },
    { name: 'Jupiter Wagons Limited', group: 'Railway OEMs' },
    { name: 'Oriental Foundry Private Limited', group: 'Railway OEMs' },
    { name: 'Siena Engineering Pvt. Ltd.', group: 'Railway OEMs' },
    { name: 'Loco Casting Pvt. Ltd.', group: 'Railway OEMs' },
    { name: 'RV Casting and Engineering Pvt. Ltd.', group: 'Railway OEMs' },
    { name: 'San Engineering & Locomotive Co. Limited', group: 'Railway OEMs' },
    { name: 'River Engineering Private Limited', group: 'Railway OEMs' },
    { name: 'DCM Shriram Industries Limited', group: 'Railway OEMs' },
  ],
  strengths: [
    { title: 'Specialised rubber products', detail: 'High-quality rubber products for demanding service.' },
    { title: 'Indian Railways expertise', detail: 'RDSO and Indian Railways product expertise.' },
    { title: 'Advanced testing & quality control', detail: 'In-house laboratory with rheometer, ozone, cold-chamber and fatigue testing.' },
    { title: 'Integrated production & assembly', detail: 'Compounding, moulding, hose production and assembly in one works.' },
    { title: 'Consistent supply', detail: 'Consistent production and on-time delivery.' },
  ],
}

/* ───────────── site settings (branding + SEO defaults) ───────────── */

export const SETTINGS = {
  logoUrl: '/assets/logo.png',
  logoLightUrl: '',
  tagline: '',
  keywords: [] as string[],
  faviconUrl: '/assets/logo.png',
  shareImageUrl: '/assets/hydraulic-hose.jpg',
  preloaderEnabled: true,
  preloaderLabel: 'Vaishno Rubber Industries',
  defaultTitle: 'Vaishno Rubber Industries | VEXTRA® High-Pressure Hydraulic & Industrial Hoses',
  titleTemplate: '%s | Vaishno Rubber Industries (VEXTRA®)',
  description:
    'Vaishno Rubber Industries Pvt. Ltd. (VEXTRA) — manufacturer of SAE 100 R1, R2, SH33 hydraulic hoses, industrial, rock drill, steam and automotive hoses conforming to DIN, EN, SAE, IS standards.',
  pageSeo: {
    products: {
      title: 'Hose Product Catalogue',
      description: 'Browse VEXTRA hydraulic, industrial and automotive hoses by family and working pressure, with full technical data sheets.',
    },
    company: {
      title: 'Company & Moradabad Plant',
      description: 'About Vaishno Rubber Industries: leadership, the 5-acre Moradabad manufacturing plant, machinery and quality systems.',
    },
    industries: {
      title: 'Industries Served',
      description: 'Hose solutions for earthmoving, mining, refineries, railways, automotive and agriculture.',
    },
    resources: {
      title: 'Technical Resources',
      description: 'Hose selection guidance, pressure conversion and the downloadable VEXTRA product catalogue.',
    },
    contact: {
      title: 'Contact Us',
      description: 'Contact Vaishno Rubber Industries — technical sales desk, factory address in Moradabad and enquiry form.',
    },
  },
}

/* ───────────── navigation (header, products menu, footer) ───────────── */

export const NAVIGATION = {
  productsLabel: 'Products',
  headerLinks: [
    { label: 'Company', href: '/company' },
    { label: 'Industries', href: '/industries' },
    { label: 'Resources', href: '/resources' },
    { label: 'Contact', href: '/contact' },
  ],
  megaColumns: [
    { title: 'Railway components', categories: ['railway'], maxItems: 8 },
    { title: 'Hydraulic hoses', categories: ['hydraulic'], maxItems: 6 },
    { title: 'Industrial & LPG hoses', categories: ['industrial', 'lpg'], maxItems: 6 },
    { title: 'Automotive hoses', categories: ['automotive'], maxItems: 6 },
  ] as { title: string; categories: ProductCategory[]; maxItems: number }[],
  catalogueCard: {
    badge: 'Catalogue',
    title: 'VEXTRA hose catalogue',
    text: 'Dimensions, pressure ratings and installation guidance for the hose range.',
    browseLabel: 'Browse all products →',
    downloadLabel: 'Download PDF',
  },
  catalogueUrl: '/documents/vextra-hose-catalogue.pdf',
  footerProductsHeading: 'Products',
  footerCompanyHeading: 'Company',
  footerContactHeading: 'Works',
  footerProductLinks: [
    { label: 'Railway components', href: '/products?category=railway' },
    { label: 'Hydraulic hoses', href: '/products?category=hydraulic' },
    { label: 'Industrial hoses', href: '/products?category=industrial' },
    { label: 'LPG hoses', href: '/products?category=lpg' },
    { label: 'Automotive hoses', href: '/products?category=automotive' },
  ],
  footerCompanyLinks: [
    { label: 'Company', href: '/company' },
    { label: 'Industries', href: '/industries' },
    { label: 'Technical resources', href: '/resources' },
    { label: 'Contact', href: '/contact' },
  ],
  footerCatalogueLabel: 'Hose catalogue (PDF)',
}
