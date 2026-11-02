import * as THREE from 'three'
import { Studio, type StudioOptions } from './studio'
import { buildRailwayModel, type DemoModel } from './railway'

/** One model on show. The hero uses several at once to blend between two parts. */
export interface DemoLayer {
  slug: string
  /** 0…1 — drives the model's action */
  action: number
  rotY: number
  /** sideways slide, world units */
  x: number
  scale: number
  opacity: number
}

export interface DemoState {
  rotY: number
  rotX: number
  /** camera distance multiplier (zoom) */
  zoom: number
  /** 0…1 — drives the model's action */
  action: number
  /** shifts the model sideways by this fraction of the canvas width (hero layout) */
  shift: number
  /** when non-empty, these replace the single model (used for the scroll transitions) */
  layers: DemoLayer[]
}

/** Presents railway components; swap the single model with `setModel`, or blend several with `state.layers`. */
export class DemoStage extends Studio {
  readonly state: DemoState = { rotY: -0.55, rotX: 0.32, zoom: 1, action: 0, shift: 0, layers: [] }
  model!: DemoModel
  private pool = new Map<string, DemoModel>()
  private faded = new WeakSet<DemoModel>()

  constructor(canvas: HTMLCanvasElement, slug: string, opts: StudioOptions = {}) {
    super(canvas, { ...opts, shadowY: -1.7, shadowSize: [12, 5] })
    this.setModel(slug)
  }

  setModel(slug: string) {
    if (this.model) {
      this.scene.remove(this.model.group)
      this.model.dispose()
    }
    this.model = buildRailwayModel(slug)
    this.scene.add(this.model.group)
    this.state.action = 0
    this.invalidate()
  }

  /** a model currently in use by the layers, if it has been built yet */
  getModel(slug: string): DemoModel | undefined {
    return this.pool.get(slug)
  }

  /** builds what the layers need and drops what they no longer use */
  private syncPool() {
    const want = new Set(this.state.layers.map((l) => l.slug))
    for (const [slug, m] of this.pool) {
      if (want.has(slug)) continue
      this.scene.remove(m.group)
      m.dispose()
      this.pool.delete(slug)
    }
    for (const slug of want) {
      if (this.pool.has(slug)) continue
      const m = buildRailwayModel(slug)
      this.pool.set(slug, m)
      this.scene.add(m.group)
    }
  }

  /** blends a model in or out; materials are only made transparent while they are actually fading */
  private setOpacity(m: DemoModel, o: number) {
    const fading = o < 0.995
    if (!fading && !this.faded.has(m)) return
    m.group.traverse((obj) => {
      const mesh = obj as THREE.Mesh
      if (!mesh.isMesh) return
      for (const mat of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
        const mm = mat as THREE.MeshStandardMaterial
        if (mm.transparent !== fading) {
          mm.transparent = fading
          mm.needsUpdate = true
        }
        mm.opacity = fading ? Math.max(0, o) : 1
      }
    })
    fading ? this.faded.add(m) : this.faded.delete(m)
  }

  protected apply() {
    const s = this.state
    let distance: number
    if (s.layers.length) {
      this.model.group.visible = false
      this.syncPool()
      let sum = 0, weighted = 0
      for (const l of s.layers) {
        const m = this.pool.get(l.slug)!
        m.group.visible = l.opacity > 0.01
        m.setAction(l.action)
        m.group.rotation.set(s.rotX, l.rotY, 0)
        m.group.position.x = l.x
        m.group.scale.setScalar(l.scale)
        this.setOpacity(m, l.opacity)
        sum += l.opacity
        weighted += l.opacity * m.distance
      }
      distance = sum > 0 ? weighted / sum : this.model.distance
    } else {
      this.model.setAction(s.action)
      this.model.group.rotation.set(s.rotX, s.rotY, 0)
      distance = this.model.distance
    }
    // narrow screens need more distance for the same framing
    const k = Math.max(1, 1.2 / this.camera.aspect)
    this.camera.position.set(0, 0, distance * s.zoom * k)
    this.camera.lookAt(0, 0, 0)
    if (s.shift) this.camera.setViewOffset(this.size.w, this.size.h, -s.shift * this.size.w, 0, this.size.w, this.size.h)
    else this.camera.clearViewOffset()
  }

  protected disposeContent() {
    this.model?.dispose()
    this.pool.forEach((m) => m.dispose())
    this.pool.clear()
  }
}
