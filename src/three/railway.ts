import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { makeRubberNormal } from './textures'

/**
 * Illustrative models of VEXTRA railway components, each with an "action" that
 * shows what the part does (a pad compressing, a coupling connecting…).
 *
 * IMPORTANT: no drawings were supplied. Proportions are indicative only — the UI
 * labels every model "illustrative, not to scale; drawings on request".
 * `setAction(p)` takes p in [0, 1]: 0 = at rest, 1 = fully actuated.
 */
export interface DemoModel {
  group: THREE.Group
  setAction(p: number): void
  action: { title: string; caption: string }
  /** camera distance for a comfortable framing */
  distance: number
  dispose(): void
}

const smooth = (p: number, a: number, b: number) => {
  const t = Math.min(1, Math.max(0, (p - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

function kit() {
  const disposables: { dispose(): void }[] = []
  const track = <T extends { dispose(): void }>(o: T) => (disposables.push(o), o)
  const group = new THREE.Group()
  const mat = (color: number, rough: number, metal = 0) => track(new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal }))
  // moulded rubber is never flat: a fine surface grain catches the light
  const grain = track(makeRubberNormal(256))
  grain.wrapS = grain.wrapT = THREE.RepeatWrapping
  grain.repeat.set(3, 3)
  const M = {
    rubber: track(new THREE.MeshStandardMaterial({ color: 0x191b1f, roughness: 0.88, normalMap: grain, normalScale: new THREE.Vector2(0.65, 0.65) })),
    steel: mat(0x8c939c, 0.36, 1),
    plated: mat(0xd2d7dc, 0.26, 1),
    dark: mat(0x3f444b, 0.45, 0.9),
    pu: mat(0xdc7a1f, 0.5),
    cut: mat(0x2e3138, 0.9),
    green: mat(0x2f7a3c, 0.55, 0.2), // painted steel plates, as on the pads in the photos
    white: mat(0xeceef0, 0.5),
  }
  const mesh = (geo: THREE.BufferGeometry, material: THREE.Material, parent: THREE.Object3D = group) => {
    const m = new THREE.Mesh(track(geo), material)
    parent.add(m)
    return m
  }
  const box = (w: number, h: number, d: number, r = 0.03) => new RoundedBoxGeometry(w, h, d, 3, r)
  const finish = (): Pick<DemoModel, 'group' | 'dispose'> => ({ group, dispose: () => disposables.forEach((d) => d.dispose()) })
  return { group, M, mesh, box, track, finish }
}

/** translate + scale + x-shear (skews a rubber layer as it shears) */
function setM(m: THREE.Mesh, o: { tx?: number; ty?: number; tz?: number; sx?: number; sy?: number; sz?: number; shear?: number }) {
  m.matrixAutoUpdate = false
  m.matrix.set(o.sx ?? 1, o.shear ?? 0, 0, o.tx ?? 0, 0, o.sy ?? 1, 0, o.ty ?? 0, 0, 0, o.sz ?? 1, o.tz ?? 0, 0, 0, 0, 1)
}

/* 1 ─ Elastomeric pad: laminated rubber + steel, compresses then shears */
function elastomericPad(): DemoModel {
  const k = kit()
  const N = 4, steelT = 0.07, rubH = 0.3
  const steels = Array.from({ length: N + 1 }, (_, i) => k.mesh(k.box(2.5, i === 0 || i === N ? steelT * 2 : steelT, 1.8, 0.02), k.M.steel))
  const rubbers = Array.from({ length: N }, () => k.mesh(k.box(2.4, rubH, 1.7, 0.08), k.M.rubber))
  const total = (N + 1) * steelT + 2 * steelT + N * rubH
  return {
    ...k.finish(),
    distance: 7.5,
    action: { title: 'Compression, then shear', caption: 'Rubber layers bulge under load; bonded steel shims keep the pad stable, then it shears with bogie movement.' },
    setAction(p) {
      const c = smooth(p, 0, 0.5), s = smooth(p, 0.5, 1)
      const h = rubH * (1 - 0.22 * c), bulge = 1 + 0.07 * c
      let y = -total / 2
      for (let i = 0; i <= N; i++) {
        const t = i === 0 || i === N ? steelT * 2 : steelT
        const shearOff = s * 0.5 * (y + total / 2)
        steels[i].position.set(shearOff, y + t / 2, 0)
        y += t
        if (i < N) {
          const mid = y + h / 2
          setM(rubbers[i], { tx: s * 0.5 * (mid + total / 2), ty: mid, sx: bulge, sz: bulge, sy: h / rubH, shear: s * 0.5 })
          y += h
        }
      }
    },
  }
}

/** one spiral seam wound round a wrapped-cloth hose, along X from -len/2 to len/2 */
function spiralSeam(r: number, len: number, pitch: number, width: number) {
  const steps = Math.ceil((len / pitch) * 36)
  const pos: number[] = [], nor: number[] = [], idx: number[] = []
  for (let i = 0; i <= steps; i++) {
    const x = -len / 2 + (len * i) / steps
    const th = (2 * Math.PI * (x + len / 2)) / pitch
    const c = Math.cos(th), s = Math.sin(th)
    const rr = r + 0.006
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

/* 2 ─ Air brake hose coupling (BP white, FP green): two claw-coupled hose halves connect, lever latches.
   Shapes follow the client's photos: wrapped-cloth hose, band clamp, painted cast coupling body, red dust cap. */
function airBrakeCoupling(): DemoModel {
  const k = kit()
  const paint = (color: number) => k.track(new THREE.MeshStandardMaterial({ color, roughness: 0.72, metalness: 0.08 }))
  const hoseMat = k.track(new THREE.MeshStandardMaterial({ color: 0x17191c, roughness: 0.85 }))
  const seamMat = k.track(new THREE.MeshStandardMaterial({ color: 0x3a3d42, roughness: 0.9, side: THREE.DoubleSide }))
  const capMat = k.track(new THREE.MeshStandardMaterial({ color: 0xd2362d, roughness: 0.5 }))
  const bodyColor = { '-1': 0xe9ebed, '1': 0x2f8a46 } // BP white, FP green

  const halves = ([-1, 1] as const).map((side) => {
    const g = new THREE.Group()
    k.group.add(g)
    const body = paint(bodyColor[String(side) as '-1' | '1'])
    // wrapped hose, with its spiral seam
    const hose = k.mesh(new THREE.CylinderGeometry(0.3, 0.3, 2.2, 48).rotateZ(Math.PI / 2), hoseMat, g)
    hose.position.x = side * 2.0
    const seam = k.mesh(spiralSeam(0.3, 2.2, 0.5, 0.045), seamMat, g)
    seam.position.x = side * 2.0
    // red dust cap on the far end
    const cap = k.mesh(new THREE.CylinderGeometry(0.33, 0.33, 0.28, 40).rotateZ(Math.PI / 2), capMat, g)
    cap.position.x = side * 3.2
    // band clamp + screw
    const clamp = k.mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.2, 40).rotateZ(Math.PI / 2), k.M.plated, g)
    clamp.position.x = side * 1.0
    const screw = k.mesh(k.box(0.16, 0.1, 0.12, 0.02), k.M.steel, g)
    screw.position.set(side * 1.0, 0.36, 0)
    // cast coupling body: neck, bulb, and the face with its gasket
    const neck = k.mesh(new THREE.CylinderGeometry(0.34, 0.38, 0.45, 40).rotateZ(Math.PI / 2), body, g)
    neck.position.x = side * 0.78
    const bulb = k.mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.62, 48).rotateZ(Math.PI / 2), body, g)
    bulb.position.x = side * 0.36
    const rim = k.mesh(new THREE.TorusGeometry(0.5, 0.04, 12, 48).rotateY(Math.PI / 2), body, g)
    rim.position.x = side * 0.05
    const gasket = k.mesh(new THREE.TorusGeometry(0.34, 0.07, 16, 40).rotateY(Math.PI / 2), k.M.rubber, g)
    gasket.position.x = side * 0.02
    // cast claw lugs either side of the face
    for (const z of [-1, 1]) {
      const lugMesh = k.mesh(k.box(0.34, 0.2, 0.12, 0.03), body, g)
      lugMesh.position.set(side * 0.2, 0.0, z * 0.56)
    }
    return g
  })
  const pivot = new THREE.Group()
  pivot.position.set(-0.3, 0.55, 0)
  k.group.add(pivot)
  const lever = k.mesh(k.box(0.14, 0.12, 0.5, 0.03), k.M.dark, pivot)
  lever.position.set(0.2, 0.0, 0)
  const lug = k.mesh(k.box(0.5, 0.1, 0.16, 0.03), k.M.dark)
  lug.position.set(0.3, 0.6, 0)
  return {
    ...k.finish(),
    distance: 11,
    action: { title: 'Coupling halves connect', caption: 'Brake pipe / feed pipe halves are brought face to face and latched so air passes through the sealed joint.' },
    setAction(p) {
      const close = smooth(p, 0, 0.7), latch = smooth(p, 0.7, 1)
      const gap = 1.4 * (1 - close)
      halves[0].position.x = -gap / 2
      halves[1].position.x = gap / 2
      pivot.position.x = -gap / 2 - 0.1
      pivot.rotation.z = -1.1 * latch
      lug.position.x = gap / 2 + 0.3
    },
  }
}

/** places `n` ring meshes along a curve between two moving end frames */
function chain(n: number, build: (i: number) => THREE.Mesh) {
  const items = Array.from({ length: n }, (_, i) => build(i))
  return {
    items,
    place(a: THREE.Vector3, b: THREE.Vector3, yawB: number, bow = 0) {
      items.forEach((m, i) => {
        const t = n === 1 ? 0 : i / (n - 1)
        m.position.lerpVectors(a, b, t)
        m.position.x += bow * Math.sin(Math.PI * t)
        m.rotation.y = yawB * t
      })
    },
  }
}

function frameShape(w: number, h: number, iw: number, ih: number, r: number) {
  const rr = (s: THREE.Shape | THREE.Path, x: number, y: number, ww: number, hh: number, rad: number) => {
    s.moveTo(x + rad, y)
    s.lineTo(x + ww - rad, y); s.quadraticCurveTo(x + ww, y, x + ww, y + rad)
    s.lineTo(x + ww, y + hh - rad); s.quadraticCurveTo(x + ww, y + hh, x + ww - rad, y + hh)
    s.lineTo(x + rad, y + hh); s.quadraticCurveTo(x, y + hh, x, y + hh - rad)
    s.lineTo(x, y + rad); s.quadraticCurveTo(x, y, x + rad, y)
  }
  const shape = new THREE.Shape()
  rr(shape, -w / 2, -h / 2, w, h, r)
  const hole = new THREE.Path()
  rr(hole, -iw / 2, -ih / 2, iw, ih, r * 0.7)
  shape.holes.push(hole)
  return shape
}

/* 3 ─ Inter-car gangway mounting: pleated rubber bellows between two frames */
function gangway(): DemoModel {
  const k = kit()
  const frame = (z: number) => {
    const m = k.mesh(new THREE.ExtrudeGeometry(frameShape(2.6, 3.2, 2.0, 2.6, 0.25), { depth: 0.2, bevelEnabled: false, curveSegments: 10 }), k.M.steel)
    m.position.z = z
    return m
  }
  const A = frame(-0.9), B = frame(0.9)
  const folds = chain(9, (i) => {
    const s = i % 2 ? 1.07 : 1.0
    const geo = new THREE.ExtrudeGeometry(frameShape(2.45 * s, 3.05 * s, 2.0, 2.6, 0.25), { depth: 0.16, bevelEnabled: false, curveSegments: 10 })
    return k.mesh(geo, k.M.rubber)
  })
  const a = new THREE.Vector3(), b = new THREE.Vector3()
  return {
    ...k.finish(),
    distance: 9.5,
    action: { title: 'Bellows flex as coaches articulate', caption: 'The pleated elastomer connection takes up lateral and angular movement between coaches on curves.' },
    setAction(p) {
      const yaw = 0.42 * p
      B.position.set(0.55 * p, 0, 0.9 - 0.1 * p)
      B.rotation.y = yaw
      a.set(0, 0, -0.9)
      b.copy(B.position)
      folds.place(a, b, yaw, 0.08 * p)
      void A
    },
  }
}

/* 4 ─ UIC elastomer flange connection: convoluted elastomer between two flanges */
function uicFlange(): DemoModel {
  const k = kit()
  const flange = (z: number) => {
    const g = new THREE.Group()
    k.group.add(g)
    const disc = k.mesh(new THREE.CylinderGeometry(1.35, 1.35, 0.16, 56).rotateX(Math.PI / 2), k.M.steel, g)
    disc.scale.set(1, 1, 1)
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2
      const bolt = k.mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.3, 12).rotateX(Math.PI / 2), k.M.plated, g)
      bolt.position.set(Math.cos(a) * 1.12, Math.sin(a) * 1.12, 0)
    }
    g.position.z = z
    return g
  }
  const A = flange(-1.3), B = flange(1.3)
  const rings = chain(8, () => k.mesh(new THREE.TorusGeometry(0.95, 0.2, 18, 48), k.M.rubber))
  const a = new THREE.Vector3(), b = new THREE.Vector3()
  return {
    ...k.finish(),
    distance: 9,
    action: { title: 'Flexes with misalignment', caption: 'The elastomer connection absorbs offset and angular movement between passenger coaches.' },
    setAction(p) {
      B.position.set(0.7 * p, 0, 1.3 - 0.18 * p)
      B.rotation.y = 0.3 * p
      a.copy(A.position)
      b.copy(B.position)
      rings.place(a, b, 0.3 * p, 0.12 * p)
      void A
    },
  }
}

/** rubber annulus bonded between two steel sleeves; the inner sleeve displaces and the rubber deforms with it */
function bondedBush(o: { rIn: number; rOut: number; len: number; sleeve: number; axisCamera?: boolean; dir: 'y' | 'x'; title: string; caption: string; distance: number }): DemoModel {
  const k = kit()
  const SEG = 72, RAD = 7
  const inner = k.mesh(new THREE.CylinderGeometry(o.rIn, o.rIn, o.len * 1.25, 48).rotateX(Math.PI / 2), k.M.plated)
  const outer = k.mesh(new THREE.CylinderGeometry(o.rOut + o.sleeve, o.rOut + o.sleeve, o.len, 64, 1, true).rotateX(Math.PI / 2), k.M.steel)
  ;(outer.material as THREE.MeshStandardMaterial).side = THREE.DoubleSide
  const rim = (zs: number) => k.mesh(new THREE.RingGeometry(o.rOut, o.rOut + o.sleeve, 64).translate(0, 0, zs), k.M.steel)
  rim(o.len / 2); rim(-o.len / 2)

  // deformable rubber end faces
  const faces = [1, -1].map((side) => {
    const pos = new Float32Array((RAD + 1) * (SEG + 1) * 3)
    const nor = new Float32Array(pos.length)
    for (let i = 0; i < nor.length; i += 3) nor[i + 2] = side
    const idx: number[] = []
    for (let r = 0; r < RAD; r++)
      for (let s = 0; s < SEG; s++) {
        const a = r * (SEG + 1) + s, b = a + 1, c = a + SEG + 1, d = c + 1
        side > 0 ? idx.push(a, b, c, b, d, c) : idx.push(a, c, b, b, c, d)
      }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('normal', new THREE.BufferAttribute(nor, 3))
    g.setIndex(idx)
    g.userData.side = side
    return k.mesh(g, k.M.rubber)
  })
  faces.forEach((m) => (m.frustumCulled = false))
  // rubber wall inside the bore, seen through the gap
  const wall = k.mesh(new THREE.CylinderGeometry(o.rOut, o.rOut, o.len, 64, 1, true).rotateX(Math.PI / 2), k.M.rubber)
  ;(wall.material as THREE.MeshStandardMaterial).side = THREE.BackSide

  const update = (dx: number, dy: number) => {
    faces.forEach((m) => {
      const side = m.geometry.userData.side as number
      const pos = m.geometry.getAttribute('position') as THREE.BufferAttribute
      for (let r = 0; r <= RAD; r++) {
        const t = r / RAD
        const rad = o.rIn + (o.rOut - o.rIn) * t
        const w = 1 - t // inner edge follows the sleeve fully, outer edge stays put
        for (let s = 0; s <= SEG; s++) {
          const th = (s / SEG) * Math.PI * 2
          pos.setXYZ(r * (SEG + 1) + s, Math.cos(th) * rad + dx * w, Math.sin(th) * rad + dy * w, (side * o.len) / 2)
        }
      }
      pos.needsUpdate = true
    })
    inner.position.set(dx, dy, 0)
  }
  update(0, 0)
  return {
    ...k.finish(),
    distance: o.distance,
    action: { title: o.title, caption: o.caption },
    setAction(p) {
      const d = 0.62 * Math.sin(p * Math.PI * 0.5) * (o.rOut - o.rIn)
      o.dir === 'y' ? update(0, -d) : update(d, 0)
    },
  }
}

const fiatBush = () =>
  bondedBush({
    rIn: 0.38, rOut: 1.05, len: 1.7, sleeve: 0.1, dir: 'y', distance: 8,
    title: 'Rubber deforms, steel stays bonded',
    caption: 'The inner sleeve moves under bogie load while the bonded rubber carries the movement.',
  })

const elasticRing = () =>
  bondedBush({
    rIn: 0.85, rOut: 1.35, len: 0.55, sleeve: 0.12, dir: 'x', distance: 8,
    title: 'Elastic movement in the traction link',
    caption: 'The elastic ring lets the link move relative to its housing while damping the transmitted load.',
  })

/* 6 ─ PU constant-contact side bearer: PU block under a wear plate */
function puSideBearer(): DemoModel {
  const k = kit()
  const base = k.mesh(k.box(2.4, 0.45, 1.7, 0.05), k.M.steel)
  base.position.y = -0.8
  const profile = [[0.0, 0], [0.62, 0], [0.66, 0.05], [0.66, 0.8], [0.6, 0.86], [0, 0.86]].map(([r, y]) => new THREE.Vector2(r, y))
  const pu = k.mesh(new THREE.LatheGeometry(profile, 56), k.M.pu)
  const plate = k.mesh(k.box(2.1, 0.2, 1.5, 0.04), k.M.dark)
  const H = 0.86
  return {
    ...k.finish(),
    distance: 7.5,
    action: { title: 'Constant contact under load', caption: 'The polyurethane block stays in contact with the bolster, compressing and recovering as the body rolls.' },
    setAction(p) {
      const c = 0.3 * p
      const h = H - c
      setM(pu, { ty: -0.575, sy: h / H, sx: 1 + 0.18 * p, sz: 1 + 0.18 * p })
      plate.position.y = -0.575 + h + 0.1
    },
  }
}

/* 8 ─ Spheribloc: spherical elastomer bearing — housing ring, rubber sphere, tilting bore pin */
function spheribloc(): DemoModel {
  const k = kit()
  const root = new THREE.Group()
  root.rotation.y = Math.PI / 2 // axis runs left-right so the pin reads clearly
  k.group.add(root)
  const housingProfile = [[1.0, -0.5], [1.32, -0.5], [1.32, 0.5], [1.0, 0.5], [1.0, -0.5]].map(([r, y]) => new THREE.Vector2(r, y))
  const housing = k.mesh(new THREE.LatheGeometry(housingProfile, 64).rotateX(Math.PI / 2), k.M.steel, root)
  ;(housing.material as THREE.MeshStandardMaterial).side = THREE.DoubleSide
  const sphere = k.mesh(new THREE.SphereGeometry(1.18, 56, 40), k.M.rubber, root)
  const core = new THREE.Group()
  root.add(core)
  const pin = k.mesh(new THREE.CylinderGeometry(0.34, 0.34, 3.0, 40, 1, true).rotateX(Math.PI / 2), k.M.plated, core)
  ;(pin.material as THREE.MeshStandardMaterial).side = THREE.DoubleSide
  ;[1.5, -1.5].forEach((z) => {
    const lip = k.mesh(new THREE.TorusGeometry(0.34, 0.035, 12, 40), k.M.plated, core)
    lip.position.z = z
  })
  void sphere
  return {
    ...k.finish(),
    distance: 8,
    action: { title: 'Tilts without sliding', caption: 'The spherical elastomer layer lets the inner member rotate in any direction while it stays bonded to the housing.' },
    setAction(p) {
      core.rotation.x = 0.42 * Math.sin(p * Math.PI * 0.5)
      core.rotation.y = 0.3 * Math.sin(p * Math.PI * 0.5)
    },
  }
}

const BUILDERS: Record<string, () => DemoModel> = {
  'elastomeric-pads-design-b': elastomericPad,
  'air-brake-hose-coupling': airBrakeCoupling,
  'inter-car-gangway-mounting': gangway,
  'uic-elastomer-flange-connections': uicFlange,
  'elastomer-metal-bonded-fiat-bogie': fiatBush,
  'pu-constant-contact-side-bearers': puSideBearer,
  'elastic-ring-traction-link': elasticRing,
  spheriblocs: spheribloc,
}

export function hasRailwayModel(slug: string) {
  return slug in BUILDERS
}

export function buildRailwayModel(slug: string): DemoModel {
  const build = BUILDERS[slug]
  if (!build) throw new Error(`No railway model for ${slug}`)
  return build()
}
