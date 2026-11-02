import React from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export interface Crumb {
  label: string
  href?: string
}

/** Breadcrumb + page title block used by the inner pages. */
export function PageHead({ crumbs, eyebrow, title, lede }: { crumbs: Crumb[]; eyebrow?: string; title: string; lede?: string }) {
  return (
    <div className="border-b border-slate-200 bg-white pb-10 pt-32">
      <div className="container">
        <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1.5 font-mono text-xs text-slate-500">
          {crumbs.map((c, i) => (
            <React.Fragment key={c.label}>
              {i > 0 && <ChevronRight size={12} className="text-slate-300" />}
              {c.href ? <Link href={c.href} className="hover:text-brand-blue">{c.label}</Link> : <span className="text-slate-800">{c.label}</span>}
            </React.Fragment>
          ))}
        </nav>
        {eyebrow && <span className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-brand-blue">{eyebrow}</span>}
        <h1 className="mt-2 max-w-4xl text-3xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-5xl">{title}</h1>
        {lede && <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600">{lede}</p>}
      </div>
    </div>
  )
}
