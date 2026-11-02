'use client'

import React, { useRef } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { PageRoute } from '@/types'
import { useSiteData } from '@/lib/site-context'
import { useReveal } from '@/components/motion/useReveal'
import { PageHead } from '@/components/site/PageHead'

interface Props {
  onNavigate?: (route: PageRoute) => void
  onOpenEnquiry: (productId?: string) => void
}

const SECTORS = [
  {
    title: 'Railways',
    lead: 'Our core market: Indian Railways, its production units and railway OEMs.',
    body: 'Elastomeric pads, air brake hose couplings (BP & FP), inter-car gangway mountings, UIC elastomer flange connections, bonded items for FIAT bogies, PU side bearers, elastic rings and spheriblocs — plus hydraulic hoses and assemblies.',
    category: 'railway',
  },
  {
    title: 'Earthmoving & heavy equipment',
    lead: 'High-pressure hydraulic hoses and hose assemblies for earthmovers.',
    body: 'SAE 100 R1 and R2, SH33 extra-high-pressure, jack and loader hoses, with end fittings and adapters.',
    category: 'hydraulic',
  },
  {
    title: 'Oil & gas distribution',
    lead: 'LPG hoses and hose assemblies for PSU oil companies and OEMs.',
    body: 'LPG hoses to BS EN 1762 Type-D and IS 9573 Type-I and Type-II.',
    category: 'lpg',
  },
] as const

export const IndustriesPage: React.FC<Props> = ({ onOpenEnquiry }) => {
  const { products } = useSiteData()
  const ref = useRef<HTMLDivElement>(null)
  useReveal(ref)
  return (
    <div ref={ref} className="bg-white">
      <PageHead
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Industries' }]}
        eyebrow="Industries"
        title="Where VEXTRA products work."
        lede="The sectors we supply today, and the products we make for each."
      />
      <div className="container divide-y divide-slate-200 py-6">
        {SECTORS.map((s, i) => {
          const items = products.filter((p) => p.category === s.category).slice(0, 6)
          return (
            <section key={s.title} data-reveal className="grid gap-6 py-10 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <span className="font-mono text-sm text-slate-400">{String(i + 1).padStart(2, '0')}</span>
                <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">{s.title}</h2>
                <p className="mt-2 text-sm font-semibold text-slate-800">{s.lead}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.body}</p>
                <Link href={`/products?category=${s.category}`} className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-brand-blue hover:text-brand-hover">
                  See the products <ArrowRight size={14} />
                </Link>
              </div>
              <ul className="grid gap-x-8 self-start sm:grid-cols-2 lg:col-span-7">
                {items.map((p) => (
                  <li key={p.id} className="border-t border-slate-200">
                    <Link href={`/products/${p.id}`} className="block py-2.5 text-sm font-semibold text-slate-800 hover:text-brand-blue">{p.name.split(' — ')[0]}</Link>
                  </li>
                ))}
              </ul>
            </section>
          )
        })}
      </div>
      <div className="bg-slate-50 py-12">
        <div className="container flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-sm text-slate-700">Working in a sector not listed here, such as defence? Tell us the requirement — we will say whether we can supply it.</p>
          <button onClick={() => onOpenEnquiry()} className="btn btn-primary">Send an enquiry</button>
        </div>
      </div>
    </div>
  )
}
