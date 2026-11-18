import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

/* ───────────── a small on-demand viewer for client-supplied models ───────────── */

export interface CustomState {
  rotY: number
  rotX: number
  zoom: number
  panX: number
  panY: number
}

export const CUSTOM_REST: CustomState = { rotY: -0.5, rotX: 0.25, zoom: 1, panX: 0, panY: 0 }

/** Shows one object (an uploaded .glb or a model built from photos) with orbit, zoom and pan. */
export class CustomStage {
  readonly state: CustomState = { ...CUSTOM_REST }
  autoRotate = false
  private renderer: THREE.WebGLRenderer
  private scene = new THREE.Scene()
  private camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100)
  private pivot = new THREE.Group()
  private object: THREE.Object3D | null = null
  private raf = 0
  private dirty = true
  private disposed = false
  private ro: ResizeObserver
  private wire = false

  static supported() {
    try {
      const c = document.createElement('canvas')
      return !!(c.getContext('webgl2') || c.getContext('webgl'))
    } catch {
      return false
    }
  }

  constructor(private canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    const pmrem = new THREE.PMREMGenerator(this.renderer)
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    pmrem.dispose()
    const key = new THREE.DirectionalLight(0xffffff, 1.6)
    key.position.set(3, 5, 4)
    this.scene.add(key, new THREE.AmbientLight(0xffffff, 0.35), this.pivot)
    this.ro = new ResizeObserver(() => this.resize())
    this.ro.observe(canvas)
    this.resize()
    this.loop()
  }

  /** Centre the object, scale it to a fixed size and show it. */
  setObject(obj: THREE.Object3D) {
    if (this.object) this.pivot.remove(this.object)
    const box = new THREE.Box3().setFromObject(obj)
    const size = box.getSize(new THREE.Vector3())
    const centre = box.getCenter(new THREE.Vector3())
    const holder = new THREE.Group()
    obj.position.sub(centre)
    holder.add(obj)
    holder.scale.setScalar(2.2 / (Math.max(size.x, size.y, size.z) || 1))
    this.object = holder
    this.pivot.add(holder)
    this.applyWire()
    this.invalidate()
  }

  setWireframe(on: boolean) {
    this.wire = on
    this.applyWire()
    this.invalidate()
  }

  private applyWire() {
    this.object?.traverse((o) => {
      const m = (o as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined
      for (const mat of Array.isArray(m) ? m : m ? [m] : []) (mat as THREE.MeshStandardMaterial).wireframe = this.wire
    })
  }

  invalidate() {
    this.dirty = true
  }

  private resize() {
    const w = this.canvas.clientWidth
    const h = this.canvas.clientHeight
    if (!w || !h) return
    this.renderer.setSize(w, h, false)
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    this.dirty = true
  }

  private loop = () => {
    if (this.disposed) return
    if (this.autoRotate) {
      this.state.rotY += 0.006
      this.dirty = true
    }
    if (this.dirty) {
      this.dirty = false
      const s = this.state
      this.pivot.rotation.set(s.rotX, s.rotY, 0, 'YXZ')
      this.camera.position.set(s.panX, s.panY, 7.5 / s.zoom)
      this.camera.lookAt(s.panX, s.panY, 0)
      this.renderer.render(this.scene, this.camera)
    }
    this.raf = requestAnimationFrame(this.loop)
  }

  dispose() {
    this.disposed = true
    cancelAnimationFrame(this.raf)
    this.ro.disconnect()
    this.object?.traverse((o) => {
      const mesh = o as THREE.Mesh
      mesh.geometry?.dispose()
      const m = mesh.material as THREE.Material | THREE.Material[] | undefined
      for (const mat of Array.isArray(m) ? m : m ? [m] : []) mat.dispose()
    })
    this.scene.environment?.dispose()
    this.renderer.dispose()
  }
}

export async function loadGlb(url: string): Promise<THREE.Object3D> {
  const gltf = await new GLTFLoader().loadAsync(url)
  return gltf.scene
}

/* ───────────── 3 photos → 3D (silhouette carving) ───────────── */

interface View {
  w: number
  h: number
  /** 1 where the product is */
  mask: Uint8Array
  /** RGBA pixels of the cropped photo */
  rgba: Uint8ClampedArray
}

const loadImage = (url: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Could not load ${url}`))
    img.src = url
  })

/** Photo → product mask. The background is whatever is connected to the border and matches its colour. */
async function readView(url: string): Promise<View> {
  const img = await loadImage(url)
  const scale = Math.min(1, 320 / Math.max(img.naturalWidth, img.naturalHeight))
  const W = Math.max(8, Math.round(img.naturalWidth * scale))
  const H = Math.max(8, Math.round(img.naturalHeight * scale))
  const cv = document.createElement('canvas')
  cv.width = W
  cv.height = H
  const ctx = cv.getContext('2d', { willReadFrequently: true })!
  ctx.drawImage(img, 0, 0, W, H)
  const px = ctx.getImageData(0, 0, W, H).data

  const at = (x: number, y: number) => (y * W + x) * 4
  const corners = [at(0, 0), at(W - 1, 0), at(0, H - 1), at(W - 1, H - 1)]
  const bg = [0, 1, 2, 3].map((c) => corners.reduce((s, i) => s + px[i + c], 0) / 4)
  const isBg = (i: number) => px[i + 3] < 40 || Math.hypot(px[i] - bg[0], px[i + 1] - bg[1], px[i + 2] - bg[2]) < 42

  const outside = new Uint8Array(W * H)
  const stack: number[] = []
  const push = (x: number, y: number) => {
    const p = y * W + x
    if (!outside[p] && isBg(p * 4)) {
      outside[p] = 1
      stack.push(p)
    }
  }
  for (let x = 0; x < W; x++) {
    push(x, 0)
    push(x, H - 1)
  }
  for (let y = 0; y < H; y++) {
    push(0, y)
    push(W - 1, y)
  }
  while (stack.length) {
    const p = stack.pop()!
    const x = p % W
    const y = (p / W) | 0
    if (x > 0) push(x - 1, y)
    if (x < W - 1) push(x + 1, y)
    if (y > 0) push(x, y - 1)
    if (y < H - 1) push(x, y + 1)
  }

  let x0 = W, y0 = H, x1 = -1, y1 = -1
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++)
      if (!outside[y * W + x]) {
        if (x < x0) x0 = x
        if (x > x1) x1 = x
        if (y < y0) y0 = y
        if (y > y1) y1 = y
      }
  if (x1 < 0) throw new Error('No product found in a photo — use a plain background.')

  const w = x1 - x0 + 1
  const h = y1 - y0 + 1
  const mask = new Uint8Array(w * h)
  const rgba = new Uint8ClampedArray(w * h * 4)
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const src = (y + y0) * W + (x + x0)
      mask[y * w + x] = outside[src] ? 0 : 1
      for (let c = 0; c < 4; c++) rgba[(y * w + x) * 4 + c] = px[src * 4 + c]
    }
  return { w, h, mask, rgba }
}

const RES = 84

/**
 * Builds a mesh from silhouettes: front (x, y), right side (z, y — product front on the left) and
 * an optional top view (x, z — product front at the bottom). A voxel survives only if every photo
 * agrees it is inside the product, and each outside face is coloured from the matching photo.
 */
export async function carveFromViews(urls: { front: string; side: string; top?: string }): Promise<THREE.Object3D> {
  const [front, side, top] = await Promise.all([readView(urls.front), readView(urls.side), urls.top ? readView(urls.top) : null])

  const nx = RES
  const ny = Math.max(4, Math.min(160, Math.round((RES * front.h) / front.w)))
  const depth = (front.h * side.w) / side.h // same height as the front photo → real proportions
  const nz = Math.max(4, Math.min(160, Math.round((RES * depth) / front.w)))

  const fAt = (x: number, y: number) => ((Math.floor((1 - (y + 0.5) / ny) * front.h)) * front.w + Math.floor(((x + 0.5) / nx) * front.w))
  const sAt = (z: number, y: number) => ((Math.floor((1 - (y + 0.5) / ny) * side.h)) * side.w + Math.floor((1 - (z + 0.5) / nz) * side.w))
  const tAt = (x: number, z: number) =>
    top ? Math.floor(((z + 0.5) / nz) * top.h) * top.w + Math.floor(((x + 0.5) / nx) * top.w) : -1

  const filled = new Uint8Array(nx * ny * nz)
  const idx = (x: number, y: number, z: number) => (z * ny + y) * nx + x
  let count = 0
  for (let z = 0; z < nz; z++)
    for (let y = 0; y < ny; y++)
      for (let x = 0; x < nx; x++) {
        const ti = tAt(x, z)
        if (front.mask[fAt(x, y)] && side.mask[sAt(z, y)] && (!top || top.mask[ti])) {
          filled[idx(x, y, z)] = 1
          count++
        }
      }
  if (count < 20) throw new Error('The three photos do not describe the same shape. Check their order and angles.')

  const solid = (x: number, y: number, z: number) => x >= 0 && y >= 0 && z >= 0 && x < nx && y < ny && z < nz && filled[idx(x, y, z)] === 1

  const pos: number[] = []
  const nor: number[] = []
  const col: number[] = []
  const c = new THREE.Color()
  const colourFrom = (v: View | null, i: number, shade: number) => {
    if (!v || i < 0 || v.rgba[i * 4 + 3] < 40) c.setRGB(0.55, 0.57, 0.6, THREE.SRGBColorSpace)
    else c.setRGB(v.rgba[i * 4] / 255, v.rgba[i * 4 + 1] / 255, v.rgba[i * 4 + 2] / 255, THREE.SRGBColorSpace)
    c.multiplyScalar(shade)
  }

  const quad = (corners: number[][], n: number[], shade: number, v: View | null, i: number) => {
    colourFrom(v, i, shade)
    for (const k of [0, 1, 2, 0, 2, 3]) {
      pos.push(...corners[k])
      nor.push(...n)
      col.push(c.r, c.g, c.b)
    }
  }

  for (let z = 0; z < nz; z++)
    for (let y = 0; y < ny; y++)
      for (let x = 0; x < nx; x++) {
        if (!filled[idx(x, y, z)]) continue
        const X = x, Y = y, Z = z
        if (!solid(x, y, z + 1)) quad([[X, Y, Z + 1], [X + 1, Y, Z + 1], [X + 1, Y + 1, Z + 1], [X, Y + 1, Z + 1]], [0, 0, 1], 1, front, fAt(x, y))
        if (!solid(x, y, z - 1)) quad([[X + 1, Y, Z], [X, Y, Z], [X, Y + 1, Z], [X + 1, Y + 1, Z]], [0, 0, -1], 0.7, front, fAt(x, y))
        if (!solid(x + 1, y, z)) quad([[X + 1, Y, Z + 1], [X + 1, Y, Z], [X + 1, Y + 1, Z], [X + 1, Y + 1, Z + 1]], [1, 0, 0], 0.9, side, sAt(z, y))
        if (!solid(x - 1, y, z)) quad([[X, Y, Z], [X, Y, Z + 1], [X, Y + 1, Z + 1], [X, Y + 1, Z]], [-1, 0, 0], 0.8, side, sAt(z, y))
        if (!solid(x, y + 1, z)) quad([[X, Y + 1, Z + 1], [X + 1, Y + 1, Z + 1], [X + 1, Y + 1, Z], [X, Y + 1, Z]], [0, 1, 0], 1, top, tAt(x, z))
        if (!solid(x, y - 1, z)) quad([[X, Y, Z], [X + 1, Y, Z], [X + 1, Y, Z + 1], [X, Y, Z + 1]], [0, -1, 0], 0.6, top, tAt(x, z))
      }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3))
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3))
  return new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.62, metalness: 0.08 }))
}
