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
 * Reflection environment for realistic mode: a dim room with a few very bright softboxes, like a
 * product-photo set. Metal only looks like metal when it has something high-contrast to reflect —
 * bright strips next to dark walls give the crisp highlights and dark bands of polished steel.
 * (The default RoomEnvironment is evenly lit, which is why metal looked like grey clay.)
 */
function makeStudioEnvironment(renderer: THREE.WebGLRenderer): THREE.WebGLRenderTarget {
  const scene = new THREE.Scene()
  const made: { dispose(): void }[] = []
  // values above 1 are kept: the environment is rendered to a float target
  const panel = (w: number, h: number, power: number, pos: [number, number, number], look: [number, number, number] = [0, 0, 0]) => {
    const geo = new THREE.PlaneGeometry(w, h)
    const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color().setScalar(power), side: THREE.DoubleSide, toneMapped: false })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.position.set(...pos)
    mesh.lookAt(...look)
    scene.add(mesh)
    made.push(geo, mat)
  }
  const roomGeo = new THREE.BoxGeometry(24, 14, 24)
  const roomMat = new THREE.MeshBasicMaterial({ color: new THREE.Color().setScalar(0.1), side: THREE.BackSide })
  scene.add(new THREE.Mesh(roomGeo, roomMat))
  made.push(roomGeo, roomMat)
  panel(24, 24, 0.55, [0, -6.9, 0]) // pale floor, like the page the part sits on
  panel(9, 5, 9, [0, 6.5, 1]) // overhead softbox: the broad top highlight
  panel(1.6, 9, 9, [-10, 1, 3]) // left strip: a long vertical highlight on cylinders
  panel(1.1, 9, 8, [10, 1.5, -2]) // right strip, narrower
  panel(10, 4, 2.2, [0, 1.5, 11]) // soft fill behind the camera so facing surfaces are not black
  panel(7, 0.9, 9, [0, 4, -11]) // thin rim light from behind

  const pmrem = new THREE.PMREMGenerator(renderer)
  const target = pmrem.fromScene(scene, 0.015)
  pmrem.dispose()
  made.forEach((d) => d.dispose())
  return target
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
  private key: THREE.DirectionalLight
  private realistic = false
  private envTarget: THREE.WebGLRenderTarget
  /** high-contrast reflections for realistic mode, built the first time it is switched on */
  private envStudio: THREE.WebGLRenderTarget | null = null
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
    this.key = key
    // used only in realistic mode: the key light casts real shadows onto the model itself
    key.castShadow = false
    key.shadow.mapSize.setScalar(this.quality === 'high' ? 2048 : 1024)
    const sc = key.shadow.camera
    sc.left = sc.bottom = -9
    sc.right = sc.top = 9
    sc.near = 0.5
    sc.far = 30
    key.shadow.bias = -0.0004
    key.shadow.normalBias = 0.03

    const [sw, sd] = opts.shadowSize ?? [13, 3.2]
    const shadowMat = new THREE.MeshBasicMaterial({ map: makeShadowTexture(), transparent: true, depthWrite: false, toneMapped: false })
    this.shadow = new THREE.Mesh(new THREE.PlaneGeometry(sw, sd), shadowMat)
    this.shadow.rotation.x = -Math.PI / 2
    this.shadow.position.y = opts.shadowY ?? -2.35
    this.shadow.userData.rig = true
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
    // resizing clears the canvas; draw now instead of on the next frame so it never shows blank
    // (entering full screen, rotating a phone)
    this.dirty = true
    cancelAnimationFrame(this.raf)
    this.frame()
  }

  /** true on desktop-class devices; the viewers use it to decide whether realistic lighting starts on */
  get highQuality() {
    return this.quality === 'high'
  }

  get isRealistic() {
    return this.realistic
  }

  /**
   * Realistic lighting: the key light casts shadow-mapped shadows, so parts shade each other (a
   * fitting darkens the hose beside it, braid wires shade the layer below), with a stronger key and
   * brighter reflections. The soft painted floor shadow is kept in both modes: a real floor shadow
   * of a thin hose is a hard bar that looks worse.
   */
  setRealistic(on: boolean) {
    this.realistic = on
    this.renderer.shadowMap.enabled = on
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.key.castShadow = on
    this.key.intensity = on ? 3.1 : 2.4
    if (on && !this.envStudio) this.envStudio = makeStudioEnvironment(this.renderer)
    this.scene.environment = on && this.envStudio ? this.envStudio.texture : this.envTarget.texture
    this.scene.environmentIntensity = on ? 1 : 0.95
    this.syncShadowFlags()
    // materials must recompile to pick up (or drop) the shadow code
    this.scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh
      if (!mesh.isMesh) return
      for (const mat of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) mat.needsUpdate = true
    })
    this.invalidate()
  }

  /** content meshes cast and receive shadows only in realistic mode; models added later are picked up each frame */
  private syncShadowFlags() {
    this.scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh
      if (!mesh.isMesh || mesh.userData.rig) return
      mesh.castShadow = mesh.receiveShadow = this.realistic
    })
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
    if (this.realistic) this.syncShadowFlags()
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
    this.envStudio?.dispose()
    this.renderer.dispose()
  }
}
