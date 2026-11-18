'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Box, ChevronLeft, ChevronRight, Maximize2, Minimize2, Pause, Play, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react'
import type { Product } from '@/types'
import { useViewerGestures } from './useViewerGestures'
import { useFullscreen } from './useFullscreen'
import type { CustomStage } from '@/three/customModel'

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))
const tool = 'grid h-8 w-8 place-items-center rounded-sm border border-slate-300 bg-white/80 text-slate-700 transition-colors hover:border-brand-blue hover:text-brand-blue'
const ANGLES = [
  { key: 'front', label: 'Front' },
  { key: 'side', label: 'Side' },
  { key: 'top', label: 'Top' },
] as const

type Status = 'loading' | 'ready' | 'error'

/**
 * Product-page viewer for products the client supplies themselves:
 *  - views: the three photos, dragged between Front / Side / Top
 *  - glb:   an uploaded 3D file
 *  - carve: a 3D shape built in the browser from the three photos
 */
export function CustomViewer({ product }: { product: Product }) {
  const mode = product.viewerMode === 'glb' ? 'glb' : product.viewerMode === 'carve' ? 'carve' : product.viewerMode === 'gallery' ? 'gallery' : 'views'
  const wrapRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { full, toggle: toggleFull } = useFullscreen(wrapRef)
  const [status, setStatus] = useState<Status>(mode === 'views' || mode === 'gallery' ? 'ready' : 'loading')
  const [message, setMessage] = useState('')
  const [stage, setStage] = useState<CustomStage | null>(null)
  const [spin, setSpin] = useState(false)
  const [wire, setWire] = useState(false)
  // photo mode: 0 = front, 1 = side, 2 = top, in between = crossfade
  const [t, setT] = useState(0)
  const [photoZoom, setPhotoZoom] = useState(1)

  const v = product.views ?? {}
  const photos = [v.front, v.side, v.top]
  const hasPhotos = photos.some(Boolean)
  const shots = (product.gallery ?? []).filter((g) => g.kind === 'product')
  const [shot, setShot] = useState(0)
  const flat = mode === 'views' || mode === 'gallery'

  // 3D modes: build the stage, then load the model into it
  useEffect(() => {
    if (flat) return
    const canvas = canvasRef.current
    if (!canvas) return
    let cancelled = false
    let created: CustomStage | null = null
    ;(async () => {
      try {
        const m = await import('@/three/customModel')
        if (cancelled) return
        if (!m.CustomStage.supported()) throw new Error('3D is not supported on this device.')
        let object
        if (mode === 'glb') {
          if (!product.modelUrl) throw new Error('No 3D file has been uploaded for this product.')
          object = await m.loadGlb(product.modelUrl)
        } else {
          if (!v.front || !v.side) throw new Error('Upload the front and side photos to build the 3D shape.')
          object = await m.carveFromViews({ front: v.front, side: v.side, top: v.top })
        }
        if (cancelled) return
        created = new m.CustomStage(canvas)
        created.setObject(object)
        created.autoRotate = false
        setStage(created)
        setStatus('ready')
      } catch (err) {
        console.error('Custom 3D failed', err)
        if (!cancelled) {
          setMessage(err instanceof Error ? err.message : 'The 3D view could not be built.')
          setStatus('error')
        }
      }
    })()
    return () => {
      cancelled = true
      created?.dispose()
      setStage(null)
    }
  }, [mode, product.id, product.modelUrl, v.front, v.side, v.top])

  useViewerGestures(stageRef, {
    rotate(dx, dy) {
      if (mode === 'gallery') return
      if (mode === 'views') return setT((p) => clamp(p - dx * 0.008, 0, 2))
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
      if (flat) return setPhotoZoom((z) => clamp(z * f, 1, 3.5))
      if (!stage) return
      stage.state.zoom = clamp(stage.state.zoom * f, 0.5, 4)
      stage.invalidate()
    },
  })

  const zoomBy = (f: number) => {
    if (flat) setPhotoZoom((z) => clamp(z * f, 1, 3.5))
    else if (stage) {
      stage.state.zoom = clamp(stage.state.zoom * f, 0.5, 4)
      stage.invalidate()
    }
  }
  const reset = () => {
    setT(0)
    setShot(0)
    setPhotoZoom(1)
    if (stage) {
      Object.assign(stage.state, { rotY: -0.5, rotX: 0.25, zoom: 1, panX: 0, panY: 0 })
      stage.invalidate()
    }
  }
  const toggleSpin = () => {
    setSpin(!spin)
    if (stage) stage.autoRotate = !spin
  }
  const toggleWire = () => {
    setWire(!wire)
    stage?.setWireframe(!wire)
  }

  const hint =
    mode === 'gallery'
      ? 'Pick a photo below · click, then scroll to zoom.'
      : mode === 'views'
      ? 'Drag to turn between views · scroll after clicking to zoom.'
      : 'Drag to rotate · Shift+drag to move · click, then scroll to zoom.'

  return (
    <div ref={wrapRef} className={full ? 'fixed inset-0 z-[100] flex flex-col overflow-hidden bg-white' : 'overflow-hidden rounded-md border border-slate-200 bg-white'}>
      <div ref={stageRef} className={`relative touch-pan-y select-none ${full ? 'min-h-0 flex-1' : 'h-[360px] sm:h-[500px]'}`} style={{ background: 'var(--stage-bg)' }}>
        <div className="pointer-events-none absolute inset-0 bg-blueprint-grid opacity-50" />

        {mode === 'gallery' ? (
          shots.length > 0 ? (
            <>
              <div className="absolute inset-0 overflow-hidden" style={{ transform: `scale(${photoZoom})`, transition: 'transform 0.15s' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={shots[shot]?.url} alt={shots[shot]?.caption ?? `${product.name} — photo ${shot + 1}`} draggable={false} className="absolute inset-0 h-full w-full object-contain p-6 pb-20" />
              </div>
              <div data-viewer-ui className="absolute inset-x-0 bottom-8 flex justify-center gap-2 px-3">
                {shots.map((g, i) => (
                  <button key={g.url} onClick={() => setShot(i)} aria-label={`Photo ${i + 1}`} aria-pressed={i === shot}
                    className={`h-12 w-16 overflow-hidden rounded-sm border-2 bg-white ${i === shot ? 'border-brand-blue' : 'border-transparent opacity-70 hover:opacity-100'}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={g.url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
              {shots.length > 1 && (
                <div data-viewer-ui>
                  <button onClick={() => setShot((shot + shots.length - 1) % shots.length)} aria-label="Previous photo" className={`${tool} absolute left-3 top-1/2 -translate-y-1/2`}><ChevronLeft size={16} /></button>
                  <button onClick={() => setShot((shot + 1) % shots.length)} aria-label="Next photo" className={`${tool} absolute right-14 top-1/2 -translate-y-1/2`}><ChevronRight size={16} /></button>
                </div>
              )}
            </>
          ) : (
            <div className="absolute inset-0 grid place-items-center text-sm text-slate-500">No photos added for this product yet.</div>
          )
        ) : mode === 'views' ? (
          hasPhotos ? (
            <div className="absolute inset-0 cursor-grab overflow-hidden active:cursor-grabbing" style={{ transform: `scale(${photoZoom})`, transition: 'transform 0.15s' }}>
              {photos.map((src, i) =>
                src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={src} alt={`${product.name} — ${ANGLES[i].label.toLowerCase()} view`} draggable={false}
                    className="absolute inset-0 h-full w-full object-contain p-8" style={{ opacity: Math.max(0, 1 - Math.abs(t - i)) }} />
                ) : null,
              )}
            </div>
          ) : (
            <div className="absolute inset-0 grid place-items-center text-sm text-slate-500">No photos uploaded for this product yet.</div>
          )
        ) : (
          <>
            <canvas ref={canvasRef} role="img" aria-label={`Interactive 3D view of ${product.name}`}
              className={`absolute inset-0 h-full w-full cursor-grab touch-pan-y transition-opacity duration-500 active:cursor-grabbing ${status === 'ready' ? 'opacity-100' : 'opacity-0'}`} />
            {status === 'loading' && <div className="absolute inset-0 grid place-items-center font-mono text-xs text-slate-500">Building 3D model…</div>}
            {status === 'error' && (
              <div className="absolute inset-0 grid place-items-center p-6 text-center text-sm text-slate-600">
                {message}
                {product.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.image} alt={product.name} className="mt-4 max-h-56 object-contain" />
                )}
              </div>
            )}
          </>
        )}

        {status === 'ready' && (
          <>
            {mode === 'views' && hasPhotos && (
              <div data-viewer-ui role="group" aria-label="View angle" className="absolute left-3 top-3 flex overflow-hidden rounded-sm border border-slate-300 bg-white/80">
                {ANGLES.map((a, i) => (
                  <button key={a.key} onClick={() => setT(i)} disabled={!photos[i]} aria-pressed={Math.round(t) === i}
                    className={`px-2.5 py-1.5 text-[11px] font-semibold transition-colors disabled:opacity-40 ${Math.round(t) === i ? 'bg-brand-blue text-white' : 'text-slate-700 hover:text-brand-blue'}`}>
                    {a.label}
                  </button>
                ))}
              </div>
            )}
            <div data-viewer-ui className="absolute right-3 top-3 flex flex-col gap-1.5">
              <button onClick={() => zoomBy(1.25)} className={tool} aria-label="Zoom in"><ZoomIn size={15} /></button>
              <button onClick={() => zoomBy(1 / 1.25)} className={tool} aria-label="Zoom out"><ZoomOut size={15} /></button>
              {!flat && (
                <>
                  <button onClick={toggleWire} aria-pressed={wire} aria-label="Wireframe view" title="Wireframe"
                    className={wire ? 'grid h-8 w-8 place-items-center rounded-sm border border-brand-blue bg-brand-blue text-white' : tool}><Box size={15} /></button>
                  <button onClick={toggleSpin} aria-pressed={spin} aria-label={spin ? 'Stop turning' : 'Turn automatically'} title="Auto-rotate" className={tool}>
                    {spin ? <Pause size={15} /> : <Play size={15} />}
                  </button>
                </>
              )}
              <button onClick={reset} className={tool} aria-label="Reset view"><RotateCcw size={15} /></button>
              <button onClick={toggleFull} aria-pressed={full} aria-label={full ? 'Exit full screen' : 'Full screen'} className={tool}>
                {full ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
              </button>
            </div>
          </>
        )}

        <p className="pointer-events-none absolute bottom-2 right-3 max-w-[calc(100%-1.5rem)] text-right font-mono text-[10px] text-slate-400">
          {mode === 'carve' ? `Illustrative 3D shape built from photos. ${hint}` : hint}
        </p>
      </div>
    </div>
  )
}
