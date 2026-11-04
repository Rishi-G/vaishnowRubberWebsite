'use client'

import React from 'react'
import Link from 'next/link'
import { Clock, Download, MapPin, MessageCircle, Phone, Mail } from 'lucide-react'
import type { PageRoute } from '@/types'
import { useSiteData } from '@/lib/site-context'

interface Props {
  onNavigate?: (route: PageRoute) => void
  onOpenEnquiry: (productId?: string) => void
}

const SOCIAL_LABELS: Record<string, string> = { linkedin: 'LinkedIn', facebook: 'Facebook', instagram: 'Instagram', youtube: 'YouTube', x: 'X' }

export const SiteFooter: React.FC<Props> = ({ onOpenEnquiry }) => {
  const { company, settings, navigation } = useSiteData()
  const iso = company.certifications.filter((c) => c.name.startsWith('ISO'))
  return (
    <footer className="border-t border-slate-800 bg-slate-950 pb-10 pt-14 text-slate-300">
      <div className="container">
        <div className="grid gap-10 border-b border-slate-800 pb-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            {settings.logoLightUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={settings.logoLightUrl} alt={`${company.brandName} — ${company.name}`} width={338} height={142} className="h-12 w-auto object-contain" />
            ) : (
              <div className="inline-block rounded-md bg-white px-3 py-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={settings.logoUrl} alt={`${company.brandName} — ${company.name}`} width={338} height={142} className="h-12 w-auto object-contain" />
              </div>
            )}
            {settings.tagline && <p className="mt-4 text-sm font-semibold text-white">{settings.tagline}</p>}
            <p className="mt-4 max-w-md text-xs leading-relaxed text-slate-400">{company.profile}</p>
            {company.socials.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-3 text-xs">
                {company.socials.map((sl) => (
                  <li key={sl.platform}><a href={sl.url} target="_blank" rel="noopener noreferrer" className="text-white hover:text-brand-accent">{SOCIAL_LABELS[sl.platform] ?? sl.platform}</a></li>
                ))}
              </ul>
            )}
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
            <h4 className="mb-4 border-l-2 border-brand-blue pl-2 font-mono text-xs font-bold uppercase tracking-wider text-white">{navigation.footerProductsHeading}</h4>
            <ul className="space-y-2 text-xs">
              {navigation.footerProductLinks.map((l) => (
                <li key={l.href}><Link href={l.href} className="hover:text-brand-accent">{l.label}</Link></li>
              ))}
              <li><Link href="/products" className="font-semibold text-white hover:text-brand-accent">All products →</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="mb-4 border-l-2 border-brand-accent pl-2 font-mono text-xs font-bold uppercase tracking-wider text-white">{navigation.footerCompanyHeading}</h4>
            <ul className="space-y-2 text-xs">
              {navigation.footerCompanyLinks.map((l) => (
                <li key={l.href}><Link href={l.href} className="hover:text-brand-accent">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h4 className="mb-4 border-l-2 border-emerald-500 pl-2 font-mono text-xs font-bold uppercase tracking-wider text-white">{navigation.footerContactHeading}</h4>
            <ul className="space-y-3 text-xs text-slate-400">
              <li className="flex gap-2"><MapPin size={14} className="mt-0.5 shrink-0 text-brand-accent" /><span className="leading-relaxed">{company.location}{company.mapUrl && <> · <a href={company.mapUrl} target="_blank" rel="noopener noreferrer" className="text-white hover:text-brand-accent">Map</a></>}</span></li>
              <li className="flex gap-2"><Phone size={14} className="shrink-0 text-brand-accent" /><a href={`tel:${company.phone.replace(/\s/g, '')}`} className="font-mono text-white hover:text-brand-accent">{company.phone}</a></li>
              {company.whatsapp && (
                <li className="flex gap-2"><MessageCircle size={14} className="shrink-0 text-brand-accent" /><a href={`https://wa.me/${company.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-white">WhatsApp</a></li>
              )}
              {company.businessHours && (
                <li className="flex gap-2"><Clock size={14} className="shrink-0 text-brand-accent" /><span>{company.businessHours}</span></li>
              )}
              {company.emails.map((e) => (
                <li key={e} className="flex gap-2"><Mail size={14} className="shrink-0 text-brand-accent" /><a href={`mailto:${e}`} className="font-mono hover:text-white">{e}</a></li>
              ))}
              <li>
                <a href={navigation.catalogueUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded border border-slate-700 bg-slate-800 px-3 py-2 font-semibold text-white hover:bg-slate-700">
                  <Download size={13} /> {navigation.footerCatalogueLabel}
                </a>
              </li>
            </ul>
          </div>
        </div>
        <p className="pt-8 font-mono text-xs text-slate-500">© {new Date().getFullYear()} {company.name} ({company.brandName}®). All rights reserved.</p>
      </div>
    </footer>
  )
}
