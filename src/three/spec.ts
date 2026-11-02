import type { Product } from '@/types'

/**
 * HoseSpec — what the 3D builder needs, derived from a catalogue product.
 *
 * Reinforcement TYPE and COUNT are read from the product's own
 * `construction.reinforcement` text (taken from the VEXTRA catalogue), so a
 * single-braid R1 is not drawn like a three-braid SH33 or a textile R3.
 * Wire counts, lay angles and individual layer thicknesses are NOT in the
 * catalogue — they are illustrative, and the UI labels them as such.
 */
export type LayerKind = 'cover' | 'steel-braid' | 'textile-braid' | 'cushion' | 'tube'

export interface LayerSpec {
  id: string
  kind: LayerKind
  label: string
  detail: string
  /** relative wall thickness (normalised by the builder) */
  weight: number
}

export interface HoseSpec {
  slug: string
  name: string
  idMm: number
  odMm: number
  /** outer → inner */
  layers: LayerSpec[]
  /** text printed on the cover */
  marking: string
  coverColor: number
  /** cotton-braid cover (SAE 100 R5) instead of moulded rubber */
  cottonCover: boolean
  /** wrapped-cloth cover with a visible spiral seam, as on the large-bore industrial hoses */
  wrapped: boolean
  /** end fittings (right end, left end), modelled on the client's product photos */
  fittings: [FittingStyle, FittingStyle]
  reinforcementSummary: string
}

/**
 * swivel — long zinc crimp sleeve, two hex nuts and a blue dust cap (hydraulic assemblies)
 * flange — 2-bolt flange head on a crimp sleeve (hydraulic assemblies, e.g. R1)
 * claw   — cast elbow claw coupling (Chicago type) held by a band clamp (industrial / air hoses)
 * clamp  — cast threaded nipple held by a band clamp, red cap (industrial / air hoses)
 * redNut — short sleeve with red-painted hex nuts (LPG and automotive assemblies)
 */
export type FittingStyle = 'swivel' | 'flange' | 'claw' | 'clamp' | 'redNut'

const fittingsFor = (p: Product): [FittingStyle, FittingStyle] => {
  if (p.category === 'industrial') return ['claw', 'clamp']
  if (p.category === 'lpg' || p.category === 'automotive') return ['redNut', 'redNut']
  return p.id === 'sae-100-r1' ? ['flange', 'swivel'] : ['swivel', 'swivel']
}

type ReinfKind = 'steel-braid' | 'textile-braid'

const COUNT_WORDS: [RegExp, number][] = [
  [/\b(four|4)\b/, 4],
  [/\b(three|3)\b/, 3],
  [/\b(two|double|2)\b/, 2],
]

/** Reads the catalogue's reinforcement sentence → ordered list (outer → inner). */
export function parseReinforcement(text: string): ReinfKind[] {
  const t = text.toLowerCase()
  const hasSteel = /steel|wire/.test(t)
  const hasTextile = /textile|yarn/.test(t)
  if (hasSteel && hasTextile) return ['steel-braid', 'textile-braid'] // e.g. SAE 100 R5 / R5R
  const kind: ReinfKind = hasTextile ? 'textile-braid' : 'steel-braid'
  const count = COUNT_WORDS.find(([re]) => re.test(t))?.[1] ?? 1
  return Array.from({ length: count }, () => kind)
}

const LABEL: Record<ReinfKind, string> = { 'steel-braid': 'steel wire braid', 'textile-braid': 'textile braid' }
const ORDINAL = ['Outer', 'Middle', 'Inner']

export function specFromProduct(p: Product): HoseSpec {
  const c = p.construction
  const rows = p.specs
  // a mid-range size reads best on screen; fall back gracefully if the catalogue has none
  const row = rows[Math.min(3, rows.length - 1)]
  const reinf = parseReinforcement(c?.reinforcement ?? '')
  const cotton = /cotton/i.test(c?.cover ?? '')

  const layers: LayerSpec[] = [
    { id: 'cover', kind: 'cover', label: cotton ? 'Cotton braid cover' : 'Outer cover', detail: c?.cover ?? '', weight: 2.4 },
  ]
  reinf.forEach((kind, i) => {
    if (i > 0 && kind === reinf[i - 1]) {
      layers.push({ id: `cushion-${i}`, kind: 'cushion', label: 'Friction layer', detail: 'Rubber layer between reinforcement decks', weight: 0.8 })
    }
    const prefix = reinf.length === 1 ? '' : `${ORDINAL[Math.min(i, reinf.length === 2 ? 0 : 2) === 0 ? 0 : i === reinf.length - 1 ? 2 : 1]} `
    layers.push({
      id: `reinf-${i}`,
      kind,
      label: `${prefix}${LABEL[kind]}`.replace(/^./, (ch) => ch.toUpperCase()),
      detail: c?.reinforcement ?? '',
      weight: 1.5,
    })
  })
  layers.push({ id: 'tube', kind: 'tube', label: 'Inner tube', detail: c?.tube ?? '', weight: 3 })

  const fittings = fittingsFor(p)
  const industrial = p.category === 'industrial'
  const std = p.standard.split('/')[0].trim()
  return {
    slug: p.id,
    name: p.name,
    idMm: row?.idMm ?? 12.7,
    odMm: row?.odMm ?? 22,
    layers,
    // industrial hoses carry the maker's name along the cover, as in the photos
    marking:
      industrial
        ? `VEXTRA   VAISHNO RUBBER INDUSTRIES PVT. LTD.   ${std}`
        : `VEXTRA   ${std}   ${p.maxPressureBar ?? ''} BAR`.replace(/\s+BAR$/, p.maxPressureBar ? ' BAR' : ''),
    coverColor: p.coverColor ?? 0x15171a,
    cottonCover: cotton,
    wrapped: industrial && !cotton,
    fittings,
    reinforcementSummary: c?.reinforcement ?? '',
  }
}
