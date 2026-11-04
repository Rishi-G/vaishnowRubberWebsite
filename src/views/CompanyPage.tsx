'use client'

import React from 'react'
import Link from 'next/link'
import { Check, ExternalLink, FileCheck2 } from 'lucide-react'
import type { PageRoute } from '@/types'
import { useSiteData } from '@/lib/site-context'
import { CertBadge, certKind } from '@/components/site/CertBadge'
import { ArtHose, Photo, SheetHero } from '@/components/site/graphics'

interface Props {
  onNavigate?: (route: PageRoute) => void
  onOpenEnquiry: (productId?: string) => void
}

export const CompanyPage: React.FC<Props> = ({ onOpenEnquiry }) => {
  const { company } = useSiteData()

  return (
    <div className="bg-paper">
      <SheetHero
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Company' }]}
        title="Vaishno Rubber Industries Pvt. Ltd."
        lede="Maker of VEXTRA hoses and railway rubber components, at a works in Moradabad, Uttar Pradesh."
        art={<ArtHose />}
      />

      {/* the facts, set large */}
      <section className="border-b border-slate-200 bg-white">
        <dl className="container grid divide-y divide-slate-200 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
          {[
            ['Incorporated', company.incorporated],
            ['Works area', company.landArea],
            ['Founded by', company.founders.join(' and ')],
            ['Located at', 'Moradabad, Uttar Pradesh'],
          ].map(([k, v]) => (
            <div key={k} className="px-0 py-7 sm:px-6 sm:first:pl-0">
              <dt className="text-sm text-slate-500">{k}</dt>
              <dd className="mt-1 font-display text-2xl font-bold leading-tight text-ink">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* profile beside a photo from the works */}
      <section className="container grid items-center gap-12 py-16 lg:grid-cols-12 lg:py-24">
        <div className="lg:col-span-6">
          <h2 className="font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl">A works built around rubber, steel and testing.</h2>
          <p className="mt-5 max-w-xl text-base leading-[1.75] text-slate-700">
            Vaishno Rubber Industries Pvt. Ltd. was incorporated on {company.incorporated} by {company.founders.join(' and ')}. {company.profile}
          </p>
          <p className="mt-4 max-w-xl text-base leading-[1.75] text-slate-700">
            The production unit in Moradabad (U.P.) is spread over {company.landArea.toLowerCase()}. The company also runs a laboratory (R&amp;D) that tests the quality of each batch of rubber it makes.
          </p>
        </div>
        <Photo src="/assets/photos/hose-range.jpg" alt="VEXTRA hose assemblies laid out on a pallet at the works" caption="VEXTRA hose assemblies, photographed at the works." className="lg:col-span-6" />
      </section>

      {/* strengths as statements */}
      <section className="bg-white py-16 lg:py-24">
        <div className="container">
          <h2 className="max-w-2xl font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl">Why buyers choose VEXTRA</h2>
          <ul className="mt-10 grid gap-x-12 gap-y-10 md:grid-cols-2">
            {company.strengths.map((s) => (
              <li key={s.title} className="border-l-4 border-brand-accent pl-5">
                <h3 className="font-display text-xl font-bold text-ink">{s.title}</h3>
                <p className="mt-2 max-w-md text-[15px] leading-relaxed text-slate-600">{s.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* plant, on ink */}
      <section className="bg-ink py-16 text-white lg:py-24">
        <div className="container grid items-start gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 className="font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">Manufacturing and testing</h2>
            <p className="mt-4 max-w-md text-white/70">Equipment and facilities as listed by the company.</p>
            <Photo src="/assets/photos/vestibule-label.jpg" alt="Moulded VEXTRA label with month, year and batch number on a rubber vestibule" caption="Each moulding carries the maker’s mark, month and year, and a batch number." className="mt-8 [&_figcaption]:text-white/60" />
          </div>
          <ul className="grid gap-x-10 gap-y-1 sm:grid-cols-2 lg:col-span-7">
            {company.capabilities.map((c) => (
              <li key={c} className="flex gap-3 border-t border-white/15 py-3.5 text-[15px] leading-snug text-white/85">
                <Check size={16} className="mt-0.5 shrink-0 text-brand-accent" />
                {c}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* certification */}
      <section className="container py-16 lg:py-24">
        <h2 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">Certification</h2>
        <ul className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {company.certifications.map((c) => {
            const kind = certKind(c.name)
            return (
              <li key={c.name} className="cert-card relative flex flex-col overflow-hidden border border-slate-300 bg-white p-6">
                <div className="flex items-center gap-5">
                  {kind && <CertBadge kind={kind} className="h-24 w-24 shrink-0" />}
                  <div>
                    <h3 className="font-display text-2xl font-bold text-ink">{c.name}</h3>
                    <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-slate-500">
                      <FileCheck2 size={16} className={c.status === 'verified' ? 'text-emerald-600' : 'text-slate-300'} />
                      {c.status === 'verified' ? 'Certificate on file' : 'Stated by the company'}
                    </p>
                  </div>
                </div>
                <p className="mt-4 flex-1 text-[15px] leading-relaxed text-slate-600">{c.detail}</p>
                {c.documentUrl && (
                  <a href={c.documentUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-brand-blue hover:text-brand-hover">
                    View certificate (PDF) <ExternalLink size={13} />
                  </a>
                )}
                <span className={`absolute inset-x-0 bottom-0 h-1 ${c.status === 'verified' ? 'bg-emerald-600' : 'bg-slate-200'}`} />
              </li>
            )
          })}
        </ul>
      </section>

      <section className="bg-brand-blue py-14 text-white">
        <div className="container flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">Export and technology partnerships</h2>
            <p className="mt-2 text-white/85">We are looking for technology-transfer partners in Europe, China and the USA for selected products, and welcome export enquiries.</p>
          </div>
          <Link href="/contact" className="btn btn-accent btn-lg">Start a conversation</Link>
        </div>
      </section>
    </div>
  )
}
