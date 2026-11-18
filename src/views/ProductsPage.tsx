'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Download, LayoutGrid, List, Search } from 'lucide-react'
import type { PageRoute, ProductCategory } from '@/types'
import { useSiteData } from '@/lib/site-context'
import { PageHead } from '@/components/site/PageHead'
import { fill } from '@/lib/content'
import type { PageContent } from '@/seed/pages'

interface Props {
  content: PageContent<'products'>
  onNavigate?: (route: PageRoute) => void
  onOpenEnquiry: (productId?: string) => void
}

export const ProductsPage: React.FC<Props> = ({ content: c }) => {
  const { products, categories } = useSiteData()
  const tabs: { key: ProductCategory | 'all'; label: string }[] = [{ key: 'all', label: c.allLabel }, ...categories.map((k) => ({ key: k.slug, label: k.tabLabel }))]
  const [cat, setCat] = useState<ProductCategory | 'all'>('all')
  const [q, setQ] = useState('')
  // block view (3 per row on desktop) is the default; the visitor's choice is remembered
  const [view, setView] = useState<'grid' | 'list'>('grid')
  useEffect(() => {
    try {
      if (localStorage.getItem('vextra-products-view') === 'list') setView('list')
    } catch {
      /* storage blocked: keep the default */
    }
  }, [])
  const chooseView = (v: 'grid' | 'list') => {
    setView(v)
    try {
      localStorage.setItem('vextra-products-view', v)
    } catch {
      /* ignore */
    }
  }

  // deep links from the home page and menus: /products?category=railway
  useEffect(() => {
    const q0 = new URLSearchParams(window.location.search).get('category')
    if (q0 && categories.some((k) => k.slug === q0)) setCat(q0)
  }, [categories])

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
        eyebrow={c.hero.eyebrow}
        title={c.hero.title}
        lede={c.hero.lede}
      />

      <div className="sticky top-[106px] z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="container flex flex-col gap-3 py-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 lg:pb-0" role="tablist" aria-label="Product family">
            {tabs.map((t) => (
              <button key={t.key} role="tab" aria-selected={cat === t.key} onClick={() => pick(t.key)}
                className={`shrink-0 rounded-sm border px-3 py-1.5 text-xs font-semibold transition-colors ${cat === t.key ? 'border-brand-blue bg-brand-blue text-white' : 'border-slate-300 text-slate-700 hover:border-brand-blue'}`}>
                {t.label} <span className="opacity-60">{count(t.key)}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <label className="relative block min-w-0 flex-1 lg:w-80 lg:flex-none">
              <span className="sr-only">Search products</span>
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={c.searchPlaceholder} className="w-full rounded-sm border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-blue" />
            </label>
            <div role="group" aria-label="Product layout" className="flex shrink-0 overflow-hidden rounded-sm border border-slate-300">
              {([['grid', LayoutGrid, 'Block view'], ['list', List, 'List view']] as const).map(([k, Icon, label]) => (
                <button key={k} onClick={() => chooseView(k)} aria-pressed={view === k} aria-label={label} title={label}
                  className={`grid h-9 w-9 place-items-center transition-colors ${view === k ? 'bg-brand-blue text-white' : 'text-slate-600 hover:text-brand-blue'}`}>
                  <Icon size={16} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <p className="mb-3 font-mono text-xs text-slate-500" aria-live="polite">{list.length} product{list.length === 1 ? '' : 's'}</p>
        {view === 'grid' ? (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {list.length === 0 && <li className="col-span-full py-10 text-sm text-slate-500">{fill(c.noMatch, { q })}</li>}
            {list.map((p) => (
              <li key={p.id} className="flex flex-col overflow-hidden rounded-md border border-slate-200 bg-white transition-shadow hover:shadow-md">
                <Link href={`/products/${p.id}`} className="block aspect-[4/3] overflow-hidden bg-slate-100" aria-hidden tabIndex={-1}>
                  {p.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image} alt="" loading="lazy" className="h-full w-full object-cover" />
                  ) : (
                    <span className="grid h-full place-items-center bg-slate-900 font-mono text-xs uppercase tracking-wider text-slate-400">Railway</span>
                  )}
                </Link>
                <div className="flex flex-1 flex-col p-4">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-slate-400">{p.categoryLabel}</p>
                  <Link href={`/products/${p.id}`} className="mt-0.5 text-base font-bold leading-snug text-slate-900 hover:text-brand-blue">{p.name}</Link>
                  <p className="mt-1 text-sm text-slate-600">{p.tagline}</p>
                  <p className="mt-1 truncate font-mono text-[11px] text-slate-500">{p.standard}</p>
                  <div className="mt-auto flex items-end justify-between gap-3 pt-4">
                    <div className="font-mono text-xs text-slate-600">
                      {p.kind === 'hose' ? (
                        <>
                          <p className="text-sm font-bold text-slate-900">up to {p.maxPressureBar} bar</p>
                          <p>{p.sizeRange?.split(' (')[0]}</p>
                        </>
                      ) : (
                        <p>Specification on request</p>
                      )}
                    </div>
                    <Link href={`/products/${p.id}`} className="btn btn-primary btn-sm shrink-0">Details</Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
        <ul className="divide-y divide-slate-200 border-y border-slate-200">
          {list.length === 0 && <li className="py-10 text-sm text-slate-500">{fill(c.noMatch, { q })}</li>}
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
        )}
        <a href="/documents/vextra-hose-catalogue.pdf" target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-brand-blue hover:text-brand-hover">
          <Download size={15} /> Download the full VEXTRA hose catalogue (PDF)
        </a>
      </div>
    </div>
  )
}
