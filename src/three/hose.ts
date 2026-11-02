import * as THREE from 'three'
import { patchBend, bendPoint, type BendShared, type Uniform1 } from './bend'
import { makeMarkingTexture, makeRubberNormal } from './textures'
import type { FittingStyle, HoseSpec, LayerSpec } from './spec'

/** Everything is modelled on a straight X axis; bend + peel happen in the vertex shader. */
export const HOSE_LENGTH = 7
export const R_OUT = 0.62
const BASE_BEND = 1 / 8.5
const PEEL_STEP = 0.55
const END = HOSE_LENGTH / 2

export interface Quality {
  ring: number // wire cross-section vertices
  spp: number // samples per weave period
  maxWires: number // per direction
  radial: number // cylinder segments
}
export const QUALITY: Record<'high' | 'low', Quality> = {
  high: { ring: 6, spp: 8, maxWires: 26, radial: 64 },
  low: { ring: 4, spp: 5, maxWires: 16, radial: 40 },
}

export interface LayerHandle {
  spec: LayerSpec
  rOuter: number
  rInner: number
  rMid: number
  /** how far (axis units) this layer retracts at peel = 1 */
  step: number
  uEnd: Uniform1
  materials: THREE.MeshStandardMaterial[]
}

export interface HoseModel {
  group: THREE.Group
  layers: LayerHandle[]
  setPeel(p: number): void
  setBend(k: number): void
  setHighlight(id: string | null): void
  pointAt(x: number, y?: number, z?: number, out?: THREE.Vector3): THREE.Vector3
  layerEndX(i: number): number
  dispose(): void
}

/* ───────────────────────── geometry helpers ───────────────────────── */

function cylinderX(x0: number, x1: number, r: number, segR: number, segX: number, inward = false) {
  const pos: number[] = [], nor: number[] = [], uv: number[] = [], idx: number[] = []
  const k = inward ? -1 : 1
  for (let i = 0; i <= segX; i++) {
    const u = i / segX
    const x = x0 + (x1 - x0) * u
    for (let j = 0; j <= segR; j++) {
      const v = j / segR
      const th = v * Math.PI * 2
      const c = Math.cos(th), s = Math.sin(th)
      pos.push(x, r * c, r * s)
      nor.push(0, k * c, k * s)
      uv.push(u, v)
    }
  }
  const row = segR + 1
  for (let i = 0; i < segX; i++)
    for (let j = 0; j < segR; j++) {
      const a = i * row + j, b = a + 1, c = a + row, d = c + 1
      if (inward) idx.push(a, c, b, b, c, d)
      else idx.push(a, b, c, b, d, c)
    }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3))
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
  g.setIndex(idx)
  return g
}

/** flat annulus at x = 0 facing +X (moved along the axis with the uSlide uniform) */
function annulusX(rIn: number, rOut: number, seg: number) {
  const pos: number[] = [], nor: number[] = [], idx: number[] = []
  for (let j = 0; j <= seg; j++) {
    const th = (j / seg) * Math.PI * 2
    const c = Math.cos(th), s = Math.sin(th)
    pos.push(0, rOut * c, rOut * s, 0, rIn * c, rIn * s)
    nor.push(1, 0, 0, 1, 0, 0)
  }
  for (let j = 0; j < seg; j++) {
    const o0 = j * 2, i0 = o0 + 1, o1 = o0 + 2, i1 = o0 + 3
    idx.push(o0, o1, i0, o1, i1, i0)
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3))
  g.setIndex(idx)
  return g
}

interface BraidOpts {
  r: number
  thick: number
  width: number
  q: Quality
}

/**
 * A real braid: 2n wires wound in opposite directions that pass over and under
 * each other. Radial offset = dir · a · cos(n·θ); at every crossing the two
 * wires share θ but have opposite dir, so one is always over, one under.
 */
function braidGeometry({ r, thick, width, q }: BraidOpts) {
  const n = Math.min(q.maxWires, Math.max(10, Math.round((2 * Math.PI * r) / (width * 2.3))))
  const omega = 1 / (0.7 * r) // ≈ 55° lay angle
  const a = thick * 0.6
  const step = (2 * Math.PI) / (n * omega) / q.spp
  const count = Math.ceil(HOSE_LENGTH / step)
  const ring = q.ring
  const vertsPerWire = (count + 1) * ring
  const wires = n * 2
  const pos = new Float32Array(wires * vertsPerWire * 3)
  const nor = new Float32Array(pos.length)
  const idx = new Uint32Array(wires * count * ring * 6)
  const h = thick / 2, w = width / 2
  let vi = 0, ii = 0, base = 0

  for (const dir of [1, -1]) {
    for (let k = 0; k < n; k++) {
      const phi = (2 * Math.PI * k) / n
      for (let i = 0; i <= count; i++) {
        const x = -END + (HOSE_LENGTH * i) / count
        const th = phi + dir * omega * (x + END)
        const cT = Math.cos(th), sT = Math.sin(th)
        const rr = r + dir * a * Math.cos(n * th)
        const drr = -a * n * omega * Math.sin(n * th)
        const dth = dir * omega
        // tangent
        let ty = drr * cT - rr * sT * dth, tz = drr * sT + rr * cT * dth
        const tl = Math.hypot(1, ty, tz)
        const tx = 1 / tl
        ty /= tl; tz /= tl
        // side = t × u, with u = (0, cosθ, sinθ)
        let sx = ty * sT - tz * cT, sy = -tx * sT, sz = tx * cT
        const sl = Math.hypot(sx, sy, sz)
        sx /= sl; sy /= sl; sz /= sl
        const cx = x, cy = rr * cT, cz = rr * sT
        for (let j = 0; j < ring; j++) {
          const psi = (j / ring) * Math.PI * 2
          const cp = Math.cos(psi), sp = Math.sin(psi)
          pos[vi] = cx + sx * (w * sp)
          pos[vi + 1] = cy + cT * (h * cp) + sy * (w * sp)
          pos[vi + 2] = cz + sT * (h * cp) + sz * (w * sp)
          // ellipse normal = u·(cosψ/h) + s·(sinψ/w)
          const nxu = (cp / h), nxs = (sp / w)
          const nx = sx * nxs, ny = cT * nxu + sy * nxs, nz = sT * nxu + sz * nxs
          const nl = Math.hypot(nx, ny, nz) || 1
          nor[vi] = nx / nl; nor[vi + 1] = ny / nl; nor[vi + 2] = nz / nl
          vi += 3
        }
      }
      for (let i = 0; i < count; i++)
        for (let j = 0; j < ring; j++) {
          const A = base + i * ring + j, B = base + i * ring + ((j + 1) % ring)
          const C = A + ring, D = B + ring
          idx[ii++] = A; idx[ii++] = B; idx[ii++] = C
          idx[ii++] = B; idx[ii++] = D; idx[ii++] = C
        }
      base += vertsPerWire
    }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  g.setAttribute('normal', new THREE.BufferAttribute(nor, 3))
  g.setIndex(new THREE.BufferAttribute(idx, 1))
  return g
}

/* ───────────────────────── end fitting ───────────────────────── */

interface FittingPart {
  geo: THREE.BufferGeometry
  color: number
  rough: number
  metal: number
}

const ZINC = 0xcfd4d9
const ZINC_DARK = 0xb4bbc2

/** hex nut along X: machined bevels and a clearance bore */
function hexNutX(Rh: number, depth: number, bore: number, x0: number) {
  const shape = new THREE.Shape()
  for (let i = 0; i < 6; i++) {
    const t = (i / 6) * Math.PI * 2 + Math.PI / 6
    i === 0 ? shape.moveTo(Rh * Math.cos(t), Rh * Math.sin(t)) : shape.lineTo(Rh * Math.cos(t), Rh * Math.sin(t))
  }
  shape.closePath()
  const hole = new THREE.Path()
  hole.absarc(0, 0, bore, 0, Math.PI * 2, true)
  shape.holes.push(hole)
  const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 2, curveSegments: 24 })
  g.rotateY(Math.PI / 2)
  g.translate(x0, 0, 0)
  return g
}

/** hose end at x = 0, the fitting reaches out along +X (mirrored for the other end) */
function buildFitting(style: FittingStyle, rIn: number): FittingPart[] {
  const rO = R_OUT
  const rf = rO + 0.1
  const rs = Math.max(rIn - 0.012, 0.16) // stem OD — fits inside the bore
  const rb = Math.max(rs - 0.06, 0.09) // stem bore
  const rc = Math.max(rIn + 0.16, 0.5) // collar
  const rn = rc - 0.05 // thread body
  const parts: FittingPart[] = []

  if (style === 'swivel') {
    // long, plain zinc crimp sleeve with a faint hex-crimp bulge
    const sleeve = crimpSleeve(rO - 0.01, rf, -1.15, 0.2)
    parts.push({ geo: sleeve, color: ZINC, rough: 0.28, metal: 1 })
    const stem = latheX([[rs, -0.95], [rs, 0.0], [rc, 0.04], [rc, 0.26], [rn, 0.3], [rn, 1.2], [rn - 0.05, 1.24], [rb, 1.24], [rb, -0.95], [rs, -0.95]])
    parts.push({ geo: stem, color: ZINC, rough: 0.3, metal: 1 })
    parts.push({ geo: hexNutX(0.8, 0.4, rn + 0.012, 0.34), color: ZINC_DARK, rough: 0.4, metal: 1 })
    parts.push({ geo: hexNutX(0.8, 0.4, rn + 0.012, 0.8), color: ZINC_DARK, rough: 0.4, metal: 1 })
    // blue dust cap pressed over the threaded stub
    const cap = latheX([[0, 1.18], [rn + 0.07, 1.18], [rn + 0.07, 1.62], [rn + 0.03, 1.7], [0, 1.7]])
    parts.push({ geo: cap, color: 0x2d6bd1, rough: 0.55, metal: 0 })
  } else if (style === 'flange') {
    parts.push({ geo: crimpSleeve(rO - 0.01, rf, -1.15, 0.2), color: ZINC, rough: 0.28, metal: 1 })
    parts.push({ geo: latheX([[rs, -0.95], [rs, 0.0], [rc, 0.04], [rc, 0.5], [rb, 0.5], [rb, -0.95], [rs, -0.95]]), color: ZINC, rough: 0.3, metal: 1 })
    // two-bolt flange plate (long axis across the hose), with its bolt holes
    const L = rc + 0.32, R = 0.36
    const plate = new THREE.Shape()
    plate.moveTo(-L, R)
    plate.lineTo(L, R)
    plate.absarc(L, 0, R, Math.PI / 2, -Math.PI / 2, true)
    plate.lineTo(-L, -R)
    plate.absarc(-L, 0, R, -Math.PI / 2, Math.PI / 2, true)
    for (const sx of [-L, L]) {
      const h = new THREE.Path()
      h.absarc(sx, 0, 0.13, 0, Math.PI * 2, true)
      plate.holes.push(h)
    }
    const fl = new THREE.ExtrudeGeometry(plate, { depth: 0.2, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2, curveSegments: 24 })
    fl.rotateY(Math.PI / 2)
    fl.translate(0.36, 0, 0)
    parts.push({ geo: fl, color: ZINC_DARK, rough: 0.4, metal: 1 })
    // raised spigot with the port bore
    parts.push({ geo: latheX([[rb + 0.02, 0.5], [rc * 0.82, 0.5], [rc * 0.82, 0.8], [rb + 0.02, 0.8], [rb + 0.02, 0.5]]), color: ZINC, rough: 0.3, metal: 1 })
  } else if (style === 'claw') {
    // cast elbow claw coupling, painted white, with two lugs; band clamp on the hose tail
    const tail = latheX([[rs, -0.8], [rs + 0.03, -0.55], [rs, -0.3], [rs + 0.05, 0.0], [rc + 0.06, 0.06], [rc + 0.06, 0.5], [rb, 0.5], [rb, -0.8], [rs, -0.8]])
    parts.push({ geo: tail, color: 0xe4e6e8, rough: 0.85, metal: 0.05 })
    const head = new THREE.CylinderGeometry(rc + 0.14, rc + 0.14, 0.95, 36)
    head.translate(0.5, 0.3, 0)
    parts.push({ geo: head, color: 0xe4e6e8, rough: 0.85, metal: 0.05 })
    const dome = new THREE.SphereGeometry(rc + 0.14, 36, 16, 0, Math.PI * 2, 0, Math.PI / 2)
    dome.translate(0.5, 0.775, 0)
    parts.push({ geo: dome, color: 0xe4e6e8, rough: 0.85, metal: 0.05 })
    for (const sz of [-1, 1]) {
      const lug = new THREE.BoxGeometry(0.34, 0.26, 0.14)
      lug.translate(0.5, 0.55, sz * (rc + 0.22))
      parts.push({ geo: lug, color: 0xe4e6e8, rough: 0.85, metal: 0.05 })
    }
    const band = latheX([[rO - 0.01, -0.62], [rO + 0.06, -0.62], [rO + 0.06, -0.3], [rO - 0.01, -0.3], [rO - 0.01, -0.62]])
    parts.push({ geo: band, color: 0xc6ccd2, rough: 0.35, metal: 1 })
    const screw = new THREE.BoxGeometry(0.18, 0.1, 0.12)
    screw.translate(-0.46, rO + 0.1, 0)
    parts.push({ geo: screw, color: 0x9aa1aa, rough: 0.4, metal: 1 })
  } else if (style === 'clamp') {
    // painted cast nipple, held in the hose by a worm-drive band clamp
    const nipple = latheX([[rs, -0.8], [rs + 0.03, -0.55], [rs, -0.3], [rs + 0.05, 0.0], [rc + 0.08, 0.06], [rc + 0.08, 0.6], [rn, 0.66], [rn, 1.05], [rb, 1.05], [rb, -0.8], [rs, -0.8]])
    parts.push({ geo: nipple, color: 0xe4e6e8, rough: 0.8, metal: 0.05 })
    const band = latheX([[rO - 0.01, -0.62], [rO + 0.06, -0.62], [rO + 0.06, -0.3], [rO - 0.01, -0.3], [rO - 0.01, -0.62]])
    parts.push({ geo: band, color: 0xc6ccd2, rough: 0.35, metal: 1 })
    const screw = new THREE.BoxGeometry(0.18, 0.1, 0.12)
    screw.translate(-0.46, rO + 0.1, 0)
    parts.push({ geo: screw, color: 0x9aa1aa, rough: 0.4, metal: 1 })
    const cap = latheX([[0, 0.98], [rn + 0.06, 0.98], [rn + 0.06, 1.5], [rn + 0.02, 1.58], [0, 1.58]])
    parts.push({ geo: cap, color: 0xd2362d, rough: 0.5, metal: 0 })
  } else {
    // short plain sleeve with big red-painted swivel nuts
    parts.push({ geo: crimpSleeve(rO - 0.01, rf - 0.02, -0.9, 0.1), color: ZINC, rough: 0.3, metal: 1 })
    const stem = latheX([[rs, -0.7], [rs, 0.0], [rc, 0.04], [rc, 0.2], [rn, 0.24], [rn, 0.8], [rb, 0.8], [rb, -0.7], [rs, -0.7]])
    parts.push({ geo: stem, color: ZINC, rough: 0.3, metal: 1 })
    parts.push({ geo: hexNutX(0.82, 0.55, rn + 0.012, 0.06), color: 0xd0261e, rough: 0.5, metal: 0.2 })
    parts.push({ geo: hexNutX(0.82, 0.4, rn + 0.012, 0.66), color: 0xd0261e, rough: 0.5, metal: 0.2 })
  }
  return parts
}

/** plain crimped sleeve with softly rounded ends */
function crimpSleeve(rInner: number, rOuter: number, x0: number, x1: number) {
  const e = 0.07
  return latheX([[rInner, x0], [rOuter - e, x0], [rOuter, x0 + e], [rOuter, x1 - 0.1], [rOuter - 0.05, x1], [rInner, x1], [rInner, x0]])
}

/** profile = [radius, axisPos][]; revolved around the X axis */
function latheX(profile: [number, number][], segs = 56) {
  const g = new THREE.LatheGeometry(profile.map(([r, a]) => new THREE.Vector2(r, a)), segs)
  g.rotateZ(-Math.PI / 2)
  return g
}

/** a single spiral seam line wound around the cover — the wrapped-cloth look of the large-bore hoses */
function helixSeam(r: number, pitch: number, width: number) {
  const steps = Math.ceil((HOSE_LENGTH / pitch) * 36)
  const pos: number[] = [], nor: number[] = [], idx: number[] = []
  for (let i = 0; i <= steps; i++) {
    const x = -END + (HOSE_LENGTH * i) / steps
    const th = (2 * Math.PI * (x + END)) / pitch
    const c = Math.cos(th), s = Math.sin(th)
    const rr = r + 0.007
    pos.push(x - width / 2, rr * c, rr * s, x + width / 2, rr * c, rr * s)
    nor.push(0, c, s, 0, c, s)
  }
  for (let i = 0; i < steps; i++) {
    const a = i * 2
    idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3)
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3))
  g.setIndex(idx)
  return g
}

/* ───────────────────────── model ───────────────────────── */

export function buildHose(spec: HoseSpec, q: Quality, aniso: number): HoseModel {
  const group = new THREE.Group()
  const root = new THREE.Group() // carries the vertical centring offset for the current bend
  group.add(root)

  const shared: BendShared = { uBend: { value: BASE_BEND } }
  const disposables: { dispose(): void }[] = []
  const track = <T extends { dispose(): void }>(o: T) => (disposables.push(o), o)
  const add = (geo: THREE.BufferGeometry, mat: THREE.Material) => {
    const m = new THREE.Mesh(track(geo), mat)
    m.frustumCulled = false // vertices are moved in the shader
    root.add(m)
    return m
  }

  const rubberNormal = track(makeRubberNormal())
  const marking = track(makeMarkingTexture(spec.marking, aniso))

  // radii from outer to inner, proportional to layer weights
  const rOut = R_OUT
  const rIn = rOut * (spec.idMm / spec.odMm)
  const wall = rOut - rIn
  const totalW = spec.layers.reduce((s, l) => s + l.weight, 0)
  const m = spec.layers.length

  const std = (c: number, rough: number, metal = 0) => {
    const mat = track(new THREE.MeshStandardMaterial({ color: c, roughness: rough, metalness: metal }))
    return mat
  }
  const steelMat = () => std(0xc9a560, 0.34, 0.92) // brass-coated steel wire, as in the catalogue cut-aways
  const textileMat = () => std(0xd9d6cc, 0.95, 0)
  const capMat = () => std(0x2d3037, 0.9, 0)

  const handles: LayerHandle[] = []
  const capsByLayer: Record<number, Uniform1> = {}
  let r = rOut
  spec.layers.forEach((layer, i) => {
    const t = (layer.weight / totalW) * wall
    const rOuter = r, rInner = r - t
    r = rInner
    const rMid = (rOuter + rInner) / 2
    const uEnd: Uniform1 = { value: 1e5 }
    const mats: THREE.MeshStandardMaterial[] = []
    const reg = (mat: THREE.MeshStandardMaterial, own: { uEnd?: Uniform1; uSlide?: Uniform1 } = {}) => {
      patchBend(mat, shared, own)
      mats.push(mat)
      return mat
    }
    const segX = Math.round(HOSE_LENGTH * 10)

    if (layer.kind === 'steel-braid' || layer.kind === 'textile-braid' || (layer.kind === 'cover' && spec.cottonCover)) {
      const textile = layer.kind !== 'steel-braid'
      const mat = reg(textile ? textileMat() : steelMat(), { uEnd })
      if (layer.kind === 'cover') mat.color.setHex(0x1c1d20)
      const width = textile ? 0.075 : 0.05
      const thick = Math.min(textile ? 0.06 : 0.04, t * 0.45)
      add(braidGeometry({ r: rMid, thick, width, q }), mat)
    } else {
      const isCover = layer.kind === 'cover'
      const isTube = layer.kind === 'tube'
      const mat = reg(
        track(
          new THREE.MeshStandardMaterial({
            color: isCover ? spec.coverColor : isTube ? 0x101215 : 0x23272e,
            roughness: isCover ? 0.8 : isTube ? 0.5 : 0.82,
            metalness: 0,
            map: isCover ? marking : null,
            normalMap: rubberNormal,
            normalScale: new THREE.Vector2(isTube ? 0.15 : 0.55, isTube ? 0.15 : 0.55),
            side: isTube ? THREE.DoubleSide : THREE.FrontSide,
          }),
        ),
        { uEnd },
      )
      if (isCover) {
        // cover colour must show through the printed texture
        mat.color.setHex(0xffffff)
      }
      add(cylinderX(-END, END, rOuter, q.radial, segX), mat)
      if (isCover && spec.wrapped) {
        const seam = reg(std(0x34373c, 0.9), { uEnd })
        seam.side = THREE.DoubleSide
        add(helixSeam(rOuter, 0.62, 0.05), seam)
      }
      const inner = reg(std(isTube ? 0x0b0c0e : 0x1a1d22, 0.7), { uEnd })
      inner.side = THREE.BackSide
      add(cylinderX(-END, END, rInner, q.radial, segX, true), inner)
    }

    // cut face that travels with the layer end
    if (layer.kind === 'cover' || layer.kind === 'cushion' || layer.kind === 'tube') {
      const capSlide: Uniform1 = { value: END }
      const cap = reg(capMat(), { uSlide: capSlide })
      add(annulusX(rInner, rOuter, q.radial), cap)
      capsByLayer[i] = capSlide
    }

    handles.push({ spec: layer, rOuter, rInner, rMid, step: PEEL_STEP * (m - i), uEnd, materials: mats })
  })

  // end fittings
  const fittingSlide: Uniform1 = { value: 0 }
  const fixedSlide: Uniform1 = { value: 0 }
  const fittingMats: THREE.MeshStandardMaterial[] = []
  ;([1, -1] as const).forEach((side) => {
    const parts = buildFitting(spec.fittings[side === 1 ? 0 : 1], rIn)
    parts.forEach(({ geo, color, rough, metal }) => {
      if (side === -1) geo.rotateY(Math.PI)
      geo.translate(side * END, 0, 0)
      const mat = std(color, rough, metal)
      patchBend(mat, shared, { uSlide: side === 1 ? fittingSlide : fixedSlide })
      fittingMats.push(mat)
      add(geo, mat)
    })
  })

  const slideMax = PEEL_STEP * m + 1.1

  const ends = (): number => (Math.cos(((END + 1.4) * shared.uBend.value)) - 1) / (shared.uBend.value || 1e-6)

  const model: HoseModel = {
    group,
    layers: handles,
    setPeel(p) {
      handles.forEach((h, i) => {
        h.uEnd.value = END - p * h.step
        if (capsByLayer[i]) capsByLayer[i].value = h.uEnd.value
      })
      fittingSlide.value = p * slideMax
    },
    setBend(k) {
      shared.uBend.value = BASE_BEND * k
      root.position.y = Math.abs(k) > 1e-3 ? -ends() / 2 : 0
    },
    setHighlight(id) {
      const on = (mats: THREE.MeshStandardMaterial[], v: boolean) =>
        mats.forEach((mt) => {
          mt.emissive.setHex(0x0c6db4)
          mt.emissiveIntensity = v ? 0.55 : 0
        })
      handles.forEach((h) => on(h.materials, h.spec.id === id))
      on(fittingMats, id === 'fitting')
    },
    pointAt(x, y = 0, z = 0, out = new THREE.Vector3()) {
      bendPoint(x, y, z, shared.uBend.value, out)
      out.y += root.position.y
      return out
    },
    layerEndX: (i) => handles[i].uEnd.value,
    dispose() {
      disposables.forEach((d) => d.dispose())
      fittingMats.forEach((mt) => mt.dispose())
    },
  }
  model.setBend(1)
  return model
}

