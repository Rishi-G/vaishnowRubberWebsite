'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { PageContent } from '@/seed/pages'

export type HeroContent = PageContent<'home'>['hero']

/** "Hoses for *Indian Railways* and industry" → the starred words in brand blue. */
function Highlighted({ text }: { text: string }) {
  return (
    <>
      {text.split('*').map((part, i) => (i % 2 ? <span key={i} className="text-brand-blue">{part}</span> : part))}
    </>
  )
}

/** Banner intro shared by the hose and railway heroes. */
export function HeroIntro({ hero, tabs, primaryHref, primaryLabel }: { hero: HeroContent; tabs: React.ReactNode; primaryHref: string; primaryLabel: string }) {
  return (
    <div className="pt-2 lg:pt-6">
      <span className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-brand-blue">{hero.eyebrow}</span>
      <h1 className="mt-3 text-[1.7rem] font-extrabold leading-[1.08] tracking-tight text-slate-950 sm:text-5xl xl:text-6xl">
        <Highlighted text={hero.heading} />
      </h1>
      <p className="mt-4 hidden max-w-lg text-sm leading-relaxed text-slate-600 sm:block sm:text-base">{hero.text}</p>
      {tabs}
      <div className="mt-4 flex gap-2 sm:mt-6 sm:gap-3">
        <Link href={primaryHref} className="btn btn-primary btn-sm sm:px-7 sm:py-4 sm:text-base">
          {primaryLabel}
          <ArrowRight size={16} />
        </Link>
        <Link href="/contact" className="btn btn-secondary btn-sm sm:px-7 sm:py-4 sm:text-base">
          {hero.secondaryLabel}
        </Link>
      </div>
    </div>
  )
}
