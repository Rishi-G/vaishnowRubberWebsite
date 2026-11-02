import * as THREE from 'three'
import { patchBend, bendPoint, type BendShared, type Uniform1 } from './bend'
import { makeMarkingTexture, makeRubberNormal } from './textures'
import type { HoseSpec, LayerSpec } from './spec'

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

/** profile = [radius, axisPos][]; revolved around the X axis */
function latheX(profile: [number, number][], segs = 56) {
  const g = new THREE.LatheGeometry(profile.map(([r, a]) => new THREE.Vector2(r, a)), segs)
  g.rotateZ(-Math.PI / 2)
  return g
}

/* ───────────────────────── end fitting ───────────────────────── */

function buildFitting(rIn: number) {
  const rO = R_OUT
  const rf = rO + 0.1
  const rs = Math.max(rIn - 0.012, 0.16) // stem OD — fits inside the bore
  const rb = Math.max(rs - 0.06, 0.09) // stem bore
  const rc = Math.max(rIn + 0.16, 0.5) // collar
  const rn = rc - 0.05 // thread body

  const ferrule = latheX([
    [rO - 0.01, -0.72], [rf - 0.06, -0.72], [rf, -0.66], [rf, -0.5], [rf - 0.035, -0.46], [rf, -0.42],
    [rf, -0.2], [rf - 0.035, -0.16], [rf, -0.12], [rf, 0.06], [rf - 0.08, 0.17], [rO - 0.01, 0.17], [rO - 0.01, -0.72],
  ])

  const stemOuter: [number, number][] = [
    [rs, -0.95], [rs + 0.03, -0.85], [rs, -0.78], [rs + 0.03, -0.62], [rs, -0.55], [rs + 0.03, -0.38], [rs, -0.3],
    [rs, 0.0], [rc, 0.04], [rc, 0.26], [rn, 0.3],
  ]
  for (let a = 0.84; a < 1.3; a += 0.09) stemOuter.push([rn, a], [rn + 0.028, a + 0.03], [rn + 0.028, a + 0.06], [rn, a + 0.09])
  stemOuter.push([rn, 1.36], [rn - 0.05, 1.4], [rb, 1.4], [rb, -0.95], [rs, -0.95])
  const stem = latheX(stemOuter)

  // hex nut with machined chamfers and a clearance bore
  const Rh = 0.8
  const shape = new THREE.Shape()
  for (let i = 0; i < 6; i++) {
    const t = (i / 6) * Math.PI * 2 + Math.PI / 6
    i === 0 ? shape.moveTo(Rh * Math.cos(t), Rh * Math.sin(t)) : shape.lineTo(Rh * Math.cos(t), Rh * Math.sin(t))
  }
  shape.closePath()
  const hole = new THREE.Path()
  hole.absarc(0, 0, rn + 0.012, 0, Math.PI * 2, true)
  shape.holes.push(hole)
  const nut = new THREE.ExtrudeGeometry(shape, { depth: 0.46, bevelEnabled: true, bevelThickness: 0.035, bevelSize: 0.035, bevelSegments: 2, curveSegments: 24 })
  nut.rotateY(Math.PI / 2)
  nut.translate(0.34, 0, 0)

  return [ferrule, stem, nut]
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
    const geos = buildFitting(rIn)
    geos.forEach((geo, gi) => {
      if (side === -1) geo.rotateY(Math.PI)
      geo.translate(side * END, 0, 0)
      const mat = std(gi === 2 ? 0xbcc2c8 : 0xcfd4d9, gi === 2 ? 0.4 : 0.3, 1)
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

