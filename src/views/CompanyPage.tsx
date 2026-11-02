'use client'

import React, { useRef } from 'react'
import { ExternalLink, FileCheck2 } from 'lucide-react'
import type { PageRoute } from '@/types'
import { useSiteData } from '@/lib/site-context'
import { useReveal } from '@/components/motion/useReveal'
import { PageHead } from '@/components/site/PageHead'

interface Props {
  onNavigate?: (route: PageRoute) => void
  onOpenEnquiry: (productId?: string) => void
}

export const CompanyPage: React.FC<Props> = ({ onOpenEnquiry }) => {
  const { company } = useSiteData()
  const ref = useRef<HTMLDivElement>(null)
  useReveal(ref)

  return (
    <div ref={ref} className="bg-white">
      <PageHead
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Company' }]}
        eyebrow="Company"
        title="Vaishno Rubber Industries Pvt. Ltd."
        lede="Maker of VEXTRA hoses and railway rubber components, at a works in Moradabad, Uttar Pradesh."
      />

      <section className="container grid gap-10 py-14 lg:grid-cols-12">
        <div data-reveal className="lg:col-span-7">
          <h2 className="text-2xl font-extrabold text-slate-950">Profile</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-700">
            Vaishno Rubber Industries Pvt. Ltd. was incorporated on {company.incorporated} by {company.founders.join(' and ')}. {company.profile}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-700">
            The production unit in Moradabad (U.P.) is spread over {company.landArea.toLowerCase()}. The company also operates a laboratory (R&amp;D) for testing the quality of each batch of rubber it makes.
          </p>
        </div>
        <dl data-reveal className="divide-y divide-slate-200 border-y border-slate-200 text-sm lg:col-span-5">
          {[
            ['Incorporated', company.incorporated],
            ['Founders', company.founders.join(' · ')],
            ['Works', company.landArea],
            ['Address', company.location],
          ].map(([k, v]) => (
            <div key={k} className="grid grid-cols-[7rem_1fr] gap-3 py-3">
              <dt className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-500">{k}</dt>
              <dd className="text-slate-800">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="bg-slate-50 py-14">
        <div className="container grid gap-10 lg:grid-cols-12">
          <div data-reveal className="lg:col-span-4">
            <h2 className="text-2xl font-extrabold text-slate-950">Why VEXTRA</h2>
            <p className="mt-2 text-sm text-slate-600">Five things the company stands on.</p>
          </div>
          <ol className="divide-y divide-slate-300 border-y border-slate-300 lg:col-span-8">
            {company.strengths.map((s, i) => (
              <li key={s.title} data-reveal className="grid grid-cols-[3rem_1fr] gap-3 py-4">
                <span className="font-mono text-sm text-slate-400">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{s.title}</h3>
                  <p className="mt-0.5 text-sm text-slate-600">{s.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="container grid gap-10 py-14 lg:grid-cols-12">
        <div data-reveal className="lg:col-span-5">
          <h2 className="text-2xl font-extrabold text-slate-950">Manufacturing & testing</h2>
          <p className="mt-2 text-sm text-slate-600">Equipment and facilities as listed by the company.</p>
        </div>
        <ul data-reveal className="grid gap-x-8 sm:grid-cols-2 lg:col-span-7">
          {company.capabilities.map((c) => (
            <li key={c} className="border-t border-slate-200 py-2.5 text-sm text-slate-700">{c}</li>
          ))}
        </ul>
      </section>

      <section className="border-t border-slate-200 bg-white py-14">
        <div className="container">
          <h2 data-reveal className="text-2xl font-extrabold text-slate-950">Certification</h2>
          <ul className="mt-6 grid gap-5 md:grid-cols-3">
            {company.certifications.map((c, i) => (
              <li key={c.name} data-reveal style={{ '--d': `${i * 0.08}s` } as React.CSSProperties} className="flex flex-col rounded-sm border border-slate-200 p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-extrabold text-slate-900">{c.name}</h3>
                  <FileCheck2 size={18} className={c.status === 'verified' ? 'text-emerald-600' : 'text-slate-300'} />
                </div>
                <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-slate-500">{c.status === 'verified' ? 'Certificate on file' : 'Stated by company'}</p>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">{c.detail}</p>
                {c.documentUrl && (
                  <a href={c.documentUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-brand-blue hover:text-brand-hover">
                    View certificate (PDF) <ExternalLink size={13} />
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-slate-950 py-14 text-white">
        <div className="container flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div data-reveal className="max-w-2xl">
            <h2 className="text-2xl font-extrabold text-white">Export and technology partnerships</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              We are looking for technology-transfer partners in Europe, China and the USA for selected products, and welcome export enquiries.
            </p>
          </div>
          <button onClick={() => onOpenEnquiry()} className="btn btn-accent btn-lg">Start a conversation</button>
        </div>
      </section>
    </div>
  )
}
