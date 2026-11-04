'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Download, Mail, Menu, Phone, X } from 'lucide-react'
import type { PageRoute, Product } from '@/types'
import { useSiteData } from '@/lib/site-context'

interface Props {
  currentRoute: PageRoute
  onNavigate?: (route: PageRoute) => void
  onOpenEnquiry: (productId?: string) => void
}

/** Column dot colours by position; column titles and categories come from the Navigation global. */
const DOTS = ['bg-brand-blue', 'bg-brand-accent', 'bg-emerald-600', 'bg-slate-500']

const short = (p: Product) => p.name.split(' — ')[0]

export const SiteHeader: React.FC<Props> = ({ currentRoute, onOpenEnquiry }) => {
  const { products, company, settings, navigation } = useSiteData()
  // the menu is open while hovered OR pinned by a click/tap, so a click after hover never shuts it
  const [hover, setHover] = useState(false)
  const [pinned, setPinned] = useState(false)
  const mega = hover || pinned
  const closeMega = () => {
    setHover(false)
    setPinned(false)
  }
  const [drawer, setDrawer] = useState(false)
  const [open, setOpen] = useState<string | null>(navigation.megaColumns[0]?.title ?? null)
  const headerRef = useRef<HTMLElement>(null)
  const closeTimer = useRef<number | undefined>(undefined)

  const columns = useMemo(
    () =>
      navigation.megaColumns.map((c, i) => ({
        ...c,
        dot: DOTS[i % DOTS.length],
        items: products.filter((p) => c.categories.includes(p.category)),
      })),
    [products, navigation.megaColumns],
  )

  // close on route change, Escape and outside click
  useEffect(() => {
    setHover(false)
    setPinned(false)
    setDrawer(false)
  }, [currentRoute])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setHover(false)
        setPinned(false)
        setDrawer(false)
      }
    }
    const onDown = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setHover(false)
        setPinned(false)
      }
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onDown)
    }
  }, [])
  useEffect(() => {
    document.body.style.overflow = drawer ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [drawer])

  // hover intent: open fast, close with a short grace period so crossing gaps doesn't dismiss it
  const hoverOpen = () => {
    window.clearTimeout(closeTimer.current)
    setHover(true)
  }
  const hoverClose = () => {
    window.clearTimeout(closeTimer.current)
    closeTimer.current = window.setTimeout(() => setHover(false), 180)
  }

  const active = (href: string) => (currentRoute === href || currentRoute.startsWith(`${href}/`) ? 'text-brand-blue bg-blue-50/80' : 'text-slate-700 hover:text-brand-blue hover:bg-slate-50')
  const phoneHref = `tel:${company.phone.replace(/\s/g, '')}`

  return (
    <header ref={headerRef} className="fixed left-0 right-0 top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-md">
      {/* utility bar */}
      <div className="border-b border-slate-800 bg-slate-950 py-2 text-xs text-slate-300">
        <div className="container flex flex-wrap items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 font-medium">
            <strong className="uppercase tracking-wide text-white">{company.name}</strong>
            <span className="hidden text-slate-400 md:inline">| Brand: {company.brandName}®</span>
          </span>
          <span className="flex items-center gap-4 font-mono">
            <a href={phoneHref} className="flex items-center gap-1.5 text-slate-200 hover:text-brand-accent">
              <Phone size={13} className="text-brand-accent" /> {company.phone}
            </a>
            {company.emails[0] && (
              <a href={`mailto:${company.emails[0]}`} className="hidden items-center gap-1.5 text-slate-200 hover:text-white sm:flex">
                <Mail size={13} className="text-sky-400" /> {company.emails[0]}
              </a>
            )}
          </span>
        </div>
      </div>

      {/* main bar */}
      <div className="container flex h-[72px] items-center justify-between">
        <Link href="/" className="flex items-center" aria-label={`${company.brandName} — ${company.name}, home`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={settings.logoUrl} alt={`${company.brandName} — ${company.name}`} width={338} height={142} className="h-12 w-auto object-contain sm:h-14" />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          <Link href="/" className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors ${currentRoute === '/' ? 'bg-blue-50/80 text-brand-blue' : 'text-slate-700 hover:bg-slate-50 hover:text-brand-blue'}`}>
            Home
          </Link>

          <div onMouseEnter={hoverOpen} onMouseLeave={hoverClose}>
            <button
              aria-expanded={mega}
              aria-controls="mega-menu"
              aria-haspopup="true"
              onClick={() => setPinned((v) => !v)}
              className={`flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-semibold transition-colors ${currentRoute.startsWith('/products') || mega ? 'bg-blue-50/80 text-brand-blue' : 'text-slate-700 hover:bg-slate-50 hover:text-brand-blue'}`}
            >
              {navigation.productsLabel}
              <ChevronDown size={15} className={`transition-transform ${mega ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {navigation.headerLinks.map((n) => (
            <Link key={n.href} href={n.href} className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors ${active(n.href)}`}>
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button onClick={() => setDrawer(true)} className="rounded-md p-2 text-slate-700 hover:bg-slate-100 lg:hidden" aria-label="Open menu" aria-expanded={drawer}>
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* mega menu */}
      <AnimatePresence>
        {mega && (
          <motion.div
            id="mega-menu"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16 }}
            onMouseEnter={hoverOpen}
            onMouseLeave={hoverClose}
            className="absolute left-0 right-0 top-full hidden border-b border-slate-200 bg-white shadow-2xl lg:block"
          >
            <div className="container grid grid-cols-[repeat(3,1fr)_1.05fr_1fr] gap-8 py-8">
              {columns.map((c) => (
                <div key={c.title}>
                  <h3 className="mb-3 flex items-center gap-2 border-b border-slate-200 pb-2 font-display text-xs font-bold uppercase tracking-wider text-slate-900">
                    <span className={`h-2 w-2 rounded-full ${c.dot}`} />
                    {c.title}
                  </h3>
                  <ul className="space-y-0.5 text-[13px]">
                    {c.items.slice(0, c.maxItems).map((p) => (
                      <li key={p.id}>
                        <Link href={`/products/${p.id}`} className="block rounded px-1.5 py-1 font-medium text-slate-700 hover:bg-blue-50 hover:text-brand-blue">
                          {short(p)}
                        </Link>
                      </li>
                    ))}
                    <li>
                      <Link href={`/products?category=${c.categories[0]}`} onClick={closeMega} className="block px-1.5 py-1 font-bold text-brand-blue">
                        All {c.title.toLowerCase()} →
                      </Link>
                    </li>
                  </ul>
                </div>
              ))}
              <div className="flex flex-col justify-between rounded-md border border-slate-200 bg-slate-50 p-5">
                <div>
                  <span className="inline-block rounded bg-blue-100 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-brand-blue">{navigation.catalogueCard.badge}</span>
                  <h4 className="mt-2 text-sm font-bold text-slate-900">{navigation.catalogueCard.title}</h4>
                  <p className="mt-1 text-xs text-slate-600">{navigation.catalogueCard.text}</p>
                </div>
                <div className="mt-4 space-y-2 border-t border-slate-200 pt-3">
                  <Link href="/products" className="block rounded border border-slate-300 bg-white px-3 py-2 text-center text-xs font-semibold text-slate-800 hover:border-brand-blue">
                    {navigation.catalogueCard.browseLabel}
                  </Link>
                  <a href={navigation.catalogueUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 rounded bg-brand-blue px-3 py-2 text-xs font-semibold text-white hover:bg-brand-hover">
                    <Download size={13} /> {navigation.catalogueCard.downloadLabel}
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* mobile drawer */}
      <AnimatePresence>
        {drawer && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 36 }}
            className="fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-white lg:hidden"
          >
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-5">
              <span className="font-display text-xl font-extrabold">{company.brandName}</span>
              <button onClick={() => setDrawer(false)} className="rounded-md p-2 text-slate-700 hover:bg-slate-100" aria-label="Close menu">
                <X size={24} />
              </button>
            </div>
            <nav className="flex-1 px-5 py-4" aria-label="Mobile">
              <Link href="/" className="block border-b border-slate-100 py-3 text-lg font-bold text-slate-900">Home</Link>
              {columns.map((c) => (
                <div key={c.title} className="border-b border-slate-100">
                  <button onClick={() => setOpen(open === c.title ? null : c.title)} aria-expanded={open === c.title} className="flex w-full items-center justify-between py-3 text-left text-lg font-bold text-slate-900">
                    {c.title}
                    <ChevronDown size={18} className={`transition-transform ${open === c.title ? 'rotate-180' : ''}`} />
                  </button>
                  {open === c.title && (
                    <ul className="pb-3 pl-1">
                      {c.items.map((p) => (
                        <li key={p.id}>
                          <Link href={`/products/${p.id}`} className="block py-2 text-[15px] text-slate-700">{short(p)}</Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
              {navigation.headerLinks.map((n) => (
                <Link key={n.href} href={n.href} className="block border-b border-slate-100 py-3 text-lg font-bold text-slate-900">{n.label}</Link>
              ))}
            </nav>
            <div className="shrink-0 space-y-2 border-t border-slate-200 p-5">
              <a href={phoneHref} className="btn btn-secondary btn-lg w-full"><Phone size={16} /> {company.phone}</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
