'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'
import { Download, FileText } from 'lucide-react'
import type { PageRoute } from '@/types'
import { useSiteData } from '@/lib/site-context'
import { PageHead } from '@/components/site/PageHead'
import { HoseViewer } from '@/components/three/HoseViewer'
import { DemoViewer } from '@/components/three/DemoViewer'

interface Props {
  productId: string
  onNavigate?: (route: PageRoute) => void
  onOpenEnquiry: (productId?: string) => void
}

const Fact = ({ k, v }: { k: string; v?: string }) =>
  v ? (
    <div className="border-l border-slate-300 pl-4">
      <dt className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">{k}</dt>
      <dd className="mt-0.5 text-sm font-semibold text-slate-900">{v}</dd>
    </div>
  ) : null

export const ProductDetailPage: React.FC<Props> = ({ productId, onOpenEnquiry }) => {
  const { products } = useSiteData()
  const product = products.find((p) => p.id === productId)
  const related = useMemo(() => products.filter((p) => product && p.category === product.category && p.id !== product.id).slice(0, 4), [products, product])
  if (!product) return null
  const hose = product.kind === 'hose'
  const c = product.construction

  return (
    <div className="bg-white">
      <PageHead
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Products', href: '/products' }, { label: product.categoryLabel, href: `/products?category=${product.category}` }, { label: product.name }]}
        eyebrow={product.categoryLabel}
        title={product.name}
        lede={product.tagline}
      />

      <div className="container py-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <dl className="flex flex-wrap gap-x-8 gap-y-4">
            <Fact k="Standard" v={product.standard} />
            {hose && <Fact k="Max working pressure" v={`${product.maxPressureBar} bar (${product.maxPressurePsi} psi)`} />}
            {hose && <Fact k="Sizes" v={product.sizeRange} />}
            {hose && <Fact k="Temperature" v={product.temperatureRange} />}
            {!hose && <Fact k="Data" v="Specification, drawings and datasheet on request" />}
          </dl>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => onOpenEnquiry(product.id)} className="btn btn-primary">Request a quote</button>
            {hose && (
              <a href="/documents/vextra-hose-catalogue.pdf" target="_blank" rel="noopener noreferrer" className="btn btn-secondary"><Download size={15} /> Catalogue PDF</a>
            )}
          </div>
        </div>

        <div className="mt-8">
          {hose ? <HoseViewer product={product} /> : <DemoViewer slug={product.id} name={product.name} heightClass="h-[360px] sm:h-[500px]" />}
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h2 className="text-xl font-extrabold text-slate-950">Overview</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">{product.description}</p>
            {product.features.length > 0 && (
              <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-slate-700">{product.features.map((f) => <li key={f}>{f}</li>)}</ul>
            )}
            {!hose && (
              <div className="mt-6 rounded-sm border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                <p className="font-semibold text-slate-900">Technical information</p>
                <p className="mt-1">Specification, drawings and datasheets are supplied on request. Send us your requirement and we will respond with a quotation.</p>
                <button onClick={() => onOpenEnquiry(product.id)} className="btn btn-primary btn-sm mt-3">Request specification & quote</button>
              </div>
            )}
          </div>

          <div className="lg:col-span-5">
            {c && (
              <>
                <h2 className="text-xl font-extrabold text-slate-950">Construction</h2>
                <dl className="mt-2 divide-y divide-slate-200 border-y border-slate-200 text-sm">
                  {[['Tube', c.tube], ['Reinforcement', c.reinforcement], ['Cover', c.cover]].map(([k, v]) => (
                    <div key={k} className="grid grid-cols-[7rem_1fr] gap-3 py-2.5">
                      <dt className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-500">{k}</dt>
                      <dd className="text-slate-800">{v}</dd>
                    </div>
                  ))}
                  {product.recommendedFluids[0] && (
                    <div className="grid grid-cols-[7rem_1fr] gap-3 py-2.5">
                      <dt className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-500">Medium</dt>
                      <dd className="text-slate-800">{product.recommendedFluids.join(', ')}</dd>
                    </div>
                  )}
                </dl>
              </>
            )}
            {product.applications.length > 0 && (
              <>
                <h2 className="mt-8 text-xl font-extrabold text-slate-950">Applications</h2>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">{product.applications.map((a) => <li key={a}>{a}</li>)}</ul>
              </>
            )}
          </div>
        </div>

        {hose && product.specs.length > 0 && (
          <section className="mt-14" aria-labelledby="ds">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 id="ds" className="text-xl font-extrabold text-slate-950">Data sheet</h2>
              <p className="font-mono text-[11px] text-slate-500">From the VEXTRA catalogue · temperature {product.temperatureRange}</p>
            </div>
            <div className="tech-table-container mt-3">
              <table className="tech-table">
                <thead>
                  <tr>
                    <th>Code</th><th>Dash</th><th>DN</th><th>ID (in)</th><th>ID (mm)</th><th>OD (mm)</th>
                    <th>Working (bar)</th><th>Working (psi)</th><th>Min burst (bar)</th><th>Min burst (psi)</th><th>Min bend (mm)</th>
                  </tr>
                </thead>
                <tbody>
                  {product.specs.map((s) => (
                    <tr key={s.code}>
                      <td className="font-bold text-slate-900">{s.code}</td><td>{s.dashSize}</td><td>{s.dn}</td><td>{s.idInch}</td><td>{s.idMm}</td><td>{s.odMm}</td>
                      <td className="font-bold text-slate-900">{s.workingPressureBar}</td><td>{s.workingPressurePsi}</td><td>{s.burstPressureBar}</td><td>{s.burstPressurePsi}</td><td>{s.bendRadiusMm ?? '–'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500"><FileText size={13} /> Always confirm the rating for your size and service with our technical team before ordering.</p>
          </section>
        )}

        {related.length > 0 && (
          <section className="mt-14">
            <h2 className="text-xl font-extrabold text-slate-950">Related products</h2>
            <ul className="mt-3 grid gap-x-8 sm:grid-cols-2">
              {related.map((r) => (
                <li key={r.id} className="border-t border-slate-200">
                  <Link href={`/products/${r.id}`} className="flex items-baseline justify-between gap-3 py-3 text-sm hover:text-brand-blue">
                    <span className="font-semibold">{r.name}</span>
                    <span className="shrink-0 font-mono text-[11px] text-slate-500">{r.kind === 'hose' ? `${r.maxPressureBar} bar` : 'on request'}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  )
}
