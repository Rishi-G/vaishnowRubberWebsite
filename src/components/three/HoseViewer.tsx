'use client'

import React, { useMemo, useRef, useState } from 'react'
import { Box, Maximize2, Minimize2, RotateCcw, Sun, ZoomIn, ZoomOut } from 'lucide-react'
import type { Product } from '@/types'
import { specFromProduct } from '@/three/spec'
import { SHOTS } from '@/three/shots'
import { useHoseStage } from './useStage'
import { useViewerGestures } from './useViewerGestures'
import { useFullscreen } from './useFullscreen'

const VIEW = { ...SHOTS.establish, focusX: 0, lookY: 0, offZ: 11.5, offY: 0.8, rotY: -0.38, fit: 1, zoom: 1 }

/** Camera angles offered as buttons; the hose turns, the camera stays put. */
const ANGLES = [
  { id: 'iso', label: '3/4', rotY: VIEW.rotY, rotX: VIEW.rotX },
  { id: 'side', label: 'Side', rotY: 0, rotX: 0 },
  { id: 'end', label: 'End', rotY: Math.PI / 2 - 0.12, rotX: 0.04 },
  { id: 'top', label: 'Top', rotY: 0, rotX: 1.35 },
]

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))
const tool = 'grid h-8 w-8 place-items-center rounded-sm border border-slate-300 bg-white/80 text-slate-700 transition-colors hover:border-brand-blue hover:text-brand-blue disabled:opacity-40'

/**
 * Product-page viewer: drag to rotate, Shift+drag to pan, scroll or pinch to zoom, peel the layers
 * back, flex the hose, switch to wireframe, and click a layer to see it on its own.
 */
export function HoseViewer({ product }: { product: Product }) {
  const spec = useMemo(() => specFromProduct(product), [product])
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const { full, toggle: toggleFull } = useFullscreen(wrapRef)
  const { stage, status } = useHoseStage(canvasRef, spec)
  const [peel, setPeel] = useState(0)
  const [bend, setBend] = useState(1)
  const [active, setActive] = useState<string | null>(null)
  const [isolated, setIsolated] = useState<string | null>(null)
  const [wire, setWire] = useState(false)
  const [angle, setAngle] = useState('iso')
  const [real, setReal] = useState(false)

  const apply = (patch: Partial<typeof VIEW>) => {
    if (!stage) return
    Object.assign(stage.state, patch)
    stage.invalidate()
  }

  // first paint of the product shot; realistic lighting starts on where the GPU can afford it
  React.useEffect(() => {
    if (!stage) return
    Object.assign(stage.state, VIEW)
    stage.setRealistic(stage.highQuality)
    setReal(stage.highQuality)
  }, [stage])

  const lighting = (on: boolean) => {
    setReal(on)
    stage?.setRealistic(on)
  }

  useViewerGestures(stageRef, {
    rotate(dx, dy) {
      if (!stage) return
      setAngle('')
      apply({ rotY: stage.state.rotY + dx * 0.008, rotX: clamp(stage.state.rotX + dy * 0.005, -1.4, 1.4) })
    },
    pan(dx, dy) {
      if (!stage) return
      // slower when zoomed in, so the model follows the pointer at any zoom
      const k = 0.014 / stage.state.zoom
      apply({ focusX: clamp(stage.state.focusX - dx * k, -4.5, 4.5), lookY: clamp(stage.state.lookY + dy * k, -2.5, 2.5) })
    },
    zoom(f) {
      if (stage) apply({ zoom: clamp(stage.state.zoom * f, 0.6, 3.2) })
    },
  })

  const highlight = (id: string | null) => {
    setActive(id)
    if (stage) {
      stage.model.setHighlight(id)
      stage.invalidate()
    }
  }

  const isolate = (id: string | null) => {
    setIsolated(id)
    if (stage) {
      stage.model.setIsolate(id)
      stage.invalidate()
    }
  }

  const wireframe = (on: boolean) => {
    setWire(on)
    if (stage) {
      stage.model.setWireframe(on)
      stage.invalidate()
    }
  }

  const reset = () => {
    setPeel(0)
    setBend(1)
    setAngle('iso')
    highlight(null)
    isolate(null)
    wireframe(false)
    apply(VIEW)
  }

  const ready = status === 'ready'
  const failed = status === 'unsupported' || status === 'lost'

  const layerButton = (id: string, n: number, label: string, detail?: string) => {
    const on = isolated === id
    return (
      <li key={id}>
        <button
          onMouseEnter={() => highlight(id)}
          onMouseLeave={() => highlight(null)}
          onFocus={() => highlight(id)}
          onBlur={() => highlight(null)}
          onClick={() => isolate(on ? null : id)}
          aria-pressed={on}
          className={`w-full rounded-sm border px-3 py-2 text-left transition-colors ${on ? 'border-brand-blue bg-blue-50' : active === id ? 'border-slate-300 bg-slate-50' : 'border-transparent hover:bg-slate-50'}`}
        >
          <span className="font-mono text-[10px] text-slate-400">{String(n).padStart(2, '0')}</span>{' '}
          <span className="text-sm font-semibold text-slate-900">{label}</span>
          {on && <span className="ml-2 font-mono text-[10px] font-bold uppercase tracking-wider text-brand-blue">shown alone</span>}
          {detail && <span className="mt-0.5 block text-xs leading-snug text-slate-600">{detail}</span>}
        </button>
      </li>
    )
  }

  return (
    <div
      ref={wrapRef}
      className={
        full
          ? 'fixed inset-0 z-[100] flex flex-col overflow-hidden bg-white lg:grid lg:grid-cols-[1fr_22rem] lg:grid-rows-1'
          : 'grid overflow-hidden rounded-md border border-slate-200 bg-white lg:grid-cols-[1fr_20rem]'
      }
    >
      <div className={full ? 'flex min-h-0 flex-1 flex-col' : ''}>
        <div ref={stageRef} className={`relative touch-pan-y select-none ${full ? 'min-h-0 flex-1' : 'h-[340px] sm:h-[460px]'}`} style={{ background: 'var(--stage-bg)' }}>
          <div className="pointer-events-none absolute inset-0 bg-blueprint-grid opacity-50" />
          {(status === 'loading' || failed) && product.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.image} alt={product.name} className={`absolute inset-0 h-full w-full object-contain p-8 ${status === 'loading' ? 'opacity-40' : ''}`} />
          )}
          <canvas
            ref={canvasRef}
            role="img"
            aria-label={`Interactive 3D illustration of ${product.name}`}
            className={`absolute inset-0 h-full w-full cursor-grab touch-pan-y transition-opacity duration-500 active:cursor-grabbing ${ready ? 'opacity-100' : 'opacity-0'}`}
          />
          {status === 'loading' && <div className="absolute inset-0 grid place-items-center font-mono text-xs text-slate-500">Loading 3D model…</div>}

          {ready && (
            <>
              <div data-viewer-ui role="group" aria-label="View angle" className="absolute left-3 top-3 flex overflow-hidden rounded-sm border border-slate-300 bg-white/80">
                {ANGLES.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => { setAngle(a.id); apply({ rotY: a.rotY, rotX: a.rotX }) }}
                    aria-pressed={angle === a.id}
                    className={`px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${angle === a.id ? 'bg-brand-blue text-white' : 'text-slate-700 hover:text-brand-blue'}`}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
              <div data-viewer-ui className="absolute right-3 top-3 flex flex-col gap-1.5">
                <button onClick={() => apply({ zoom: clamp((stage?.state.zoom ?? 1) * 1.25, 0.6, 3.2) })} className={tool} aria-label="Zoom in"><ZoomIn size={15} /></button>
                <button onClick={() => apply({ zoom: clamp((stage?.state.zoom ?? 1) / 1.25, 0.6, 3.2) })} className={tool} aria-label="Zoom out"><ZoomOut size={15} /></button>
                <button
                  onClick={() => wireframe(!wire)}
                  aria-pressed={wire}
                  aria-label="Wireframe view"
                  title="Wireframe"
                  className={wire ? 'grid h-8 w-8 place-items-center rounded-sm border border-brand-blue bg-brand-blue text-white' : tool}
                >
                  <Box size={15} />
                </button>
                <button
                  onClick={() => lighting(!real)}
                  aria-pressed={real}
                  aria-label="Realistic lighting"
                  title={real ? 'Realistic lighting: on' : 'Realistic lighting: off'}
                  className={real ? 'grid h-8 w-8 place-items-center rounded-sm border border-brand-blue bg-brand-blue text-white' : tool}
                >
                  <Sun size={15} />
                </button>
                <button onClick={toggleFull} aria-pressed={full} aria-label={full ? 'Exit full screen' : 'Full screen'} title={full ? 'Exit full screen' : 'Full screen'} className={tool}>
                  {full ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                </button>
              </div>
            </>
          )}

          <p className="pointer-events-none absolute bottom-2 right-3 max-w-[calc(100%-1.5rem)] text-right font-mono text-[10px] text-slate-400">
            Illustrative — not to scale. Drag to rotate · Shift+drag to move · click, then scroll to zoom.
          </p>
        </div>

        <div className="grid gap-3 border-t border-slate-200 bg-slate-50 px-4 py-3 sm:grid-cols-[1fr_1fr_auto] sm:items-center">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            Peel layers
            <input type="range" min={0} max={1} step={0.01} value={peel} disabled={!ready} aria-label="Peel the hose layers back"
              onChange={(e) => { const v = parseFloat(e.target.value); setPeel(v); apply({ peel: v, focusX: 2.4 * v, offZ: 11.5 - 1 * v }) }}
              className="w-full accent-brand-blue" />
          </label>
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            Flex
            <input type="range" min={0} max={1.8} step={0.01} value={bend} disabled={!ready} aria-label="Bend the hose"
              onChange={(e) => { const v = parseFloat(e.target.value); setBend(v); apply({ bend: v }) }}
              className="w-full accent-brand-blue" />
          </label>
          <button onClick={reset} className="btn btn-secondary btn-sm" aria-label="Reset view"><RotateCcw size={14} /> Reset</button>
        </div>
      </div>

      <aside className={`border-t border-slate-200 p-4 lg:border-l lg:border-t-0 ${full ? 'max-h-[38vh] overflow-y-auto lg:max-h-none' : ''}`}>
        <h3 className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-brand-blue">Construction, outside → in</h3>
        <p className="mt-1 text-xs text-slate-500">Click a part to see it on its own.</p>
        <ol className="mt-3 space-y-1">
          {spec.layers.map((l, i) => layerButton(l.id, i + 1, l.label, l.detail))}
          {layerButton('fitting', spec.layers.length + 1, 'End fitting (illustrative)', 'Hose assemblies are supplied with fittings and adapters — see the catalogue.')}
        </ol>
        {isolated && (
          <button onClick={() => isolate(null)} className="btn btn-secondary btn-sm mt-3 w-full">Show all parts</button>
        )}
      </aside>
    </div>
  )
}
