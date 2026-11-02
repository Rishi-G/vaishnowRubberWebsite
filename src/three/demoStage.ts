import { Studio, type StudioOptions } from './studio'
import { buildRailwayModel, type DemoModel } from './railway'

export interface DemoState {
  rotY: number
  rotX: number
  /** camera distance multiplier (zoom) */
  zoom: number
  /** 0…1 — drives the model's action */
  action: number
}

/** Presents one railway component at a time; swap models with `setModel`. */
export class DemoStage extends Studio {
  readonly state: DemoState = { rotY: -0.55, rotX: 0.32, zoom: 1, action: 0 }
  model!: DemoModel

  constructor(canvas: HTMLCanvasElement, slug: string, opts: StudioOptions = {}) {
    super(canvas, { ...opts, shadowY: -1.7, shadowSize: [8, 4] })
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

  protected apply() {
    const s = this.state
    this.model.setAction(s.action)
    this.model.group.rotation.set(s.rotX, s.rotY, 0)
    // narrow screens need more distance for the same framing
    const k = Math.max(1, 1.2 / this.camera.aspect)
    this.camera.position.set(0, 0, this.model.distance * s.zoom * k)
    this.camera.lookAt(0, 0, 0)
  }

  protected disposeContent() {
    this.model?.dispose()
  }
}
