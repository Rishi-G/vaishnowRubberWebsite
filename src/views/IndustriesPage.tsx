'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { PageRoute } from '@/types'
import { useSiteData } from '@/lib/site-context'
import { ArtRail, Photo, SheetHero } from '@/components/site/graphics'
import type { PageContent } from '@/seed/pages'

interface Props {
  content: PageContent<'industries'>
  onNavigate?: (route: PageRoute) => void
  onOpenEnquiry: (productId?: string) => void
}

/** Line drawing of a gas cylinder with its hose, for the sector that has no photo yet. */
function LpgDrawing() {
  return (
    <svg viewBox="0 0 420 300" className="h-full w-full" fill="none" strokeLinecap="round" aria-hidden="true">
      <rect x="150" y="70" width="110" height="190" rx="46" stroke="#ffffff" strokeWidth="2.5" />
      <path d="M150 120 H260 M150 215 H260" stroke="#ffffff" strokeOpacity="0.35" />
      <path d="M185 70 V48 H225 V70" stroke="#ffffff" strokeWidth="2.5" />
      <rect x="196" y="34" width="18" height="14" rx="2" fill="var(--color-brand-accent)" />
      <path d="M214 41 C300 41 300 120 340 120 H395" stroke="var(--color-brand-accent)" strokeWidth="9" />
      <path d="M395 108 V132" stroke="#8c939c" strokeWidth="9" />
      <path d="M30 260 H390" stroke="#ffffff" strokeOpacity="0.25" strokeDasharray="6 6" />
      <text x="30" y="285" fill="#cbd5e1" fontSize="13">LPG hose to BS EN 1762 and IS 9573</text>
    </svg>
  )
}

export const IndustriesPage: React.FC<Props> = ({ content: c }) => {
  const { products } = useSiteData()
  return (
    <div className="bg-paper">
      <SheetHero
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Industries' }]}
        title={c.hero.title}
        lede={c.hero.lede}
        art={<ArtRail />}
      />

      {c.sectors.map((s, i) => {
        const items = products.filter((p) => p.category === s.category).slice(0, 8)
        const flip = i % 2 === 1
        return (
          <section key={s.title} className={i % 2 === 0 ? 'bg-white' : 'bg-paper'}>
            <div className="container grid items-center gap-10 py-14 lg:grid-cols-12 lg:gap-14 lg:py-20">
              <div className={`lg:col-span-7 ${flip ? 'lg:order-2' : ''}`}>
                {s.photo.src ? (
                  <Photo src={s.photo.src} alt={s.photo.alt} caption={s.photo.caption} className="[&_img]:aspect-[16/10]" />
                ) : (
                  <div className="aspect-[16/10] bg-ink p-6">
                    <LpgDrawing />
                  </div>
                )}
              </div>
              <div className={`lg:col-span-5 ${flip ? 'lg:order-1' : ''}`}>
                <h2 className="font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl">{s.title}</h2>
                <p className="mt-3 text-lg font-semibold leading-snug text-slate-800">{s.lead}</p>
                <p className="mt-3 text-[15px] leading-relaxed text-slate-600">{s.body}</p>
                <ul className="mt-6 flex flex-wrap gap-2">
                  {items.map((p) => (
                    <li key={p.id}>
                      <Link href={`/products/${p.id}`} className="inline-block border border-slate-300 bg-white px-3 py-1.5 text-[13px] font-semibold text-slate-800 transition-colors hover:border-brand-blue hover:text-brand-blue">
                        {p.name.split(' — ')[0]}
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link href={`/products?category=${s.category}`} className="mt-6 inline-flex items-center gap-1.5 font-bold text-brand-blue hover:text-brand-hover">
                  See all {s.title.toLowerCase()} products <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </section>
        )
      })}

      <section className="bg-ink py-14 text-white">
        <div className="container flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-lg leading-snug text-white/85">{c.cta.text}</p>
          <Link href={c.cta.buttonHref} className="btn btn-accent btn-lg">{c.cta.buttonLabel}</Link>
        </div>
      </section>
    </div>
  )
}
