'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useSiteData } from '@/lib/site-context'
import { useDemoStage } from '@/components/three/useStage'
import type { StartRef } from './HeroStory'
import { HeroIntro, type HeroContent } from './HeroIntro'

gsap.registerPlugin(ScrollTrigger)

const smooth = (t: number) => {
  const x = Math.min(1, Math.max(0, t))
  return x * x * (3 - 2 * x)
}

/**
 * Railway slide. The pinned section steps through the railway components one by
 * one; inside each step the scroll position scrubs that part's "action" (a pad
 * compressing, a coupling connecting…). Scroll writes numbers to `stage.state`
 * only, and the stage renders when they change — same contract as the hose story.
 * Models are illustrative: no drawings have been supplied.
 */
export function RailwayHero({ hero, tabs, triggerRef }: { hero: HeroContent; tabs: React.ReactNode; triggerRef: StartRef }) {
  const { products } = useSiteData()
  const items = useMemo(() => products.filter((p) => p.category === 'railway'), [products])

  const sectionRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const introRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLOListElement>(null)
  const progressRef = useRef<HTMLSpanElement>(null)
  const [headerH, setHeaderH] = useState(112)
  const [reduced, setReduced] = useState(false)
  const [index, setIndex] = useState(0)
  // on phones the model sits under the intro text first, then moves up above the part card
  const [introOn, setIntroOn] = useState(true)
  const [action, setAction] = useState<{ title: string; caption: string } | null>(null)
  // the model is swapped by the scroll handler itself, so the hook only ever sees the first slug
  const { stage, status } = useDemoStage(canvasRef, items[0]?.id ?? '')
  const story = status === 'ready' && !reduced
  const fallback = status === 'unsupported' || status === 'lost'

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(mq.matches)
    update()
    mq.addEventListener('change', update)
    const measure = () => setHeaderH(document.querySelector('header')?.getBoundingClientRect().height ?? 112)
    measure()
    window.addEventListener('resize', measure)
    return () => {
      mq.removeEventListener('change', update)
      window.removeEventListener('resize', measure)
    }
  }, [])

  useEffect(() => {
    if (!stage || !story || items.length === 0) return
    const el = sectionRef.current
    if (!el) return
    const n = items.length
    let current = -1
    let activeSlug = items[0].id
    const W = 0.14 // half-width of the overlap at each boundary, in parts
    const SLIDE = 3.4 // world units a part slides while it fades
    // the caption follows the model that is on show, once the stage has built it
    stage.onFrame = () => {
      const m = stage.getModel(activeSlug)
      if (m) setAction((prev) => (prev === m.action ? prev : m.action))
    }
    const place = () => {
      const wide = window.matchMedia('(min-width: 1024px)').matches
      stage.state.shift = wide ? 0.15 : 0
      stage.state.zoom = wide ? 1.12 : 1.3
      stage.invalidate()
    }
    place()
    window.addEventListener('resize', place)

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top top',
        end: `+=${n * 70}%`,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onRefresh: (self) => {
          triggerRef.current = self
        },
        onUpdate: (self) => {
          const t = self.progress * n
          const k = Math.round(t)
          // rest → act → hold inside a part; two parts overlap across each boundary so one flows into the next
          const pose = (i: number) => {
            const u = t - i
            return { slug: items[i].id, action: smooth((u - W) / (1 - 2 * W)), rotY: -0.55 + (u - 0.5) * 0.7 }
          }
          let active: number
          if (k > 0 && k < n && Math.abs(t - k) < W) {
            const e = smooth((t - (k - W)) / (2 * W))
            stage.state.layers = [
              { ...pose(k - 1), x: -e * SLIDE, scale: 1 - 0.2 * e, opacity: 1 - e },
              { ...pose(k), x: (1 - e) * SLIDE, scale: 0.8 + 0.2 * e, opacity: e },
            ]
            active = e < 0.5 ? k - 1 : k
          } else {
            active = Math.min(n - 1, Math.max(0, Math.floor(t)))
            stage.state.layers = [{ ...pose(active), x: 0, scale: 1, opacity: 1 }]
          }
          if (active !== current) {
            current = active
            activeSlug = items[active].id
            setIndex(active)
          }
          stage.invalidate()

          if (progressRef.current) progressRef.current.style.transform = `scaleX(${self.progress})`
          const introOpacity = Math.max(0, 1 - self.progress * n * 6)
          setIntroOn(introOpacity > 0.5)
          if (introRef.current) {
            introRef.current.style.opacity = String(introOpacity)
            introRef.current.style.pointerEvents = introOpacity < 0.5 ? 'none' : 'auto'
          }
          if (cardRef.current) cardRef.current.style.opacity = String(1 - introOpacity)
          if (listRef.current) listRef.current.style.opacity = String(1 - introOpacity)
        },
      })
    }, el)

    return () => {
      stage.onFrame = undefined
      stage.state.layers = []
      window.removeEventListener('resize', place)
      triggerRef.current = null
      ctx.revert()
    }
  }, [stage, story, items, triggerRef])

  if (items.length === 0) return null
  const part = items[index] ?? items[0]

  /** scroll to the middle of part i's step */
  const jump = (i: number) => {
    const st = triggerRef.current
    if (!st) return
    window.scrollTo({ top: st.start + ((i + 0.5) / items.length) * (st.end - st.start), behavior: 'auto' })
  }

  return (
    <section id="hero" aria-label="VEXTRA railway components, scroll-driven 3D presentation" className="light-surface relative">
      <div
        ref={sectionRef}
        className={`relative w-full overflow-hidden ${story || status === 'loading' ? '' : 'min-h-[88svh]'}`}
        style={{
          height: story || status === 'loading' ? '100svh' : undefined,
          paddingTop: headerH,
          background: 'radial-gradient(ellipse at 55% 55%, #ffffff 0%, #f4f7fb 52%, #e3eaf3 100%)',
        }}
      >
        <div className="pointer-events-none absolute inset-0 bg-blueprint-grid opacity-50" />

        {/* canvas: full width below the header; the model is shifted right on desktop and sits in the lower half on phones */}
        <div
          className={`absolute inset-x-0 lg:bottom-0 lg:top-[var(--h)] ${introOn ? 'bottom-0 top-[52%]' : 'bottom-[46%] top-[var(--h)]'}`}
          style={{ '--h': `${headerH}px` } as React.CSSProperties}
        >
          <canvas
            ref={canvasRef}
            role="img"
            aria-label={`3D model of the ${part.name}`}
            className={`absolute inset-0 h-full w-full transition-opacity duration-700 ${status === 'ready' ? 'opacity-100' : 'opacity-0'}`}
          />
        </div>

        <div className="container relative z-10 h-full">
          {/* intro — same copy as the hose slides, fades as the story starts */}
          <div ref={introRef} className="absolute left-6 top-4 max-w-[min(36rem,calc(100%-3rem))] lg:left-10 lg:top-8">
            <HeroIntro hero={hero} tabs={tabs} primaryHref="/products?category=railway" primaryLabel={hero.railwayPrimaryLabel} />
          </div>

          {/* the part currently on show */}
          {story && (
            <div ref={cardRef} className="absolute bottom-10 left-6 max-w-[min(28rem,calc(100%-3rem))] opacity-0 lg:bottom-14 lg:left-10 lg:top-8 lg:bottom-auto">
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-brand-blue">
                Railway · {String(index + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
              </span>
              <h2 className="mt-2 text-2xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-3xl">{part.name}</h2>
              {action && (
                <p className="mt-3 text-sm leading-relaxed text-slate-700">
                  <span className="font-semibold text-slate-900">{action.title}. </span>
                  {action.caption}
                </p>
              )}
              <p className="mt-2 hidden font-mono text-[11px] text-slate-500 sm:block">Illustrative model, not to scale. Drawings on request.</p>
              <div className="mt-4 flex gap-3">
                <Link href={`/products/${part.id}`} className="btn btn-primary btn-sm">
                  View details
                </Link>
              </div>
            </div>
          )}

          {/* all parts, current one highlighted; click to jump */}
          {story && (
            <ol ref={listRef} aria-label="Railway components" className="absolute bottom-14 left-6 hidden w-[19rem] opacity-0 lg:left-10 lg:block">
              {items.map((p, i) => (
                <li key={p.id}>
                  <button
                    onClick={() => jump(i)}
                    aria-current={i === index}
                    className={`flex w-full items-baseline gap-3 border-l-2 py-1.5 pl-3 text-left text-[13px] transition-colors ${i === index ? 'border-brand-blue font-bold text-brand-blue' : 'border-slate-300 font-medium text-slate-500 hover:border-slate-500 hover:text-slate-900'}`}
                  >
                    <span className="font-mono text-[10px] text-slate-400">{String(i + 1).padStart(2, '0')}</span>
                    <span className="truncate">{p.name}</span>
                  </button>
                </li>
              ))}
            </ol>
          )}

          {story && (
            <div className="absolute bottom-4 right-6 flex items-center gap-3 lg:right-10" aria-hidden="true">
              <span className="relative block h-px w-24 bg-slate-300">
                <span ref={progressRef} className="absolute inset-0 origin-left scale-x-0 bg-brand-blue" />
              </span>
              <span className="font-mono text-[11px] uppercase tracking-wider text-slate-500">Scroll</span>
            </div>
          )}
        </div>
      </div>

      {/* without the story (reduced motion / no WebGL): the parts as a plain list */}
      {(!story && (reduced || fallback)) && (
        <div className="container py-12">
          <p className="mb-6 font-mono text-[11px] uppercase tracking-wider text-slate-500">Railway components</p>
          <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {items.map((p) => (
              <li key={p.id}>
                <Link href={`/products/${p.id}`} className="text-lg font-bold text-slate-900 hover:text-brand-blue">
                  {p.name}
                </Link>
                <p className="mt-1 text-sm text-slate-600">{p.description}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
