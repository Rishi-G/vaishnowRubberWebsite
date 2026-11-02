import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { makeShadowTexture } from './textures'

export interface Projected {
  x: number
  y: number
  visible: boolean
}

export interface StudioOptions {
  quality?: 'high' | 'low'
  dprCap?: number
  shadowY?: number
  shadowSize?: [number, number]
}

/**
 * Shared presentation rig: one renderer, neutral studio reflections, key + rim
 * light, soft contact shadow. Renders ON DEMAND — only when `invalidate()` was
 * called and the canvas is on screen — so an idle page costs no GPU time.
 * Subclasses own the content and implement `apply()` (state → scene).
 */
export abstract class Studio {
  static supported(): boolean {
    try {
      const c = document.createElement('canvas')
      return !!(c.getContext('webgl2') || c.getContext('webgl'))
    } catch {
      return false
    }
  }

  onFrame?: (studio: Studio) => void
  onContextLost?: () => void

  protected renderer: THREE.WebGLRenderer
  protected scene = new THREE.Scene()
  protected camera = new THREE.PerspectiveCamera(30, 1, 0.1, 80)
  protected size = { w: 1, h: 1 }
  protected quality: 'high' | 'low'
  protected disposed = false

  private shadow: THREE.Mesh
  private envTarget: THREE.WebGLRenderTarget
  private dirty = true
  private visible = true
  private raf = 0
  private ro: ResizeObserver
  private io: IntersectionObserver
  private tmp = new THREE.Vector3()

  protected abstract apply(): void
  protected abstract disposeContent(): void

  constructor(protected canvas: HTMLCanvasElement, opts: StudioOptions = {}) {
    this.quality = opts.quality ?? 'high'
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
    this.renderer.setClearColor(0x000000, 0)
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.05
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, opts.dprCap ?? (this.quality === 'high' ? 2 : 1.5)))

    const pmrem = new THREE.PMREMGenerator(this.renderer)
    this.envTarget = pmrem.fromScene(new RoomEnvironment(), 0.04)
    pmrem.dispose()
    this.scene.environment = this.envTarget.texture
    this.scene.environmentIntensity = 0.95
    const key = new THREE.DirectionalLight(0xffffff, 2.4)
    key.position.set(4, 6, 5)
    const rim = new THREE.DirectionalLight(0xcfe4ff, 1.8)
    rim.position.set(-6, 2.5, -4)
    this.scene.add(key, rim)

    const [sw, sd] = opts.shadowSize ?? [13, 3.2]
    const shadowMat = new THREE.MeshBasicMaterial({ map: makeShadowTexture(), transparent: true, depthWrite: false, toneMapped: false })
    this.shadow = new THREE.Mesh(new THREE.PlaneGeometry(sw, sd), shadowMat)
    this.shadow.rotation.x = -Math.PI / 2
    this.shadow.position.y = opts.shadowY ?? -2.35
    this.scene.add(this.shadow)

    const parent = canvas.parentElement ?? canvas
    this.ro = new ResizeObserver(() => this.resize())
    this.ro.observe(parent)
    this.io = new IntersectionObserver(([e]) => {
      this.visible = e.isIntersecting
      if (this.visible) this.invalidate()
    })
    this.io.observe(canvas)
    canvas.addEventListener('webglcontextlost', this.handleLost)
  }

  private handleLost = (e: Event) => {
    e.preventDefault()
    this.onContextLost?.()
  }

  resize() {
    if (this.disposed) return
    const el = this.canvas.parentElement ?? this.canvas
    const w = Math.max(1, el.clientWidth), h = Math.max(1, el.clientHeight)
    this.size = { w, h }
    this.renderer.setSize(w, h, false)
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    this.invalidate()
  }

  invalidate() {
    this.dirty = true
    if (!this.raf && this.visible && !this.disposed) this.raf = requestAnimationFrame(this.frame)
  }

  private frame = () => {
    this.raf = 0
    if (!this.dirty || !this.visible || this.disposed) return
    this.dirty = false
    this.apply()
    this.renderer.render(this.scene, this.camera)
    this.onFrame?.(this)
  }

  protected projectWorld(v: THREE.Vector3): Projected {
    this.tmp.copy(v).project(this.camera)
    return { x: ((this.tmp.x + 1) / 2) * this.size.w, y: ((1 - this.tmp.y) / 2) * this.size.h, visible: this.tmp.z < 1 }
  }

  dispose() {
    this.disposed = true
    cancelAnimationFrame(this.raf)
    this.ro.disconnect()
    this.io.disconnect()
    this.canvas.removeEventListener('webglcontextlost', this.handleLost)
    this.disposeContent()
    this.shadow.geometry.dispose()
    ;(this.shadow.material as THREE.MeshBasicMaterial).map?.dispose()
    ;(this.shadow.material as THREE.Material).dispose()
    this.envTarget.dispose()
    this.renderer.dispose()
  }
}
