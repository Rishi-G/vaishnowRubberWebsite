'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Box, ChevronLeft, ChevronRight, Maximize2, Minimize2, Pause, Play, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react'
import type { Product } from '@/types'
import { useViewerGestures } from './useViewerGestures'
import { useFullscreen } from './useFullscreen'
import type { CustomStage } from '@/three/customModel'

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))
const tool = 'grid h-8 w-8 place-items-center rounded-sm border border-slate-300 bg-white/80 text-slate-700 transition-colors hover:border-brand-blue hover:text-brand-blue'
const toolOn = 'grid h-8 w-8 place-items-center rounded-sm border border-brand-blue bg-brand-blue text-white'
const shell = (full: boolean) => (full ? 'fixed inset-0 z-[100] flex flex-col overflow-hidden bg-white' : 'overflow-hidden rounded-md border border-slate-200 bg-white')
const stageClass = (full: boolean) => `relative touch-pan-y select-none ${full ? 'min-h-0 flex-1' : 'h-[360px] sm:h-[500px]'}`

/**
 * Viewer for a 3D file the client uploaded to Storage (.zip holding a .glb / .gltf / .obj, or the
 * bare file): orbit, pan, zoom, wireframe, auto-rotate, full screen.
 */
export function ModelViewer({ product }: { product: Product }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { full, toggle: toggleFull } = useFullscreen(wrapRef)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [stage, setStage] = useState<CustomStage | null>(null)
  const [spin, setSpin] = useState(false)
  const [wire, setWire] = useState(false)
  const url = product.modelUrl

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !url) return
    let cancelled = false
    let created: CustomStage | null = null
    ;(async () => {
      try {
        const m = await import('@/three/customModel')
        if (cancelled) return
        if (!m.CustomStage.supported()) throw new Error('3D is not supported on this device.')
        const object = await m.loadModel(url)
        if (cancelled) return
        created = new m.CustomStage(canvas)
        created.setObject(object)
        setStage(created)
        setStatus('ready')
      } catch (err) {
        console.error('3D model failed', err)
        if (!cancelled) {
          setMessage(err instanceof Error ? err.message : 'The 3D model could not be shown.')
          setStatus('error')
        }
      }
    })()
    return () => {
      cancelled = true
      created?.dispose()
      setStage(null)
    }
  }, [url])

  useViewerGestures(stageRef, {
    rotate(dx, dy) {
      if (!stage) return
      stage.state.rotY += dx * 0.008
      stage.state.rotX = clamp(stage.state.rotX + dy * 0.005, -1.4, 1.4)
      stage.invalidate()
    },
    pan(dx, dy) {
      if (!stage) return
      const k = 0.014 / stage.state.zoom
      stage.state.panX = clamp(stage.state.panX - dx * k, -3, 3)
      stage.state.panY = clamp(stage.state.panY + dy * k, -3, 3)
      stage.invalidate()
    },
    zoom(f) {
      if (!stage) return
      stage.state.zoom = clamp(stage.state.zoom * f, 0.5, 4)
      stage.invalidate()
    },
  })

  const zoomBy = (f: number) => {
    if (!stage) return
    stage.state.zoom = clamp(stage.state.zoom * f, 0.5, 4)
    stage.invalidate()
  }
  const reset = () => {
    if (!stage) return
    Object.assign(stage.state, { rotY: -0.5, rotX: 0.25, zoom: 1, panX: 0, panY: 0 })
    stage.invalidate()
  }

  return (
    <div ref={wrapRef} className={shell(full)}>
      <div ref={stageRef} className={stageClass(full)} style={{ background: 'var(--stage-bg)' }}>
        <div className="pointer-events-none absolute inset-0 bg-blueprint-grid opacity-50" />
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={`Interactive 3D model of ${product.name}`}
          className={`absolute inset-0 h-full w-full cursor-grab touch-pan-y transition-opacity duration-500 active:cursor-grabbing ${status === 'ready' ? 'opacity-100' : 'opacity-0'}`}
        />
        {status === 'loading' && <div className="absolute inset-0 grid place-items-center font-mono text-xs text-slate-500">Loading 3D model…</div>}
        {status === 'error' && <div className="absolute inset-0 grid place-items-center p-6 text-center text-sm text-slate-600">{message}</div>}

        {status === 'ready' && (
          <div data-viewer-ui className="absolute right-3 top-3 flex flex-col gap-1.5">
            <button onClick={() => zoomBy(1.25)} className={tool} aria-label="Zoom in"><ZoomIn size={15} /></button>
            <button onClick={() => zoomBy(1 / 1.25)} className={tool} aria-label="Zoom out"><ZoomOut size={15} /></button>
            <button onClick={() => { setWire(!wire); stage?.setWireframe(!wire) }} aria-pressed={wire} aria-label="Wireframe view" title="Wireframe" className={wire ? toolOn : tool}><Box size={15} /></button>
            <button onClick={() => { setSpin(!spin); if (stage) stage.autoRotate = !spin }} aria-pressed={spin} aria-label={spin ? 'Stop turning' : 'Turn automatically'} title="Auto-rotate" className={tool}>
              {spin ? <Pause size={15} /> : <Play size={15} />}
            </button>
            <button onClick={reset} className={tool} aria-label="Reset view"><RotateCcw size={15} /></button>
            <button onClick={toggleFull} aria-pressed={full} aria-label={full ? 'Exit full screen' : 'Full screen'} className={tool}>
              {full ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>
          </div>
        )}
        <p className="pointer-events-none absolute bottom-2 right-3 max-w-[calc(100%-1.5rem)] text-right font-mono text-[10px] text-slate-400">
          Drag to rotate · Shift+drag to move · click, then scroll to zoom.
        </p>
      </div>
    </div>
  )
}

/** Image slideshow for the product's gallery (up to 6 pictures): autoplay, arrows, thumbnails, zoom, full screen. */
export function SlideshowViewer({ product }: { product: Product }) {
  const shots = product.gallery ?? []
  const wrapRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const { full, toggle: toggleFull } = useFullscreen(wrapRef)
  const [i, setI] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [zoom, setZoom] = useState(1)
  const n = shots.length

  // autoplay starts on, except for visitors who asked for reduced motion
  useEffect(() => {
    setPlaying(n > 1 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [n])
  useEffect(() => {
    if (!playing || n < 2 || zoom > 1) return
    const id = setInterval(() => setI((p) => (p + 1) % n), 4000)
    return () => clearInterval(id)
  }, [playing, n, zoom])

  const go = (d: number) => {
    setI((p) => (p + d + n) % n)
    setZoom(1)
  }
  useViewerGestures(stageRef, {
    rotate() {},
    zoom(f) {
      setZoom((z) => clamp(z * f, 1, 3.5))
    },
  })

  if (n === 0) return <div className="grid h-40 place-items-center rounded-md border border-slate-200 bg-slate-50 text-sm text-slate-500">No pictures added for this product yet.</div>

  return (
    <div ref={wrapRef} className={shell(full)}>
      <div ref={stageRef} className={stageClass(full)} style={{ background: 'var(--stage-bg)' }}>
        <div className="pointer-events-none absolute inset-0 bg-blueprint-grid opacity-50" />
        <div className="absolute inset-0 overflow-hidden" style={{ transform: `scale(${zoom})`, transition: 'transform 0.15s' }}>
          {shots.map((g, k) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={g.url} src={g.url} alt={g.caption ?? `${product.name} — picture ${k + 1}`} draggable={false} loading={k === 0 ? 'eager' : 'lazy'}
              className="absolute inset-0 h-full w-full object-contain p-6 pb-24 transition-opacity duration-500" style={{ opacity: k === i ? 1 : 0 }} />
          ))}
        </div>
        {shots[i]?.caption && <p className="pointer-events-none absolute inset-x-0 bottom-24 text-center text-xs font-semibold text-slate-600">{shots[i].caption}</p>}

        <div data-viewer-ui className="absolute inset-x-0 bottom-7 flex justify-center gap-2 px-3">
          {shots.map((g, k) => (
            <button key={g.url} onClick={() => { setI(k); setZoom(1) }} aria-label={`Picture ${k + 1} of ${n}`} aria-pressed={k === i}
              className={`h-12 w-16 overflow-hidden rounded-sm border-2 bg-white ${k === i ? 'border-brand-blue' : 'border-transparent opacity-70 hover:opacity-100'}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={g.url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
        {n > 1 && (
          <div data-viewer-ui>
            <button onClick={() => go(-1)} aria-label="Previous picture" className={`${tool} absolute left-3 top-1/2 -translate-y-1/2`}><ChevronLeft size={16} /></button>
            <button onClick={() => go(1)} aria-label="Next picture" className={`${tool} absolute right-14 top-1/2 -translate-y-1/2`}><ChevronRight size={16} /></button>
          </div>
        )}
        <div data-viewer-ui className="absolute right-3 top-3 flex flex-col gap-1.5">
          <button onClick={() => setZoom((z) => clamp(z * 1.25, 1, 3.5))} className={tool} aria-label="Zoom in"><ZoomIn size={15} /></button>
          <button onClick={() => setZoom((z) => clamp(z / 1.25, 1, 3.5))} className={tool} aria-label="Zoom out"><ZoomOut size={15} /></button>
          {n > 1 && (
            <button onClick={() => setPlaying(!playing)} aria-pressed={playing} aria-label={playing ? 'Pause slideshow' : 'Play slideshow'} className={tool}>
              {playing ? <Pause size={15} /> : <Play size={15} />}
            </button>
          )}
          <button onClick={toggleFull} aria-pressed={full} aria-label={full ? 'Exit full screen' : 'Full screen'} className={tool}>
            {full ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>
      </div>
    </div>
  )
}
