import React from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import type { Crumb } from './PageHead'

/**
 * Engineering-sheet graphics for the inner pages. Everything is inline SVG line art
 * (no images, no libraries); elements carry pathLength={1} so the one-time draw-in
 * animation in globals.css can trace them.
 */

const polar = (cx: number, cy: number, r: number, a: number): [number, number] => [cx + r * Math.cos(a), cy + r * Math.sin(a)]
const stagger = (i: number) => ({ '--i': i }) as React.CSSProperties

/* ───────────────────────── hero shell ───────────────────────── */

export function SheetHero({ crumbs, title, lede, art }: { crumbs: Crumb[]; title: string; lede: string; art: React.ReactNode }) {
  return (
    <header className="relative overflow-hidden bg-ink text-white">
      <div className="bg-sheet-grid absolute inset-0" />
      <div className="container relative grid items-center gap-10 pb-14 pt-32 lg:grid-cols-[1.05fr_0.95fr] lg:pb-20 lg:pt-40">
        <div>
          <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-white/55">
            {crumbs.map((c, i) => (
              <React.Fragment key={c.label}>
                {i > 0 && <ChevronRight size={12} className="text-white/30" />}
                {c.href ? <Link href={c.href} className="hover:text-white">{c.label}</Link> : <span className="text-white/90">{c.label}</span>}
              </React.Fragment>
            ))}
          </nav>
          <h1 className="max-w-3xl text-4xl font-extrabold text-white leading-[1.04] tracking-tight sm:text-6xl">{title}</h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/70">{lede}</p>
        </div>
        <div className="draw-in mx-auto w-full max-w-[34rem]" aria-hidden="true">{art}</div>
      </div>
      <div className="laminate-rule" />
    </header>
  )
}

/* ───────────────────────── hero art ───────────────────────── */

/** Cross-section of a braided hose, labelled like a section view on a drawing. */
export function ArtHose() {
  const cx = 170, cy = 180
  const leaders: [string, number, number, number][] = [
    ['Outer cover', 138, -0.95, 60],
    ['Steel wire braid', 112, -0.35, 130],
    ['Inner tube', 66, 0.2, 215],
    ['Bore', 26, 0.7, 285],
  ]
  return (
    <svg viewBox="0 0 470 370" className="w-full" fill="none" strokeLinecap="round">
      <defs>
        <pattern id="braid" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="9" stroke="#c9a560" strokeWidth="2" />
          <line x1="0" y1="4.5" x2="9" y2="4.5" stroke="#8d7440" strokeWidth="1.5" />
        </pattern>
      </defs>
      <circle cx={cx} cy={cy} r="150" fill="#14171c" stroke="#46505f" strokeWidth="2" pathLength={1} style={stagger(0)} />
      <path d={`M${cx} ${cy - 124} a124 124 0 1 0 0.01 0 Z M${cx} ${cy - 100} a100 100 0 1 0 0.01 0 Z`} fill="url(#braid)" fillRule="evenodd" stroke="#c9a560" strokeWidth="1.5" pathLength={1} style={stagger(1)} />
      <circle cx={cx} cy={cy} r="92" fill="#1d2127" stroke="#394150" strokeWidth="1.5" pathLength={1} style={stagger(2)} />
      <circle cx={cx} cy={cy} r="78" fill="#0e1013" stroke="#4a5160" strokeWidth="2" pathLength={1} style={stagger(3)} />
      <circle cx={cx} cy={cy} r="52" fill="#0a1a2b" stroke="#f69c2f" strokeWidth="2" strokeDasharray="4 4" />
      <path d={`M${cx - 168} ${cy} H${cx + 168} M${cx} ${cy - 168} V${cy + 168}`} stroke="#ffffff" strokeOpacity="0.18" strokeDasharray="10 4 2 4" pathLength={1} style={stagger(4)} />
      {leaders.map(([label, r, a, y], i) => {
        const [x, py] = polar(cx, cy, r, a)
        return (
          <g key={label}>
            <path d={`M${x} ${py} L${x + 18} ${y} H340`} stroke="#f69c2f" strokeWidth="1.4" pathLength={1} style={stagger(5 + i)} />
            <circle cx={x} cy={py} r="3.5" fill="#f69c2f" />
            <text x="348" y={y + 5} fill="#cbd5e1" fontSize="14" fontWeight="600">{label}</text>
          </g>
        )
      })}
      <path d={`M${cx - 150} 352 H${cx + 150} M${cx - 150} 345 V359 M${cx + 150} 345 V359`} stroke="#8c939c" pathLength={1} style={stagger(9)} />
      <text x={cx} y="344" textAnchor="middle" fill="#8c939c" fontSize="12">outside diameter</text>
    </svg>
  )
}

/** Rails running to the horizon, for the railway-led industries page. */
export function ArtRail() {
  const vp = { x: 230, y: 78 }
  const sleepers = Array.from({ length: 11 }, (_, i) => {
    const t = Math.pow(i / 10, 1.8)
    const y = vp.y + 282 * t
    const w = 10 + 120 * t
    return { y, w, i }
  })
  return (
    <svg viewBox="0 0 470 370" className="w-full" fill="none" strokeLinecap="round">
      <path d="M0 78 H470" stroke="#ffffff" strokeOpacity="0.25" pathLength={1} style={stagger(0)} />
      {sleepers.map((s) => (
        <path key={s.i} d={`M${vp.x - s.w} ${s.y} H${vp.x + s.w}`} stroke="#8c939c" strokeWidth={1 + s.i * 0.35} pathLength={1} style={stagger(1 + s.i)} />
      ))}
      {[-1, 1].map((side) => (
        <g key={side}>
          <path d={`M${vp.x + side * 6} ${vp.y} L${vp.x + side * 82} 360`} stroke="#ffffff" strokeWidth="3" pathLength={1} style={stagger(2)} />
          <path d={`M${vp.x + side * 6} ${vp.y} L${vp.x + side * 96} 360`} stroke="#ffffff" strokeOpacity="0.5" pathLength={1} style={stagger(3)} />
        </g>
      ))}
      <path d={`M${vp.x} ${vp.y} V360`} stroke="#f69c2f" strokeDasharray="6 8" pathLength={1} style={stagger(6)} />
      <circle cx={vp.x} cy={vp.y} r="6" fill="#f69c2f" />
      <text x={vp.x + 16} y={vp.y - 10} fill="#cbd5e1" fontSize="13" fontWeight="600">Indian Railways</text>
    </svg>
  )
}

/* ───────────────────────── gauge (hero art and the live pressure converter) ───────────────────────── */

const arcPath = (cx: number, cy: number, r: number, a0: number, a1: number) => {
  const [x0, y0] = polar(cx, cy, r, a0)
  const [x1, y1] = polar(cx, cy, r, a1)
  return `M${x0} ${y0} A${r} ${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${x1} ${y1}`
}

/** value 0…1 sweeps a 240° dial; the needle eases to a new value. */
export function Gauge({ value, readout, unit, max, light = false }: { value: number; readout: string; unit: string; max: string; light?: boolean }) {
  const cx = 150, cy = 150, r = 112
  const a0 = (Math.PI * 5) / 6, sweep = (Math.PI * 4) / 3 // 150° → 390°
  const v = Math.min(1, Math.max(0, value))
  const ink = light ? '#0a1a2b' : '#ffffff'
  return (
    <svg viewBox="0 0 300 250" className="w-full" fill="none" strokeLinecap="round" role="img" aria-label={`Dial reading ${readout} ${unit}`}>
      <path d={arcPath(cx, cy, r, a0, a0 + sweep)} stroke={ink} strokeOpacity="0.2" strokeWidth="14" pathLength={1} style={stagger(0)} />
      <path d={arcPath(cx, cy, r, a0, a0 + sweep * v)} stroke="#f69c2f" strokeWidth="14" />
      {Array.from({ length: 41 }, (_, i) => {
        const a = a0 + (sweep * i) / 40
        const major = i % 5 === 0
        const [x1, y1] = polar(cx, cy, r - 14 - (major ? 12 : 6), a)
        const [x2, y2] = polar(cx, cy, r - 14, a)
        return <path key={i} d={`M${x1} ${y1} L${x2} ${y2}`} stroke={ink} strokeOpacity={major ? 0.8 : 0.35} strokeWidth={major ? 2 : 1} pathLength={1} style={stagger(1 + (i % 8))} />
      })}
      <g style={{ transform: `rotate(${(a0 + sweep * v) * (180 / Math.PI)}deg)`, transformOrigin: `${cx}px ${cy}px`, transition: 'transform 0.6s cubic-bezier(0.2,0.8,0.2,1)' }}>
        <path d={`M${cx - 14} ${cy} H${cx + r - 22}`} stroke={ink} strokeWidth="3" />
      </g>
      <circle cx={cx} cy={cy} r="9" fill={light ? '#0a1a2b' : '#ffffff'} />
      <text x={cx} y="212" textAnchor="middle" fill={ink} fontSize="30" fontWeight="700">{readout}</text>
      <text x={cx} y="234" textAnchor="middle" fill={ink} fillOpacity="0.6" fontSize="13">{unit} · dial full scale {max}</text>
    </svg>
  )
}

/* ───────────────────────── contour map for the contact page ───────────────────────── */

export function ArtContour() {
  const cx = 235, cy = 175
  return (
    <svg viewBox="0 0 470 370" className="w-full" fill="none" strokeLinecap="round">
      {Array.from({ length: 10 }, (_, k) => {
        const base = 16 + k * 17
        const pts = Array.from({ length: 56 }, (_, j) => {
          const a = (j / 56) * Math.PI * 2
          const wob = 1 + 0.13 * Math.sin(3 * a + k * 0.6) + 0.07 * Math.cos(5 * a - k * 0.9)
          return polar(cx, cy, base * wob * (1 + 0.25 * Math.cos(a) * Math.cos(a)), a)
        })
        return <path key={k} d={`M${pts.map((p) => p.join(' ')).join(' L')} Z`} stroke="#8c939c" strokeOpacity={0.25 + k * 0.05} pathLength={1} style={stagger(k)} />
      })}
      <path d={`M${cx - 170} ${cy} H${cx + 170} M${cx} ${cy - 150} V${cy + 150}`} stroke="#ffffff" strokeOpacity="0.15" strokeDasharray="10 4 2 4" pathLength={1} style={stagger(6)} />
      <circle cx={cx} cy={cy} r="14" fill="#f69c2f" fillOpacity="0.25" stroke="#f69c2f" pathLength={1} style={stagger(8)} />
      <circle cx={cx} cy={cy} r="5" fill="#f69c2f" />
      <text x={cx + 22} y={cy - 8} fill="#ffffff" fontSize="15" fontWeight="700">Moradabad works</text>
      <text x={cx + 22} y={cy + 12} fill="#cbd5e1" fontSize="12">28.84° N, 78.77° E · Uttar Pradesh</text>
    </svg>
  )
}

/** Career hero: a rising stair of steps with a braided-hose line climbing it, drawn like a plan view. */
export function ArtCareer() {
  const steps = [
    { x: 40, h: 70, label: 'Learn' },
    { x: 140, h: 130, label: 'Build' },
    { x: 240, h: 190, label: 'Lead' },
  ]
  const base = 300
  return (
    <svg viewBox="0 0 470 370" className="w-full" fill="none" strokeLinecap="round" strokeLinejoin="round">
      {[60, 120, 180, 240, 300].map((y, i) => (
        <path key={y} d={`M20 ${y} H450`} stroke="#ffffff" strokeOpacity="0.07" strokeDasharray="2 6" pathLength={1} style={stagger(i)} />
      ))}
      {steps.map((st, i) => (
        <g key={st.label}>
          <rect x={st.x} y={base - st.h} width="90" height={st.h} stroke="#8c939c" strokeOpacity={0.5 + i * 0.15} fill="#ffffff" fillOpacity={0.03 + i * 0.03} pathLength={1} style={stagger(i + 2)} />
          <path d={`M${st.x} ${base - st.h} l12 -12 h90 v${st.h} l-12 12`} stroke="#8c939c" strokeOpacity="0.35" pathLength={1} style={stagger(i + 3)} />
          <text x={st.x + 45} y={base + 24} fill="#cbd5e1" fontSize="13" fontWeight="600" textAnchor="middle">{st.label}</text>
          <text x={st.x + 45} y={base - st.h / 2 + 5} fill="#ffffff" fillOpacity="0.5" fontSize="22" fontWeight="800" textAnchor="middle">0{i + 1}</text>
        </g>
      ))}
      <path d={`M25 ${base - 80} C80 ${base - 80} 90 ${base - 150} 150 ${base - 150} S 250 ${base - 215} 330 ${base - 215} S 400 ${base - 250} 435 ${base - 255}`} stroke="#f69c2f" strokeWidth="9" strokeOpacity="0.22" pathLength={1} style={stagger(6)} />
      <path d={`M25 ${base - 80} C80 ${base - 80} 90 ${base - 150} 150 ${base - 150} S 250 ${base - 215} 330 ${base - 215} S 400 ${base - 250} 435 ${base - 255}`} stroke="#f69c2f" strokeWidth="2" strokeDasharray="6 5" pathLength={1} style={stagger(7)} />
      <circle cx="435" cy={base - 255} r="14" fill="#f69c2f" fillOpacity="0.25" stroke="#f69c2f" pathLength={1} style={stagger(8)} />
      <circle cx="435" cy={base - 255} r="5" fill="#f69c2f" />
      <text x="430" y={base - 282} fill="#ffffff" fontSize="14" fontWeight="700" textAnchor="end">Grow with VEXTRA</text>
    </svg>
  )
}

/* ───────────────────────── resources: bore size drawn to scale ───────────────────────── */

const STANDARD_ID_IN = [0.25, 0.3125, 0.375, 0.5, 0.625, 0.75, 1, 1.25, 1.5, 2]
const fraction = (n: number) =>
  ({ 0.25: '1/4', 0.3125: '5/16', 0.375: '3/8', 0.5: '1/2', 0.625: '5/8', 0.75: '3/4', 1: '1', 1.25: '1-1/4', 1.5: '1-1/2', 2: '2' } as Record<number, string>)[n] ?? n.toFixed(2)

/** The computed bore (orange) against the standard hose sizes (outlines), drawn at true relative scale. */
export function BoreDiagram({ idIn }: { idIn: number }) {
  const k = 46 // px per inch of radius
  const next = STANDARD_ID_IN.find((s) => s >= idIn - 1e-6)
  return (
    <figure>
      <svg viewBox="0 0 220 220" className="mx-auto w-full max-w-[16rem]" fill="none" role="img" aria-label={`Required bore ${idIn.toFixed(2)} inches${next ? `, next standard size ${fraction(next)} inch` : ''}`}>
        {STANDARD_ID_IN.map((s) => (
          <circle key={s} cx="110" cy="110" r={(s / 2) * k * 2} stroke={s === next ? '#0c6db4' : '#0a1a2b'} strokeOpacity={s === next ? 1 : 0.18} strokeWidth={s === next ? 2 : 1} />
        ))}
        <circle cx="110" cy="110" r={Math.min(100, (idIn / 2) * k * 2)} fill="#f69c2f" fillOpacity="0.35" stroke="#f69c2f" strokeWidth="2" style={{ transition: 'r 0.4s ease' }} />
        <path d="M10 110 H210" stroke="#0a1a2b" strokeOpacity="0.2" strokeDasharray="6 4" />
      </svg>
      <figcaption className="mt-2 text-center text-xs text-slate-600">
        {next ? <>Next standard size: <span className="font-bold text-brand-blue">{fraction(next)} in</span></> : 'Larger than the 2 in size shown'}
      </figcaption>
    </figure>
  )
}

/* ───────────────────────── resources: installation diagrams ───────────────────────── */

export type PictKind = 'twist' | 'slack' | 'radius' | 'adaptor' | 'length' | 'elbow' | 'plane' | 'clamp'

/** One small line drawing per installation point: black = hose, blue = the right way, red = the mistake. */
export function HosePict({ kind }: { kind: PictKind }) {
  const hose = { stroke: '#0a1a2b', strokeWidth: 7, strokeLinecap: 'round' as const, fill: 'none' }
  const good = '#0c6db4'
  const bad = '#d2362d'
  const end = (x: number, y: number) => <rect x={x - 4} y={y - 6} width="8" height="12" rx="1.5" fill="#8c939c" />
  return (
    <svg viewBox="0 0 120 70" className="h-16 w-28 shrink-0" aria-hidden="true">
      {kind === 'twist' && (
        <>
          <path d="M10 35 C40 35 40 35 60 35 S 80 35 110 35" {...hose} />
          <path d="M44 24 C54 30 54 40 44 46 M58 24 C68 30 68 40 58 46 M72 24 C82 30 82 40 72 46" stroke={bad} strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      )}
      {kind === 'slack' && (
        <>
          <path d="M10 40 C35 40 40 22 60 22 S85 40 110 40" {...hose} />
          <path d="M10 55 H110" stroke={good} strokeWidth="1.5" strokeDasharray="3 3" />
        </>
      )}
      {kind === 'radius' && (
        <>
          <path d="M14 56 C14 14 106 14 106 56" {...hose} />
          <path d="M60 56 L106 56 M60 56 L84 22" stroke={good} strokeWidth="1.5" strokeDasharray="3 3" />
        </>
      )}
      {kind === 'adaptor' && (
        <>
          <path d="M10 18 H62 V58" {...hose} />
          <rect x="54" y="10" width="16" height="16" rx="2" fill="#8c939c" />
          <path d="M80 18 L96 18 M88 10 L96 18 L88 26" stroke={good} strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      )}
      {kind === 'length' && (
        <>
          <path d="M10 56 C20 6 100 6 110 56" {...hose} />
          <path d="M14 66 H106" stroke={good} strokeWidth="1.5" />
          <path d="M14 62 V70 M106 62 V70" stroke={good} strokeWidth="1.5" />
        </>
      )}
      {kind === 'elbow' && (
        <>
          <path d="M10 16 H46 V54 H110" {...hose} />
          <rect x="38" y="8" width="16" height="16" rx="2" fill="#8c939c" />
          <rect x="38" y="46" width="16" height="16" rx="2" fill="#8c939c" />
        </>
      )}
      {kind === 'plane' && (
        <>
          <path d="M14 56 C14 14 106 14 106 56" {...hose} />
          <path d="M20 66 L100 66 M26 62 L20 66 L26 70 M94 62 L100 66 L94 70" stroke={good} strokeWidth="1.8" fill="none" strokeLinecap="round" />
        </>
      )}
      {kind === 'clamp' && (
        <>
          <path d="M10 44 C40 44 50 24 80 24 H110" {...hose} />
          <rect x="52" y="14" width="12" height="22" rx="2" fill={good} />
          <path d="M5 62 H115" stroke="#8c939c" strokeWidth="2" />
        </>
      )}
      {end(10, kind === 'adaptor' || kind === 'elbow' ? 18 : kind === 'slack' ? 40 : kind === 'twist' ? 35 : kind === 'clamp' ? 44 : 56)}
    </svg>
  )
}

/* ───────────────────────── photo with a drawing-style caption ───────────────────────── */

export function Photo({ src, alt, caption, className = '' }: { src: string; alt: string; caption?: string; className?: string }) {
  return (
    <figure className={className}>
      <div className="overflow-hidden bg-ink">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} loading="lazy" className="h-full w-full object-cover" />
      </div>
      {caption && <figcaption className="mt-2 border-l-2 border-brand-accent pl-2 text-xs text-slate-600">{caption}</figcaption>}
    </figure>
  )
}
