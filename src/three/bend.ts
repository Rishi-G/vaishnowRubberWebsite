import * as THREE from 'three'

/**
 * Bending lives in the vertex shader so the hose can be modelled on a straight
 * axis (which makes layer peel-back exact) yet rendered as a curved arc.
 *
 * Every mesh must keep an IDENTITY transform: the shader reads `position.x`
 * as the distance along the hose axis. Offsets are baked into geometry or
 * passed through the `uSlide` uniform.
 */
export interface Uniform1 {
  value: number
}
export interface BendShared {
  uBend: Uniform1 // 1 / bend radius (0 = straight)
}

export interface BendOwn {
  /** fragments beyond this axis position are discarded (layer peel-back) */
  uEnd?: Uniform1
  /** added to the axis position before bending (sliding parts) */
  uSlide?: Uniform1
}

export function patchBend(mat: THREE.Material, shared: BendShared, own: BendOwn = {}) {
  const uEnd = own.uEnd ?? { value: 1e5 }
  const uSlide = own.uSlide ?? { value: 0 }
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uBend = shared.uBend
    shader.uniforms.uEnd = uEnd
    shader.uniforms.uSlide = uSlide
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uBend;\nuniform float uSlide;\nvarying float vLocalX;')
      .replace(
        '#include <beginnormal_vertex>',
        `#include <beginnormal_vertex>
        { float ba = (position.x + uSlide) * uBend; float bc = cos(ba); float bs = sin(ba);
          objectNormal = vec3(objectNormal.x*bc + objectNormal.y*bs, -objectNormal.x*bs + objectNormal.y*bc, objectNormal.z); }`,
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        vLocalX = position.x;
        { float bx = position.x + uSlide;
          if (abs(uBend) > 1e-4) { float R = 1.0 / uBend; float a = bx * uBend; float rr = R + position.y;
            transformed = vec3(rr * sin(a), rr * cos(a) - R, position.z); }
          else { transformed = vec3(bx, position.y, position.z); } }`,
      )
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform float uEnd;\nvarying float vLocalX;')
      .replace('#include <clipping_planes_fragment>', '#include <clipping_planes_fragment>\nif (vLocalX > uEnd) discard;')
  }
  mat.customProgramCacheKey = () => 'vaishno-bend-v1'
}

/** CPU mirror of the vertex shader, used for camera targets and label projection. */
export function bendPoint(x: number, y: number, z: number, bend: number, out = new THREE.Vector3()) {
  if (Math.abs(bend) > 1e-4) {
    const R = 1 / bend
    const a = x * bend
    const rr = R + y
    return out.set(rr * Math.sin(a), rr * Math.cos(a) - R, z)
  }
  return out.set(x, y, z)
}
