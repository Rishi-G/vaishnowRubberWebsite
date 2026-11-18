import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js'
import { unzipSync } from 'fflate'
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

/* ───────────── loading a client-supplied model: .zip, .glb, .gltf or .obj ───────────── */

const ext = (name: string) => name.toLowerCase().split('.').pop() ?? ''
const mimeOf = (name: string) => (/\.(png)$/i.test(name) ? 'image/png' : /\.(jpe?g)$/i.test(name) ? 'image/jpeg' : /\.(webp)$/i.test(name) ? 'image/webp' : 'application/octet-stream')
const text = (b: Uint8Array) => new TextDecoder().decode(b)

/** Gives a plain grey material to any mesh that came without one (an .obj with no .mtl). */
function ensureMaterials(root: THREE.Object3D) {
  const fallback = new THREE.MeshStandardMaterial({ color: 0x9aa0a8, roughness: 0.55, metalness: 0.15 })
  root.traverse((o) => {
    const m = o as THREE.Mesh
    if (m.isMesh && !m.material) m.material = fallback
    if (m.isMesh && !m.geometry.attributes.normal) m.geometry.computeVertexNormals()
  })
}

/** Loads the file at `url`. A zip is unpacked in the browser and the first model inside it is used. */
export async function loadModel(url: string): Promise<THREE.Object3D> {
  const res = await fetch(url)
  if (!res.ok) throw new Error('The 3D file could not be downloaded.')
  const buf = new Uint8Array(await res.arrayBuffer())
  const isZip = buf[0] === 0x50 && buf[1] === 0x4b
  const files: Record<string, Uint8Array> = isZip ? unzipSync(buf) : { [url.split('?')[0]]: buf }

  const names = Object.keys(files).filter((n) => !n.includes('__MACOSX') && !n.split('/').pop()!.startsWith('.'))
  const pick = (e: string) => names.find((n) => ext(n) === e)
  const urls = new Map<string, string>()
  const blobUrl = (name: string) => {
    const base = name.split('/').pop()!
    if (!urls.has(base)) urls.set(base, URL.createObjectURL(new Blob([files[name] as BlobPart], { type: mimeOf(name) })))
    return urls.get(base)!
  }
  // textures / .bin files referenced by name resolve to the unpacked files
  const manager = new THREE.LoadingManager()
  manager.setURLModifier((u) => {
    const base = decodeURIComponent(u.split('/').pop()!.split('?')[0])
    const hit = names.find((n) => n.split('/').pop() === base)
    return hit ? blobUrl(hit) : u
  })

  try {
    const glb = pick('glb')
    if (glb) {
      const b = files[glb]
      const gltf = await new GLTFLoader(manager).parseAsync(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as ArrayBuffer, '')
      return gltf.scene
    }
    const gltfName = pick('gltf')
    if (gltfName) return (await new GLTFLoader(manager).parseAsync(text(files[gltfName]), '')).scene
    const obj = pick('obj')
    if (obj) {
      const loader = new OBJLoader(manager)
      const mtl = pick('mtl')
      if (mtl) loader.setMaterials(new MTLLoader(manager).parse(text(files[mtl]), ''))
      const group = loader.parse(text(files[obj]))
      ensureMaterials(group)
      return group
    }
    throw new Error('No .glb, .gltf or .obj model was found in the uploaded file.')
  } finally {
    // the parsed scene keeps its own copies of the textures
    setTimeout(() => urls.forEach((u) => URL.revokeObjectURL(u)), 10_000)
  }
}
