'use client'

import { useEffect, useRef, type RefObject } from 'react'

export interface ViewerGestures {
  /** one-finger / left-button drag, in CSS pixels since the last event */
  rotate(dx: number, dy: number): void
  /** factor > 1 zooms in, < 1 zooms out */
  zoom(factor: number): void
  /** Shift+drag or right-button drag; omit when the viewer cannot pan */
  pan?(dx: number, dy: number): void
}

/**
 * Pointer and wheel handling shared by the product viewers.
 *
 * - drag rotates, Shift+drag (or right-drag) pans, two fingers pinch-zoom
 * - the wheel zooms only once the visitor has pressed inside the viewer (or holds Ctrl, which is
 *   also what a trackpad pinch sends), so scrolling the page past the viewer is never hijacked
 * - presses on overlay controls (anything inside [data-viewer-ui]) are left alone
 */
export function useViewerGestures(ref: RefObject<HTMLElement | null>, gestures: ViewerGestures) {
  // the listeners are attached once; they always call the handlers from the latest render
  const latest = useRef(gestures)
  useEffect(() => {
    latest.current = gestures
  })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const pointers = new Map<number, { x: number; y: number }>()
    let engaged = false
    let panning = false
    let pinch = 0

    const spread = () => {
      const [a, b] = [...pointers.values()]
      return Math.hypot(a.x - b.x, a.y - b.y)
    }
    const onUi = (e: Event) => (e.target as HTMLElement).closest?.('[data-viewer-ui]')

    const down = (e: PointerEvent) => {
      if (onUi(e)) return
      engaged = true
      panning = !!latest.current.pan && (e.shiftKey || e.button === 2)
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
      el.setPointerCapture(e.pointerId)
      if (pointers.size === 2) pinch = spread()
    }
    const move = (e: PointerEvent) => {
      const prev = pointers.get(e.pointerId)
      if (!prev) return
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
      if (pointers.size === 2) {
        const now = spread()
        if (pinch > 0 && now > 0) latest.current.zoom(now / pinch)
        pinch = now
        return
      }
      const dx = e.clientX - prev.x
      const dy = e.clientY - prev.y
      if (panning) latest.current.pan?.(dx, dy)
      else latest.current.rotate(dx, dy)
    }
    const up = (e: PointerEvent) => {
      pointers.delete(e.pointerId)
      pinch = 0
    }
    const leave = () => {
      if (pointers.size === 0) engaged = false
    }
    const wheel = (e: WheelEvent) => {
      if (!engaged && !e.ctrlKey) return
      e.preventDefault()
      latest.current.zoom(Math.exp(-e.deltaY * 0.0015))
    }
    const menu = (e: Event) => {
      if (latest.current.pan && !onUi(e)) e.preventDefault()
    }

    el.addEventListener('pointerdown', down)
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', up)
    el.addEventListener('pointercancel', up)
    el.addEventListener('pointerleave', leave)
    el.addEventListener('wheel', wheel, { passive: false })
    el.addEventListener('contextmenu', menu)
    return () => {
      el.removeEventListener('pointerdown', down)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', up)
      el.removeEventListener('pointercancel', up)
      el.removeEventListener('pointerleave', leave)
      el.removeEventListener('wheel', wheel)
      el.removeEventListener('contextmenu', menu)
    }
  }, [ref])
}
