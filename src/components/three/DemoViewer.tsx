'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Pause, Play, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react'
import { useDemoStage } from './useStage'

interface Props {
  slug: string
  name: string
  /** tailwind height classes for the viewport */
  heightClass?: string
}

const REST = { rotY: -0.55, rotX: 0.32, zoom: 1 }

/**
 * Plays the part's "action" (a pad compressing, a coupling connecting…).
 * Autoplay loops while the viewer is on screen; the slider scrubs it by hand.
 * Everything on the model is driven by one number: stage.state.action.
 */
export function DemoViewer({ slug, name, heightClass = 'h-[360px] sm:h-[460px]' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const { stage, status } = useDemoStage(canvasRef, slug)
  const [playing, setPlaying] = useState(false)
  const [action, setAction] = useState(0)
  const [caption, setCaption] = useState<{ title: string; caption: string } | null>(null)
  const [onScreen, setOnScreen] = useState(true)
  const drag = useRef<{ x: number; y: number } | null>(null)

  // autoplay is off for reduced-motion users; they can still scrub
  useEffect(() => {
    setPlaying(!window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  useEffect(() => {
    if (!stage) return
    setCaption(stage.model.action)
    stage.state.action = 0
    setAction(0)
    stage.invalidate()
  }, [stage, slug])

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting))
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // time-based ping-pong, only while visible and playing
  useEffect(() => {
    if (!stage || !playing || !onScreen) return
    let raf = 0
    const start = performance.now() - action * 2600 // continue from the scrubbed position
    const tick = (now: number) => {
      const phase = ((now - start) / 5200) % 1
      const p = (1 - Math.cos(phase * Math.PI * 2)) / 2
      stage.state.action = p
      stage.invalidate()
      setAction(p)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // `action` is read once on (re)start only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, playing, onScreen])

  const scrub = useCallback(
    (v: number) => {
      setPlaying(false)
      setAction(v)
      if (stage) {
        stage.state.action = v
        stage.invalidate()
      }
    },
    [stage],
  )

  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { x: e.clientX, y: e.clientY }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current || !stage) return
    stage.state.rotY += (e.clientX - drag.current.x) * 0.008
    stage.state.rotX = Math.max(-0.9, Math.min(0.9, stage.state.rotX + (e.clientY - drag.current.y) * 0.006))
    drag.current = { x: e.clientX, y: e.clientY }
    stage.invalidate()
  }
  const zoom = (f: number) => {
    if (!stage) return
    stage.state.zoom = Math.max(0.55, Math.min(1.6, stage.state.zoom * f))
    stage.invalidate()
  }
  const reset = () => {
    if (!stage) return
    Object.assign(stage.state, REST)
    stage.invalidate()
  }

  const failed = status === 'unsupported' || status === 'lost'

  return (
    <div ref={wrapRef} className="overflow-hidden rounded-md border border-slate-200 bg-white">
      <div
        className={`relative ${heightClass} touch-pan-y select-none`}
        style={{ background: 'radial-gradient(ellipse at 50% 45%, #ffffff 0%, #f4f7fb 55%, #e1e8f1 100%)' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={() => (drag.current = null)}
        onPointerCancel={() => (drag.current = null)}
      >
        <div className="pointer-events-none absolute inset-0 bg-blueprint-grid opacity-50" />
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={`Interactive 3D illustration of ${name}`}
          className={`absolute inset-0 h-full w-full cursor-grab touch-pan-y transition-opacity duration-500 active:cursor-grabbing ${status === 'ready' ? 'opacity-100' : 'opacity-0'}`}
        />
        {status === 'loading' && <div className="absolute inset-0 grid place-items-center font-mono text-xs text-slate-500">Loading 3D model…</div>}
        {failed && (
          <div className="absolute inset-0 grid place-items-center p-6 text-center text-sm text-slate-600">
            The 3D preview is not available on this device. Product information is below.
          </div>
        )}
        {status === 'ready' && caption && (
          <div className="pointer-events-none absolute left-4 top-4 max-w-[17rem] sm:left-5 sm:top-5">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-brand-blue">In action</p>
            <p className="mt-1 text-sm font-bold text-slate-900">{caption.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">{caption.caption}</p>
          </div>
        )}
        <p className="pointer-events-none absolute bottom-2 right-3 font-mono text-[10px] text-slate-400">Illustrative model — not to scale. Drawings on request.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 bg-slate-50 px-3 py-2.5">
        <button onClick={() => setPlaying((v) => !v)} disabled={status !== 'ready'} className="btn btn-secondary btn-sm" aria-pressed={playing}>
          {playing ? <Pause size={14} /> : <Play size={14} />}
          {playing ? 'Pause' : 'Play'}
        </button>
        <label className="flex min-w-[10rem] flex-1 items-center gap-2 text-xs font-semibold text-slate-600">
          Action
          <input
            type="range"
            min={0}
            max={1}
            step={0.005}
            value={action}
            onChange={(e) => scrub(parseFloat(e.target.value))}
            disabled={status !== 'ready'}
            aria-label="Scrub the action"
            className="w-full accent-brand-blue"
          />
        </label>
        <div className="flex gap-1">
          <button onClick={() => zoom(0.85)} className="btn btn-secondary btn-sm" aria-label="Zoom in"><ZoomIn size={14} /></button>
          <button onClick={() => zoom(1.18)} className="btn btn-secondary btn-sm" aria-label="Zoom out"><ZoomOut size={14} /></button>
          <button onClick={reset} className="btn btn-secondary btn-sm" aria-label="Reset view"><RotateCcw size={14} /></button>
        </div>
      </div>
    </div>
  )
}
