'use client'

import React from 'react'
import Link from 'next/link'
import { Download, MapPin, Phone, Mail } from 'lucide-react'
import type { PageRoute } from '@/types'
import { useSiteData } from '@/lib/site-context'

interface Props {
  onNavigate?: (route: PageRoute) => void
  onOpenEnquiry: (productId?: string) => void
}

const LINKS: { href: string; label: string }[] = [
  { href: '/company', label: 'Company' },
  { href: '/industries', label: 'Industries' },
  { href: '/resources', label: 'Technical resources' },
  { href: '/contact', label: 'Contact' },
]

const FAMILIES = [
  { cat: 'railway', label: 'Railway components' },
  { cat: 'hydraulic', label: 'Hydraulic hoses' },
  { cat: 'industrial', label: 'Industrial hoses' },
  { cat: 'lpg', label: 'LPG hoses' },
  { cat: 'automotive', label: 'Automotive hoses' },
]

export const SiteFooter: React.FC<Props> = ({ onOpenEnquiry }) => {
  const { company } = useSiteData()
  const iso = company.certifications.filter((c) => c.name.startsWith('ISO'))
  return (
    <footer className="border-t border-slate-800 bg-slate-950 pb-10 pt-14 text-slate-300">
      <div className="container">
        <div className="grid gap-10 border-b border-slate-800 pb-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/logo.png" alt="" className="h-10 w-auto object-contain brightness-110" />
              <div>
                <span className="block font-display text-xl font-black tracking-tight text-white">VEXTRA</span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">{company.name}</span>
              </div>
            </div>
            <p className="mt-4 max-w-md text-xs leading-relaxed text-slate-400">{company.profile}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {iso.map((c) => (
                <span key={c.name} className="rounded border border-slate-700 bg-slate-800 px-2.5 py-1 font-mono text-[10px] text-slate-300">{c.name}</span>
              ))}
              {company.certifications.filter((c) => !c.name.startsWith('ISO')).map((c) => (
                <span key={c.name} className="rounded border border-slate-700 bg-slate-800 px-2.5 py-1 font-mono text-[10px] text-slate-300">{c.name}</span>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <h4 className="mb-4 border-l-2 border-brand-blue pl-2 font-mono text-xs font-bold uppercase tracking-wider text-white">Products</h4>
            <ul className="space-y-2 text-xs">
              {FAMILIES.map((f) => (
                <li key={f.cat}><Link href={`/products?category=${f.cat}`} className="hover:text-brand-accent">{f.label}</Link></li>
              ))}
              <li><Link href="/products" className="font-semibold text-white hover:text-brand-accent">All products →</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="mb-4 border-l-2 border-brand-accent pl-2 font-mono text-xs font-bold uppercase tracking-wider text-white">Company</h4>
            <ul className="space-y-2 text-xs">
              {LINKS.map((l) => (
                <li key={l.href}><Link href={l.href} className="hover:text-brand-accent">{l.label}</Link></li>
              ))}
              <li><button onClick={() => onOpenEnquiry()} className="hover:text-brand-accent">Request a quote</button></li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h4 className="mb-4 border-l-2 border-emerald-500 pl-2 font-mono text-xs font-bold uppercase tracking-wider text-white">Works</h4>
            <ul className="space-y-3 text-xs text-slate-400">
              <li className="flex gap-2"><MapPin size={14} className="mt-0.5 shrink-0 text-brand-accent" /><span className="leading-relaxed">{company.location}</span></li>
              <li className="flex gap-2"><Phone size={14} className="shrink-0 text-brand-accent" /><a href={`tel:${company.phone.replace(/\s/g, '')}`} className="font-mono text-white hover:text-brand-accent">{company.phone}</a></li>
              {company.emails.map((e) => (
                <li key={e} className="flex gap-2"><Mail size={14} className="shrink-0 text-brand-accent" /><a href={`mailto:${e}`} className="font-mono hover:text-white">{e}</a></li>
              ))}
              <li>
                <a href="/documents/vextra-hose-catalogue.pdf" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded border border-slate-700 bg-slate-800 px-3 py-2 font-semibold text-white hover:bg-slate-700">
                  <Download size={13} /> Hose catalogue (PDF)
                </a>
              </li>
            </ul>
          </div>
        </div>
        <p className="pt-8 font-mono text-xs text-slate-500">© {new Date().getFullYear()} {company.name} (VEXTRA®). All rights reserved.</p>
      </div>
    </footer>
  )
}
