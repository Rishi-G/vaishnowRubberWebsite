/**
 * Named camera shots for the hero story. Plain data — no three.js import — so the
 * hero component can use it without pulling three into the main bundle.
 *
 * focusX: where along the hose the camera looks (−3.5 … +3.5)
 * off*:   camera offset from that point (hose units)
 */
export interface Shot {
  focusX: number
  lookY: number
  offX: number
  offY: number
  offZ: number
  rotY: number
  rotX: number
  peel: number
  bend: number
  fit: number
}

export const SHOTS = {
  /** the finished hose, three-quarter view, curvature visible */
  establish: { focusX: -1.9, lookY: 0.9, offX: -1.4, offY: 1.1, offZ: 16.5, rotY: -0.32, rotX: 0.06, peel: 0, bend: 1, fit: 1 },
  /** cover surface and print, close */
  macro: { focusX: 0.9, lookY: 0, offX: 0.6, offY: 0.55, offZ: 5.4, rotY: -0.14, rotX: 0.04, peel: 0, bend: 1, fit: 0.5 },
  /** crimped fitting, close */
  fitting: { focusX: -4.2, lookY: 0, offX: -1.7, offY: 0.9, offZ: 5.8, rotY: -0.38, rotX: 0.1, peel: 0, bend: 1, fit: 0.5 },
  /** layers retracted in steps, fitting withdrawn */
  peel: { focusX: 2.4, lookY: 0.2, offX: -1.2, offY: 1.1, offZ: 10.5, rotY: -0.3, rotX: 0.08, peel: 1, bend: 0.7, fit: 0.9 },
  /** reassembled, slightly tighter bend — hand-off to the next section */
  whole: { focusX: -1.2, lookY: -0.9, offX: 0.5, offY: 0.9, offZ: 14, rotY: 0.3, rotX: 0.05, peel: 0, bend: 1.2, fit: 1 },
} satisfies Record<string, Shot>
