'use client'

import React, { useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { CertBadge, certKind } from '@/components/site/CertBadge'
import { ArrowRight, Download, FileCheck2, Phone } from 'lucide-react'
import { useSiteData } from '@/lib/site-context'
import { useReveal } from '@/components/motion/useReveal'
import { DemoViewer } from '@/components/three/DemoViewer'
import type { Product, ProductCategory } from '@/types'
import { fill } from '@/lib/content'
import type { PageContent } from '@/seed/pages'

type Home = PageContent<'home'>

/* ───────────────────────── facts strip ───────────────────────── */
export function FactStrip({ c }: { c: Home['facts'] }) {
  const { company } = useSiteData()
  const vars = {
    year: company.incorporated.replace(/^\d+ /, '') || '2014',
    founders: company.founders.join(' and '),
    area: company.landArea.replace('Approximately ', '~'),
  }
  const facts = c.map((f) => ({ k: fill(f.label, vars), v: fill(f.value, vars), s: fill(f.sub, vars) }))
  return (
    <section aria-label="Company at a glance" className="border-y border-slate-200 bg-white">
      <dl className="container grid grid-cols-2 lg:grid-cols-4">
        {facts.map((f, i) => (
          <div key={f.k} className={`py-5 pr-4 ${i > 0 ? 'lg:border-l lg:border-slate-200 lg:pl-6' : ''} ${i % 2 === 1 ? 'border-l border-slate-200 pl-4 lg:pl-6' : ''}`}>
            <dt className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">{f.k}</dt>
            <dd className="mt-1 text-lg font-extrabold tracking-tight text-slate-900 sm:text-xl">{f.v}</dd>
            <dd className="mt-0.5 text-xs text-slate-500">{f.s}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

/* ───────────────────────── railway components, in action ───────────────────────── */
export function RailwayShowcase({ c }: { c: Home['railway'] }) {
  const { products, openEnquiry } = useSiteData()
  const items = useMemo(() => products.filter((p) => p.category === 'railway'), [products])
  const [slug, setSlug] = useState(items[0]?.id ?? '')
  const ref = useRef<HTMLElement>(null)
  useReveal(ref)
  const current = items.find((p) => p.id === slug) ?? items[0]
  if (!current) return null

  return (
    <section ref={ref} id="railway" className="products-section section-spacing bg-white">
      <div className="container">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] xl:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
          <div>
            <div data-reveal>
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-brand-blue">{c.eyebrow}</span>
              <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-4xl">
                {c.heading}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                {c.text}
              </p>
            </div>
            <ol className="mt-6 divide-y divide-slate-200 border-y border-slate-200" data-reveal style={{ '--d': '0.08s' } as React.CSSProperties}>
              {items.map((p, i) => (
                <li key={p.id}>
                  <button
                    onClick={() => setSlug(p.id)}
                    aria-pressed={p.id === current.id}
                    className={`flex w-full items-baseline gap-3 py-3 pr-2 text-left transition-colors ${p.id === current.id ? 'text-brand-blue' : 'text-slate-700 hover:text-slate-950'}`}
                  >
                    <span className="font-mono text-[11px] text-slate-400">{String(i + 1).padStart(2, '0')}</span>
                    <span className="text-sm font-semibold">{p.name}</span>
                    <ArrowRight size={14} className={`ml-auto shrink-0 transition-opacity ${p.id === current.id ? 'opacity-100' : 'opacity-0'}`} />
                  </button>
                </li>
              ))}
            </ol>
          </div>

          <div data-reveal style={{ '--d': '0.12s' } as React.CSSProperties}>
            <DemoViewer slug={current.id} name={current.name} heightClass="h-[340px] sm:h-[480px]" />
            <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-xl">
                <h3 className="text-lg font-bold text-slate-900">{current.name}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{current.description}</p>
              </div>
              <div className="flex gap-2">
                <Link href={`/products/${current.id}`} className="btn btn-secondary btn-sm">{c.detailsLabel}</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ───────────────────────── hose families: editorial bands ───────────────────────── */
const bar = (p: Product) => (p.maxPressureBar ? `${p.maxPressureBar} bar` : '')

export function HoseFamilies({ c }: { c: Home['hoses'] }) {
  const { products } = useSiteData()
  const ref = useRef<HTMLElement>(null)
  useReveal(ref)
  return (
    <section ref={ref} id="hoses" className="bg-slate-50 py-16 lg:py-24">
      <div className="container">
        <div data-reveal className="mb-12 max-w-2xl">
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-brand-blue">{c.eyebrow}</span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">{c.heading}</h2>
        </div>
        <div className="divide-y divide-slate-300 border-y border-slate-300">
          {c.families.map((f, i) => {
            const list = products.filter((p) => p.kind === 'hose' && f.categories.includes(p.category))
            const max = Math.max(...list.map((p) => p.maxPressureBar ?? 0))
            return (
              <div key={f.title} data-reveal className="grid items-center gap-8 py-10 lg:grid-cols-12 lg:gap-12">
                <div className={`lg:col-span-5 ${i % 2 ? 'lg:order-2' : ''}`}>
                  {f.photo.src && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={f.photo.src} alt={f.photo.alt} loading="lazy" className="aspect-[4/3] w-full rounded-sm object-cover" />
                  )}
                </div>
                <div className={`lg:col-span-7 ${i % 2 ? 'lg:order-1' : ''}`}>
                  <div className="flex items-baseline gap-4">
                    <span className="font-mono text-sm text-slate-400">{String(i + 1).padStart(2, '0')}</span>
                    <h3 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">{f.title}</h3>
                  </div>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">{f.blurb}</p>
                  <p className="mt-3 font-mono text-xs text-slate-500">{list.length} product lines · up to {max} bar working pressure</p>
                  <ul className="mt-5 grid gap-x-8 sm:grid-cols-2">
                    {list.map((p) => (
                      <li key={p.id} className="border-t border-slate-200">
                        <Link href={`/products/${p.id}`} className="group flex items-baseline justify-between gap-3 py-2 text-sm">
                          <span className="font-semibold text-slate-800 group-hover:text-brand-blue">{p.name.split(' — ')[0]}</span>
                          <span className="shrink-0 font-mono text-[11px] text-slate-500">{bar(p)}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <Link href={`/products?category=${f.categories[0]}`} className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-brand-blue hover:text-brand-hover">
                    View {f.title.toLowerCase()} <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ───────────────────────── find a hose by pressure ───────────────────────── */
export function PressureFinder({ c }: { c: Home['finder'] }) {
  const { products, categories, openEnquiry } = useSiteData()
  const hoses = useMemo(() => products.filter((p) => p.kind === 'hose'), [products])
  const top = Math.max(...hoses.map((p) => p.maxPressureBar ?? 0))
  const [need, setNeed] = useState(100)
  const [cat, setCat] = useState<ProductCategory | 'all'>('all')
  const ref = useRef<HTMLElement>(null)
  useReveal(ref)

  const matches = useMemo(
    () =>
      hoses
        .filter((p) => (p.maxPressureBar ?? 0) >= need && (cat === 'all' || p.category === cat))
        .sort((a, b) => (a.maxPressureBar ?? 0) - (b.maxPressureBar ?? 0)),
    [hoses, need, cat],
  )
  const cats: (ProductCategory | 'all')[] = ['all', ...categories.filter((k) => hoses.some((p) => p.category === k.slug)).map((k) => k.slug)]
  const shortLabel = (k: ProductCategory | 'all') => (k === 'all' ? 'all' : categories.find((x) => x.slug === k)?.shortLabel ?? k)

  return (
    <section ref={ref} className="section-spacing bg-white">
      <div className="container grid grid-cols-1 gap-10 lg:grid-cols-12">
        <div data-reveal className="min-w-0 lg:col-span-4">
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-brand-blue">{c.eyebrow}</span>
          <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-slate-950">{c.heading}</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            {c.text}
          </p>
          <label className="mt-6 block">
            <span className="flex items-baseline justify-between">
              <span className="text-xs font-semibold text-slate-700">Working pressure needed</span>
              <span className="font-mono text-2xl font-bold text-slate-950">{need} <span className="text-sm text-slate-500">bar</span></span>
            </span>
            <input type="range" min={0} max={top} step={5} value={need} onChange={(e) => setNeed(Number(e.target.value))} className="mt-2 w-full accent-brand-blue" aria-label="Working pressure needed in bar" />
            <span className="mt-1 flex justify-between font-mono text-[10px] text-slate-400"><span>0</span><span>{top} bar</span></span>
          </label>
          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Hose family">
            {cats.map((c) => (
              <button key={c} onClick={() => setCat(c)} aria-pressed={cat === c} className={`rounded-sm border px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${cat === c ? 'border-brand-blue bg-brand-blue text-white' : 'border-slate-300 text-slate-700 hover:border-brand-blue'}`}>
                {shortLabel(c)}
              </button>
            ))}
          </div>
        </div>

        <div data-reveal style={{ '--d': '0.1s' } as React.CSSProperties} className="min-w-0 lg:col-span-8">
          <p className="mb-2 font-mono text-xs text-slate-500" aria-live="polite">{matches.length} matching product line{matches.length === 1 ? '' : 's'}</p>
          <ul className="max-h-[27rem] divide-y divide-slate-200 overflow-y-auto border-y border-slate-200">
            {matches.length === 0 && <li className="py-6 text-sm text-slate-500">{fill(c.noMatch, { need: String(need) })}</li>}
            {matches.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-x-6 gap-y-2 py-3">
                <div className="min-w-0 flex-1">
                  <Link href={`/products/${p.id}`} className="text-sm font-bold text-slate-900 hover:text-brand-blue">{p.name}</Link>
                  <p className="truncate font-mono text-[11px] text-slate-500">{p.standard}</p>
                </div>
                <span className="font-mono text-sm font-bold text-slate-900">{p.maxPressureBar} bar</span>
                <span className="hidden w-44 font-mono text-[11px] text-slate-500 md:block">{p.temperatureRange?.split(' (')[0]}</span>
                <Link href={`/products/${p.id}`} className="btn btn-secondary btn-sm">Details</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

/* ───────────────────────── customers ───────────────────────── */
export function Customers({ c }: { c: Home['customers'] }) {
  const { company } = useSiteData()
  const ref = useRef<HTMLElement>(null)
  useReveal(ref)
  const groups = useMemo(() => {
    const m = new Map<string, string[]>()
    company.customers.forEach((c) => m.set(c.group, [...(m.get(c.group) ?? []), c.name]))
    return [...m.entries()]
  }, [company.customers])
  return (
    <section ref={ref} className="section-spacing border-t border-slate-200 bg-white">
      <div className="container grid grid-cols-1 gap-10 lg:grid-cols-12">
        <div data-reveal className="min-w-0 lg:col-span-4">
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-brand-blue">{c.eyebrow}</span>
          <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-slate-950">{c.heading}</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">{c.text}</p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:col-span-8">
          {groups.map(([group, names], i) => (
            <div key={group} data-reveal style={{ '--d': `${i * 0.08}s` } as React.CSSProperties}>
              <h3 className="border-b border-slate-900 pb-2 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-slate-900">{group}</h3>
              <ul className="mt-2 divide-y divide-slate-100">
                {names.map((n) => (
                  <li key={n} className="py-1.5 text-sm text-slate-700">{n}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ───────────────────────── the works (dark, deliberate) ───────────────────────── */
export function Works({ c }: { c: Home['works'] }) {
  const { company } = useSiteData()
  const ref = useRef<HTMLElement>(null)
  useReveal(ref)
  return (
    <section ref={ref} className="bg-slate-950 py-16 text-white lg:py-24">
      <div className="container grid grid-cols-1 gap-12 lg:grid-cols-12">
        <div data-reveal className="lg:col-span-6">
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-brand-accent">{c.eyebrow}</span>
          <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">{c.heading}</h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-300">{company.profile}</p>
          <p className="mt-4 font-mono text-xs text-slate-400">{company.location}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/company" className="btn btn-primary btn-sm">{c.aboutLabel} <ArrowRight size={14} /></Link>
            <Link href="/contact" className="btn btn-sm border-slate-600 bg-transparent text-white hover:border-white">{c.contactLabel}</Link>
          </div>
        </div>
        <div className="lg:col-span-6">
          <h3 data-reveal className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">{c.capabilitiesHeading}</h3>
          <ul data-reveal className="mt-3 grid gap-x-8 sm:grid-cols-2">
            {company.capabilities.map((c) => (
              <li key={c} className="border-t border-slate-800 py-2 text-[13px] leading-snug text-slate-300">{c}</li>
            ))}
          </ul>
          <h3 data-reveal className="mt-8 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">{c.certificationHeading}</h3>
          <ul data-reveal className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {company.certifications.map((c) => {
              const kind = certKind(c.name)
              return (
                <li key={c.name} className="cert-card flex items-center gap-3 rounded-sm border border-slate-800 p-3">
                  {kind && <CertBadge kind={kind} className="h-16 w-16 shrink-0" />}
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white">{c.name}</p>
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
                      <FileCheck2 size={12} className={c.status === 'verified' ? 'text-emerald-400' : 'text-slate-500'} />
                      {c.status === 'verified' ? 'Certificate on file' : 'Stated by company'}
                    </p>
                    {c.documentUrl && (
                      <a href={c.documentUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-xs font-semibold text-brand-accent hover:underline">View certificate (PDF)</a>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}

/* ───────────────────────── quote band ───────────────────────── */
export function QuoteBand({ c }: { c: Home['quote'] }) {
  const { company, navigation } = useSiteData()
  const ref = useRef<HTMLElement>(null)
  useReveal(ref)
  return (
    <section ref={ref} className="bg-brand-blue py-14 text-white">
      <div className="container flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div data-reveal className="max-w-2xl">
          <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">{c.heading}</h2>
          <p className="mt-2 text-sm text-blue-100">{c.text}</p>
        </div>
        <div data-reveal className="flex flex-wrap gap-3">
          <Link href="/contact" className="btn btn-accent btn-lg">{c.contactLabel} <ArrowRight size={16} /></Link>
          <a href={navigation.catalogueUrl} target="_blank" rel="noopener noreferrer" className="btn btn-lg border-white/40 bg-transparent text-white hover:border-white hover:bg-white/10"><Download size={16} /> {c.catalogueLabel}</a>
          <a href={`tel:${company.phone.replace(/\s/g, '')}`} className="btn btn-lg border-white/40 bg-transparent text-white hover:border-white hover:bg-white/10"><Phone size={16} /> {company.phone}</a>
        </div>
      </div>
    </section>
  )
}
