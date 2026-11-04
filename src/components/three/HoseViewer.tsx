'use client'

import React, { useMemo, useRef, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import type { Product } from '@/types'
import { specFromProduct } from '@/three/spec'
import { SHOTS } from '@/three/shots'
import { useHoseStage } from './useStage'

const VIEW = { ...SHOTS.establish, focusX: 0, lookY: 0, offZ: 11.5, offY: 0.8, rotY: -0.38, fit: 1 }

/** Product-page viewer: drag to rotate, peel the layers back, flex the hose, hover a layer to highlight it. */
export function HoseViewer({ product }: { product: Product }) {
  const spec = useMemo(() => specFromProduct(product), [product])
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { stage, status } = useHoseStage(canvasRef, spec)
  const [peel, setPeel] = useState(0)
  const [bend, setBend] = useState(1)
  const [active, setActive] = useState<string | null>(null)
  const drag = useRef<{ x: number; y: number } | null>(null)

  const apply = (patch: Partial<typeof VIEW>) => {
    if (!stage) return
    Object.assign(stage.state, patch)
    stage.invalidate()
  }

  // first paint of the product shot
  React.useEffect(() => {
    if (!stage) return
    Object.assign(stage.state, VIEW)
    stage.invalidate()
  }, [stage])

  const highlight = (id: string | null) => {
    setActive(id)
    if (stage) {
      stage.model.setHighlight(id)
      stage.invalidate()
    }
  }

  const reset = () => {
    setPeel(0)
    setBend(1)
    highlight(null)
    apply(VIEW)
  }

  const failed = status === 'unsupported' || status === 'lost'

  return (
    <div className="grid overflow-hidden rounded-md border border-slate-200 bg-white lg:grid-cols-[1fr_20rem]">
      <div>
        <div
          className="light-surface relative h-[340px] touch-pan-y select-none sm:h-[460px]"
          style={{ background: 'radial-gradient(ellipse at 50% 50%, #ffffff 0%, #f4f7fb 55%, #e1e8f1 100%)' }}
          onPointerDown={(e) => {
            drag.current = { x: e.clientX, y: e.clientY }
            ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
          }}
          onPointerMove={(e) => {
            if (!drag.current || !stage) return
            stage.state.rotY += (e.clientX - drag.current.x) * 0.008
            stage.state.rotX = Math.max(-0.7, Math.min(0.7, stage.state.rotX + (e.clientY - drag.current.y) * 0.005))
            drag.current = { x: e.clientX, y: e.clientY }
            stage.invalidate()
          }}
          onPointerUp={() => (drag.current = null)}
          onPointerCancel={() => (drag.current = null)}
        >
          <div className="pointer-events-none absolute inset-0 bg-blueprint-grid opacity-50" />
          {(status === 'loading' || failed) && product.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.image} alt={product.name} className={`absolute inset-0 h-full w-full object-contain p-8 ${status === 'loading' ? 'opacity-40' : ''}`} />
          )}
          <canvas
            ref={canvasRef}
            role="img"
            aria-label={`Interactive 3D illustration of ${product.name}`}
            className={`absolute inset-0 h-full w-full cursor-grab touch-pan-y transition-opacity duration-500 active:cursor-grabbing ${status === 'ready' ? 'opacity-100' : 'opacity-0'}`}
          />
          {status === 'loading' && <div className="absolute inset-0 grid place-items-center font-mono text-xs text-slate-500">Loading 3D model…</div>}
          <p className="pointer-events-none absolute bottom-2 right-3 font-mono text-[10px] text-slate-400">
            Illustrative construction — wire counts and layer thickness not to scale. Drag to rotate.
          </p>
        </div>

        <div className="grid gap-3 border-t border-slate-200 bg-slate-50 px-4 py-3 sm:grid-cols-[1fr_1fr_auto] sm:items-center">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            Peel layers
            <input type="range" min={0} max={1} step={0.01} value={peel} disabled={status !== 'ready'} aria-label="Peel the hose layers back"
              onChange={(e) => { const v = parseFloat(e.target.value); setPeel(v); apply({ peel: v, focusX: 2.4 * v, offZ: 11.5 - 1 * v }) }}
              className="w-full accent-brand-blue" />
          </label>
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            Flex
            <input type="range" min={0} max={1.8} step={0.01} value={bend} disabled={status !== 'ready'} aria-label="Bend the hose"
              onChange={(e) => { const v = parseFloat(e.target.value); setBend(v); apply({ bend: v }) }}
              className="w-full accent-brand-blue" />
          </label>
          <button onClick={reset} className="btn btn-secondary btn-sm" aria-label="Reset view"><RotateCcw size={14} /> Reset</button>
        </div>
      </div>

      <aside className="border-t border-slate-200 p-4 lg:border-l lg:border-t-0">
        <h3 className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-brand-blue">Construction, outside → in</h3>
        <ol className="mt-3 space-y-1">
          {spec.layers.map((l, i) => (
            <li key={l.id}>
              <button
                onMouseEnter={() => highlight(l.id)}
                onMouseLeave={() => highlight(null)}
                onFocus={() => highlight(l.id)}
                onBlur={() => highlight(null)}
                className={`w-full rounded-sm border px-3 py-2 text-left transition-colors ${active === l.id ? 'border-brand-blue bg-blue-50' : 'border-transparent hover:bg-slate-50'}`}
              >
                <span className="font-mono text-[10px] text-slate-400">{String(i + 1).padStart(2, '0')}</span>{' '}
                <span className="text-sm font-semibold text-slate-900">{l.label}</span>
                {l.detail && <span className="mt-0.5 block text-xs leading-snug text-slate-600">{l.detail}</span>}
              </button>
            </li>
          ))}
          <li>
            <button
              onMouseEnter={() => highlight('fitting')}
              onMouseLeave={() => highlight(null)}
              onFocus={() => highlight('fitting')}
              onBlur={() => highlight(null)}
              className={`w-full rounded-sm border px-3 py-2 text-left ${active === 'fitting' ? 'border-brand-blue bg-blue-50' : 'border-transparent hover:bg-slate-50'}`}
            >
              <span className="font-mono text-[10px] text-slate-400">{String(spec.layers.length + 1).padStart(2, '0')}</span>{' '}
              <span className="text-sm font-semibold text-slate-900">End fitting (illustrative)</span>
              <span className="mt-0.5 block text-xs leading-snug text-slate-600">Hose assemblies are supplied with fittings and adapters — see the catalogue.</span>
            </button>
          </li>
        </ol>
      </aside>
    </div>
  )
}
