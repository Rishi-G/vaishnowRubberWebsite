'use client'

import { useEffect, useState, type RefObject } from 'react'
import type { HoseStage } from '@/three/stage'
import type { DemoStage } from '@/three/demoStage'
import type { HoseSpec } from '@/three/spec'

export type StageStatus = 'loading' | 'ready' | 'unsupported' | 'lost'

const isSmall = () => window.matchMedia('(max-width: 767px)').matches
const quality = () => (isSmall() ? ('low' as const) : ('high' as const))

/**
 * Creates the stage after mount. three.js is imported lazily so it never blocks the first
 * paint, and any failure (no WebGL, lost context) becomes a status the UI can fall back on.
 */
export function useHoseStage(canvasRef: RefObject<HTMLCanvasElement | null>, spec: HoseSpec | null) {
  const [stage, setStage] = useState<HoseStage | null>(null)
  const [status, setStatus] = useState<StageStatus>('loading')

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !spec) return
    let cancelled = false
    let created: HoseStage | null = null
    ;(async () => {
      try {
        const { HoseStage } = await import('@/three/stage')
        if (cancelled) return
        if (!HoseStage.supported()) return setStatus('unsupported')
        created = new HoseStage(canvas, spec, { quality: quality() })
        created.onContextLost = () => setStatus('lost')
        setStage(created)
        setStatus('ready')
      } catch (err) {
        console.error('3D stage failed', err)
        if (!cancelled) setStatus('unsupported')
      }
    })()
    return () => {
      cancelled = true
      created?.dispose()
      setStage(null)
    }
    // spec identity is stable per product slug
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasRef, spec?.slug])

  return { stage, status }
}

export function useDemoStage(canvasRef: RefObject<HTMLCanvasElement | null>, slug: string) {
  const [stage, setStage] = useState<DemoStage | null>(null)
  const [status, setStatus] = useState<StageStatus>('loading')

  // create once…
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let cancelled = false
    let created: DemoStage | null = null
    ;(async () => {
      try {
        const { DemoStage } = await import('@/three/demoStage')
        if (cancelled) return
        if (!DemoStage.supported()) return setStatus('unsupported')
        created = new DemoStage(canvas, slug, { quality: quality() })
        created.onContextLost = () => setStatus('lost')
        setStage(created)
        setStatus('ready')
      } catch (err) {
        console.error('3D stage failed', err)
        if (!cancelled) setStatus('unsupported')
      }
    })()
    return () => {
      cancelled = true
      created?.dispose()
      setStage(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasRef])

  // …then swap models in place when the slug changes (one renderer, no new GL contexts)
  useEffect(() => {
    stage?.setModel(slug)
  }, [stage, slug])

  return { stage, status }
}
