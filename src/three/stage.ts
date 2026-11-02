import { buildHose, QUALITY, type HoseModel } from './hose'
import { Studio, type Projected, type StudioOptions } from './studio'
import type { HoseSpec } from './spec'

/**
 * The ONLY thing animation code touches. GSAP (hero) or pointer handlers
 * (product viewer) write these numbers; the stage reads them when it renders.
 * No other system moves the camera or the hose — one owner, no fights.
 */
export interface StageState {
  /** axis position the camera looks at (−3.5 … +3.5 along the hose) */
  focusX: number
  /** shifts the look-at point up (+ → hose sits lower on screen) so text and model don't collide */
  lookY: number
  /** camera offset from that point */
  offX: number
  offY: number
  offZ: number
  rotY: number
  rotX: number
  /** 0 = finished hose, 1 = layers peeled back, fitting withdrawn */
  peel: number
  /** 0 = straight, 1 = resting arc, >1 = tighter */
  bend: number
  /** 0…1 — how much to pull back on narrow (portrait) screens */
  fit: number
}

export const REST_STATE: StageState = {
  focusX: 0, lookY: 0, offX: -1.4, offY: 1.1, offZ: 12.5, rotY: -0.32, rotX: 0.06, peel: 0, bend: 1, fit: 1,
}

export class HoseStage extends Studio {
  readonly state: StageState = { ...REST_STATE }
  readonly model: HoseModel

  constructor(canvas: HTMLCanvasElement, spec: HoseSpec, opts: StudioOptions = {}) {
    super(canvas, { ...opts, shadowY: -2.35, shadowSize: [13, 3.2] })
    this.model = buildHose(spec, QUALITY[this.quality], this.renderer.capabilities.getMaxAnisotropy())
    this.scene.add(this.model.group)
    this.resize()
  }

  protected apply() {
    const s = this.state
    this.model.setPeel(s.peel)
    this.model.setBend(s.bend)
    this.model.group.rotation.set(s.rotX, s.rotY, 0)
    this.model.group.updateMatrixWorld(true)

    const target = this.model.pointAt(s.focusX).applyMatrix4(this.model.group.matrixWorld)
    target.y += s.lookY
    // pull back when the viewport is narrower than the 16:9 the shots are framed for
    const k = 1 + Math.max(0, 1.75 / this.camera.aspect - 1) * s.fit * 0.8
    this.camera.position.set(target.x + s.offX * k, target.y + s.offY * k, target.z + s.offZ * k)
    this.camera.lookAt(target)
    this.camera.updateMatrixWorld(true)
  }

  /** hose-local axis/radial position → canvas CSS pixels (valid after a render) */
  project(x: number, y = 0, z = 0): Projected {
    const v = this.model.pointAt(x, y, z).applyMatrix4(this.model.group.matrixWorld)
    return this.projectWorld(v)
  }

  protected disposeContent() {
    this.model.dispose()
  }
}

export type { Projected }
