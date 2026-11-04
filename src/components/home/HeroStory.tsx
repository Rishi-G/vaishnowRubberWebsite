'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useSiteData } from '@/lib/site-context'
import { specFromProduct } from '@/three/spec'
import { SHOTS } from '@/three/shots'
import type { HoseStage } from '@/three/stage'
import { useHoseStage } from '@/components/three/useStage'
import { RailwayHero } from './RailwayHero'
import { HeroIntro, type HeroContent } from './HeroIntro'
import { fill } from '@/lib/content'

gsap.registerPlugin(ScrollTrigger)

/** On phones the text takes the top of the screen, so the hose is framed lower (opening) and higher (closing, where text is at the bottom). */
const pickShots = () =>
  typeof window !== 'undefined' && window.innerWidth < 768
    ? {
        ...SHOTS,
        establish: { ...SHOTS.establish, focusX: 0, lookY: 2.7, offZ: 14.5 },
        whole: { ...SHOTS.whole, focusX: 0, lookY: -2.3 },
      }
    : SHOTS

/**
 * Hero story. ONE timeline owns the 3D stage: it only ever writes `stage.state`
 * (numbers); the stage renders when that changes. Pointer/mouse parallax is
 * deliberately absent so nothing can fight the scroll-driven camera.
 *
 * Timeline map (labels): intro 0 · macro 1.0 · fitting 3.4 · peel 5.8 · whole 8.4 · end 10.2
 * Reverse scroll replays everything backwards (scrubbed). On reduced-motion or
 * without WebGL the pin is skipped and the same copy is shown as a plain list.
 */
/** Hero slides: each hose family is told by one representative hose, with the same scroll story; railway has its own story. */
const FAMILIES = [
  { key: 'hydraulic', slug: 'sae-100-r2' },
  { key: 'industrial', slug: 'steam-hose-type-2' },
  { key: 'automotive', slug: 'governor-hose' },
  { key: 'railway', slug: '' },
] as const

export type FamilyKey = (typeof FAMILIES)[number]['key']
export type StartRef = React.MutableRefObject<ScrollTrigger | null>
interface HeroProps {
  hero: HeroContent
  tabs: React.ReactNode
  triggerRef: StartRef
}

function HoseHero({ hero, family, tabs, triggerRef }: HeroProps & { family: FamilyKey }) {
  const { products } = useSiteData()
  const product = useMemo(() => {
    const slug = FAMILIES.find((f) => f.key === family)?.slug
    return (
      products.find((p) => p.id === slug && p.kind === 'hose') ??
      products.find((p) => p.isHero && p.kind === 'hose') ??
      products.find((p) => p.kind === 'hose') ??
      null
    )
  }, [products, family])
  const spec = useMemo(() => (product ? specFromProduct(product) : null), [product])

  const stageEl = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const progressRef = useRef<HTMLSpanElement>(null)
  const counterRef = useRef<HTMLSpanElement>(null)
  const annoRefs = useRef<(HTMLDivElement | null)[]>([])
  const lineRefs = useRef<(HTMLSpanElement | null)[]>([])
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([])
  const [headerH, setHeaderH] = useState(112)
  const [reduced, setReduced] = useState(false)
  const { stage, status } = useHoseStage(canvasRef, spec)
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

  /* ── facts shown in the chapters come straight from the catalogue data ── */
  const facts = useMemo(() => {
    if (!product) return null
    const wps = product.specs.map((s) => s.workingPressureBar)
    const ratios = new Set(product.specs.map((s) => Math.round(s.burstPressureBar / s.workingPressureBar)))
    return {
      wpMin: Math.min(...wps),
      wpMax: Math.max(...wps),
      burstRatio: ratios.size === 1 ? [...ratios][0] : null,
      sizes: product.sizeRange,
    }
  }, [product])

  /* ── the scroll timeline ── */
  useEffect(() => {
    if (!stage || !story || !spec) return
    const el = stageEl.current
    if (!el) return
    const s = stage as HoseStage
    const shots = pickShots()
    Object.assign(s.state, shots.establish)
    s.invalidate()

    const layers = s.model.layers
    s.onFrame = () => {
      const peel = s.state.peel
      const op = Math.min(1, Math.max(0, (peel - 0.55) / 0.35))
      const pts = layers.map((l, i) => s.project(s.model.layerEndX(i), l.rMid))
      // Label rows: leftmost layer highest. A leader to a layer on its right then always
      // stops below that label's row, so no leader line ever crosses another label.
      const top = Math.min(...pts.map((p) => p.y)) - 28
      layers.forEach((_, i) => {
        const a = annoRefs.current[i]
        if (!a) return
        const p = pts[i]
        const labelY = top - (layers.length - 1 - i) * 18
        const len = Math.max(8, p.y - labelY)
        a.style.opacity = p.visible ? String(op) : '0'
        a.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`
        const line = lineRefs.current[i], label = labelRefs.current[i]
        if (line) { line.style.top = `${-len}px`; line.style.height = `${len}px` }
        if (label) label.style.top = `${-len - 14}px`
      })
    }

    const mobile = window.matchMedia('(max-width: 767px)').matches
    const ctx = gsap.context(() => {
      const chapters = gsap.utils.toArray<HTMLElement>('[data-chapter]', el)
      gsap.set(chapters, { autoAlpha: 0, y: 16 })
      gsap.set(chapters[0], { autoAlpha: 1, y: 0 })

      const tl = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        onUpdate: () => s.invalidate(),
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: mobile ? '+=280%' : '+=430%',
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (progressRef.current) progressRef.current.style.transform = `scaleX(${self.progress})`
            if (counterRef.current) {
              const t = self.progress * 10.2
              const n = t < 1 ? 1 : t < 3.4 ? 2 : t < 5.8 ? 3 : t < 8.4 ? 4 : 5
              counterRef.current.textContent = `0${n} / 05`
            }
          },
        },
      })

      const shot = (target: typeof SHOTS[keyof typeof SHOTS], at: number, dur = 1.4) => tl.to(s.state, { ...target, duration: dur }, at)
      const show = (i: number, at: number) => tl.to(chapters[i], { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power2.out' }, at)
      const hide = (i: number, at: number) => tl.to(chapters[i], { autoAlpha: 0, y: -14, duration: 0.35, ease: 'power2.in' }, at)

      tl.addLabel('intro', 0)
      hide(0, 0.7)
      tl.addLabel('macro', 1.0)
      shot(shots.macro, 1.0)
      show(1, 1.9); hide(1, 3.0)
      tl.addLabel('fitting', 3.4)
      shot(shots.fitting, 3.4)
      show(2, 4.3); hide(2, 5.4)
      tl.addLabel('peel', 5.8)
      shot(shots.peel, 5.8, 1.7)
      show(3, 6.9); hide(3, 8.1)
      tl.addLabel('whole', 8.4)
      shot(shots.whole, 8.4, 1.5)
      show(4, 9.2)
      tl.to({}, { duration: 0.01 }, 10.2) // pads the timeline to its full length
      triggerRef.current = tl.scrollTrigger ?? null
    }, el)

    return () => {
      triggerRef.current = null
      s.onFrame = undefined
      ctx.revert()
    }
  }, [stage, story, spec, triggerRef])

  /* ── without the story (reduced motion / no WebGL): a single, calm still ── */
  useEffect(() => {
    if (!stage || story) return
    Object.assign(stage.state, pickShots().establish)
    stage.invalidate()
  }, [stage, story])

  if (!product || !spec || !facts) return null

  const chapters = [
    {
      ...hero.cover,
      body: fill(hero.cover.body, { cover: product.construction?.cover ?? '' }),
    },
    {
      ...hero.fittings,
    },
    {
      ...hero.layers,
      body: fill(hero.layers.body, {
        tube: product.construction?.tube ?? '',
        reinforcement: product.construction?.reinforcement?.toLowerCase() ?? '',
        cover: product.construction?.cover?.toLowerCase() ?? '',
      }),
    },
    {
      eyebrow: hero.rating.eyebrow,
      title: `${product.name.split('/')[0].trim()}, rated by size`,
      body: `Working pressure from ${facts.wpMin} to ${facts.wpMax} bar across ${facts.sizes}${facts.burstRatio ? `; minimum burst pressure is ${facts.burstRatio}× working pressure` : ''}.`,
      note: product.standard,
    },
  ]

  return (
    <section id="hero" aria-label="VEXTRA hose construction, scroll-driven 3D presentation" className="relative">
      <a href="#range" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-28 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:shadow">
        Skip to product range
      </a>

      <div
        ref={stageEl}
        className={`relative w-full overflow-hidden ${story || status === 'loading' ? '' : 'min-h-[88svh]'}`}
        style={{
          height: story || status === 'loading' ? '100svh' : undefined,
          paddingTop: headerH,
          background: 'var(--stage-bg)',
        }}
      >
        <div className="pointer-events-none absolute inset-0 bg-blueprint-grid opacity-50" />

        {/* canvas — below the fixed header, fades in once the model is ready */}
        <div className="absolute inset-x-0 bottom-0" style={{ top: headerH }}>
          {(status === 'loading' || fallback) && product.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image}
              alt={`${product.name} hydraulic hose`}
              className={`absolute inset-0 h-full w-full object-contain p-10 transition-opacity duration-500 ${status === 'loading' ? 'opacity-40' : 'opacity-100'}`}
            />
          )}
          <canvas
            ref={canvasRef}
            role="img"
            aria-label={`3D model of ${product.name}: finished hose, cover, fitting and layer construction`}
            className={`absolute inset-0 h-full w-full transition-opacity duration-700 ${status === 'ready' ? 'opacity-100' : 'opacity-0'}`}
          />
          {/* construction call-outs, positioned each frame by the stage */}
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            {spec.layers.map((l, i) => (
              <div key={l.id} ref={(n) => { annoRefs.current[i] = n }} className="absolute left-0 top-0 opacity-0 will-change-transform">
                <span className="absolute -left-[3px] -top-[3px] h-1.5 w-1.5 rounded-full bg-brand-blue" />
                <span ref={(n) => { lineRefs.current[i] = n }} className="absolute left-0 w-px bg-slate-400/80" />
                <span ref={(n) => { labelRefs.current[i] = n }} className="absolute left-2 whitespace-nowrap font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-700">
                  {l.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* copy */}
        <div className="container relative z-10 h-full">
          {/* chapter 0 — intro */}
          <div data-chapter className="absolute left-6 top-4 max-w-[min(36rem,calc(100%-3rem))] lg:left-10 lg:top-8">
            <HeroIntro hero={hero} tabs={tabs} primaryHref="/products" primaryLabel={hero.primaryLabel} />
          </div>

          {/* chapters 1–4 */}
          {chapters.map((c, i) => (
            <div key={c.eyebrow} data-chapter aria-hidden="true" className="absolute bottom-10 left-6 max-w-[min(28rem,calc(100%-3rem))] lg:bottom-14 lg:left-10">
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-brand-blue">{c.eyebrow}</span>
              <h2 className="mt-2 text-2xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-3xl">{c.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">{c.body}</p>
              <p className="mt-2 font-mono text-[11px] text-slate-500">{c.note}</p>
              {i === 3 && (
                <div className="mt-4 flex gap-3">
                  <Link href={`/products/${product.id}`} className="btn btn-primary btn-sm">
                    {hero.rating.buttonLabel}
                  </Link>
                </div>
              )}
            </div>
          ))}

          {/* progress */}
          {story && (
            <div className="absolute bottom-4 right-6 flex items-center gap-3 lg:right-10" aria-hidden="true">
              <span ref={counterRef} className="font-mono text-[11px] font-semibold text-slate-600">01 / 05</span>
              <span className="relative block h-px w-24 bg-slate-300">
                <span ref={progressRef} className="absolute inset-0 origin-left scale-x-0 bg-brand-blue" />
              </span>
              <span className="font-mono text-[11px] uppercase tracking-wider text-slate-500">Scroll</span>
            </div>
          )}
        </div>
      </div>

      {/* readable text for screen readers, and the full copy when the story is off */}
      <div className={story ? 'sr-only' : 'container py-12'}>
        {!story && <p className="mb-6 font-mono text-[11px] uppercase tracking-wider text-slate-500">{product.name} — construction</p>}
        <div className={story ? '' : 'grid gap-8 md:grid-cols-2 xl:grid-cols-4'}>
          {chapters.map((c) => (
            <div key={c.title}>
              <h2 className="text-lg font-bold text-slate-900">{c.title}</h2>
              <p className="mt-1 text-sm text-slate-600">{c.body}</p>
              <p className="mt-1 font-mono text-[11px] text-slate-500">{c.note}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/** Tab bar shared by both heroes. Choosing a family restarts the story from the top. */
function FamilyTabs({ labels, family, onChoose }: { labels: HeroContent['tabs']; family: FamilyKey; onChoose: (k: FamilyKey) => void }) {
  return (
    <div id="range" role="tablist" aria-label="Product family" className="mt-4 flex flex-wrap gap-1.5 sm:mt-5 sm:gap-2">
      {FAMILIES.map((f) => (
        <button
          key={f.key}
          role="tab"
          aria-selected={f.key === family}
          onClick={() => onChoose(f.key)}
          className={`inline-flex items-center rounded-sm border px-2.5 py-1 text-[11px] font-semibold transition-colors sm:px-3 sm:py-1.5 sm:text-xs ${f.key === family ? 'border-brand-blue bg-brand-blue text-white' : 'border-slate-300 bg-white/80 text-slate-800 hover:border-brand-blue hover:text-brand-blue'}`}
        >
          {labels[f.key]}
        </button>
      ))}
    </div>
  )
}

export function HeroStory({ hero }: { hero: HeroContent }) {
  const [family, setFamily] = useState<FamilyKey>('hydraulic')
  const triggerRef = useRef<ScrollTrigger | null>(null)
  const choose = (key: FamilyKey) => {
    if (key === family) return
    window.scrollTo({ top: triggerRef.current?.start ?? 0, behavior: 'auto' }) // the new slide's story starts from the top
    setFamily(key)
  }
  const tabs = <FamilyTabs labels={hero.tabs} family={family} onChoose={choose} />
  return family === 'railway' ? <RailwayHero hero={hero} tabs={tabs} triggerRef={triggerRef} /> : <HoseHero hero={hero} family={family} tabs={tabs} triggerRef={triggerRef} />
}
