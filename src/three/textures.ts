import * as THREE from 'three'

/** Tileable micro-relief for moulded/extruded rubber (height noise → normal map). */
export function makeRubberNormal(size = 256): THREE.CanvasTexture {
  const h = new Float32Array(size * size)
  // two octaves of wrapped value noise
  const octave = (cell: number, amp: number) => {
    const g = Math.ceil(size / cell)
    const grid = Array.from({ length: g * g }, () => Math.random())
    for (let y = 0; y < size; y++)
      for (let x = 0; x < size; x++) {
        const gx = x / cell, gy = y / cell
        const x0 = Math.floor(gx), y0 = Math.floor(gy)
        const fx = gx - x0, fy = gy - y0
        const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy)
        const at = (i: number, j: number) => grid[(j % g) * g + (i % g)]
        const v = at(x0, y0) * (1 - sx) * (1 - sy) + at(x0 + 1, y0) * sx * (1 - sy) + at(x0, y0 + 1) * (1 - sx) * sy + at(x0 + 1, y0 + 1) * sx * sy
        h[y * size + x] += v * amp
      }
  }
  octave(4, 0.6)
  octave(16, 0.4)

  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')!
  const img = ctx.createImageData(size, size)
  const H = (x: number, y: number) => h[((y + size) % size) * size + ((x + size) % size)]
  const strength = 2.2
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const dx = (H(x + 1, y) - H(x - 1, y)) * strength
      const dy = (H(x, y + 1) - H(x, y - 1)) * strength
      const len = Math.hypot(dx, dy, 1)
      const i = (y * size + x) * 4
      img.data[i] = ((-dx / len) * 0.5 + 0.5) * 255
      img.data[i + 1] = ((-dy / len) * 0.5 + 0.5) * 255
      img.data[i + 2] = ((1 / len) * 0.5 + 0.5) * 255
      img.data[i + 3] = 255
    }
  ctx.putImageData(img, 0, 0)
  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  return tex
}

/**
 * Cover print. u runs along the hose, v around it, so the text band is centred on
 * v = 0.25 which faces +Z (the default camera side). Canvas is ~square-pixel for
 * a 7 × 3.9 unit surface so the type is not stretched.
 */
export function makeMarkingTexture(text: string, aniso = 8): THREE.CanvasTexture {
  const W = 2048, H = 1024
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#17191d'
  ctx.fillRect(0, 0, W, H)
  const y = (1 - 0.25) * H
  ctx.textBaseline = 'middle'
  ctx.fillStyle = 'rgba(214,220,228,0.92)'
  let size = 64
  ctx.font = `600 ${size}px "Space Grotesk", "Helvetica Neue", Arial, sans-serif`
  const target = 880
  size = Math.min(80, (size * target) / ctx.measureText(text).width)
  ctx.font = `600 ${size}px "Space Grotesk", "Helvetica Neue", Arial, sans-serif`
  // v runs downward on the +Z face, so draw the text vertically mirrored to read upright on the hose
  ctx.save()
  ctx.translate(0, y)
  ctx.scale(1, -1)
  ;[90, 1130].forEach((x) => ctx.fillText(text, x, 0))
  ctx.restore()
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = aniso
  return tex
}

/** Soft elliptical contact shadow (alpha gradient). */
export function makeShadowTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 128
  const ctx = c.getContext('2d')!
  ctx.scale(1, 0.25)
  const g = ctx.createRadialGradient(256, 256, 0, 256, 256, 256)
  g.addColorStop(0, 'rgba(15,23,42,0.42)')
  g.addColorStop(0.5, 'rgba(15,23,42,0.16)')
  g.addColorStop(1, 'rgba(15,23,42,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 512, 512)
  return new THREE.CanvasTexture(c)
}
