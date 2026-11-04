'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Download, Search } from 'lucide-react'
import type { PageRoute, ProductCategory } from '@/types'
import { useSiteData } from '@/lib/site-context'
import { PageHead } from '@/components/site/PageHead'

interface Props {
  onNavigate?: (route: PageRoute) => void
  onOpenEnquiry: (productId?: string) => void
}

const TABS: { key: ProductCategory | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'railway', label: 'Railway components' },
  { key: 'hydraulic', label: 'Hydraulic hoses' },
  { key: 'industrial', label: 'Industrial hoses' },
  { key: 'lpg', label: 'LPG hoses' },
  { key: 'automotive', label: 'Automotive hoses' },
]

export const ProductsPage: React.FC<Props> = ({ onOpenEnquiry }) => {
  const { products } = useSiteData()
  const [cat, setCat] = useState<ProductCategory | 'all'>('all')
  const [q, setQ] = useState('')

  // deep links from the home page and menus: /products?category=railway
  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get('category')
    if (c && TABS.some((t) => t.key === c)) setCat(c as ProductCategory)
  }, [])

  const pick = (k: ProductCategory | 'all') => {
    setCat(k)
    window.history.replaceState(null, '', k === 'all' ? '/products' : `/products?category=${k}`)
  }

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return products.filter((p) => {
      if (cat !== 'all' && p.category !== cat) return false
      if (!needle) return true
      const hay = [p.name, p.standard, p.tagline, ...p.specs.map((s) => s.code)].join(' ').toLowerCase()
      return hay.includes(needle)
    })
  }, [products, cat, q])

  const count = (k: ProductCategory | 'all') => (k === 'all' ? products.length : products.filter((p) => p.category === k).length)

  return (
    <div className="bg-white">
      <PageHead
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Products' }]}
        eyebrow="Product range"
        title="Railway components and VEXTRA hoses."
        lede="Search by name, standard or product code. Hose data sheets list every size with working and burst pressure."
      />

      <div className="sticky top-[106px] z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="container flex flex-col gap-3 py-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 lg:pb-0" role="tablist" aria-label="Product family">
            {TABS.map((t) => (
              <button key={t.key} role="tab" aria-selected={cat === t.key} onClick={() => pick(t.key)}
                className={`shrink-0 rounded-sm border px-3 py-1.5 text-xs font-semibold transition-colors ${cat === t.key ? 'border-brand-blue bg-brand-blue text-white' : 'border-slate-300 text-slate-700 hover:border-brand-blue'}`}>
                {t.label} <span className="opacity-60">{count(t.key)}</span>
              </button>
            ))}
          </div>
          <label className="relative block lg:w-80">
            <span className="sr-only">Search products</span>
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, standard or code" className="w-full rounded-sm border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-blue" />
          </label>
        </div>
      </div>

      <div className="container py-8">
        <p className="mb-3 font-mono text-xs text-slate-500" aria-live="polite">{list.length} product{list.length === 1 ? '' : 's'}</p>
        <ul className="divide-y divide-slate-200 border-y border-slate-200">
          {list.length === 0 && <li className="py-10 text-sm text-slate-500">Nothing matches “{q}”. Try a standard such as “EN 853” or a code such as “02-8”.</li>}
          {list.map((p) => (
            <li key={p.id} className="grid items-center gap-4 py-4 sm:grid-cols-[6rem_1fr_auto] lg:grid-cols-[6rem_1fr_14rem_auto]">
              <Link href={`/products/${p.id}`} className="hidden aspect-[4/3] overflow-hidden rounded-sm bg-slate-100 sm:block" aria-hidden tabIndex={-1}>
                {p.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.image} alt="" loading="lazy" className="h-full w-full object-cover" />
                ) : (
                  <span className="grid h-full place-items-center bg-slate-900 font-mono text-[10px] uppercase tracking-wider text-slate-400">Railway</span>
                )}
              </Link>
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-wider text-slate-400">{p.categoryLabel}</p>
                <Link href={`/products/${p.id}`} className="text-base font-bold text-slate-900 hover:text-brand-blue">{p.name}</Link>
                <p className="mt-0.5 text-sm text-slate-600">{p.tagline}</p>
                <p className="mt-0.5 truncate font-mono text-[11px] text-slate-500">{p.standard}</p>
              </div>
              <div className="font-mono text-xs text-slate-600 lg:text-right">
                {p.kind === 'hose' ? (
                  <>
                    <p className="text-sm font-bold text-slate-900">up to {p.maxPressureBar} bar</p>
                    <p>{p.sizeRange?.split(' (')[0]}</p>
                  </>
                ) : (
                  <p>Specification on request</p>
                )}
              </div>
              <div className="flex gap-2">
                <Link href={`/products/${p.id}`} className="btn btn-primary btn-sm">Details</Link>
              </div>
            </li>
          ))}
        </ul>
        <a href="/documents/vextra-hose-catalogue.pdf" target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-brand-blue hover:text-brand-hover">
          <Download size={15} /> Download the full VEXTRA hose catalogue (PDF)
        </a>
      </div>
    </div>
  )
}
