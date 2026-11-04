'use client'

import React, { useState } from 'react'
import { CheckCircle2, Mail, MapPin, Phone, Send } from 'lucide-react'
import type { PageRoute } from '@/types'
import { useSiteData } from '@/lib/site-context'
import { submitEnquiry } from '@/lib/submitEnquiry'
import { ArtContour, SheetHero } from '@/components/site/graphics'

interface Props {
  onNavigate?: (route: PageRoute) => void
  onOpenEnquiry: (productId?: string) => void
}

const SUBJECTS = ['General enquiry', 'Railway components', 'Hose or hose assembly', 'Export / technology partnership', 'Other']

const field = 'mt-1 w-full border-0 border-b-2 border-slate-300 bg-transparent px-0 py-2.5 text-base text-ink outline-none transition-colors focus:border-brand-blue'

export const ContactPage: React.FC<Props> = ({ onOpenEnquiry }) => {
  const { company } = useSiteData()
  const [name, setName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [subject, setSubject] = useState(SUBJECTS[0])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    // success is only shown once the server confirms the enquiry was stored
    const result = await submitEnquiry({ type: 'contact', fullName: name, companyName, email, phone, subject, notes: message }, { phone: company.phone, email: company.emails[0] ?? '' })
    setLoading(false)
    if (result.ok) setSent(true)
    else setError(result.message)
  }

  return (
    <div className="bg-paper">
      <SheetHero
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Contact' }]}
        title="Talk to the Moradabad works."
        lede="Send a requirement, specification or drawing for a quotation, or ask about export and technology partnerships."
        art={<ArtContour />}
      />

      <div className="container grid gap-12 py-14 lg:grid-cols-12 lg:py-20">
        {/* laid out like the title block on a drawing: ruled cells, one fact each */}
        <aside className="lg:col-span-5">
          <dl className="border-2 border-ink bg-white">
            <div className="flex gap-4 border-b-2 border-ink p-5">
              <MapPin size={22} className="mt-0.5 shrink-0 text-brand-accent" />
              <div>
                <dt className="text-sm font-semibold text-slate-500">Works</dt>
                <dd className="mt-1 text-[15px] leading-relaxed text-ink">{company.name}<br />{company.location}</dd>
                {company.mapUrl && <dd><a href={company.mapUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm font-semibold text-brand-blue hover:underline">Open in Google Maps →</a></dd>}
                {company.businessHours && <dd className="mt-2 text-sm text-slate-600">{company.businessHours}</dd>}
              </div>
            </div>
            <div className="grid sm:grid-cols-2">
              <div className="flex gap-4 border-b-2 border-ink p-5 sm:border-r-2">
                <Phone size={22} className="mt-0.5 shrink-0 text-brand-blue" />
                <div>
                  <dt className="text-sm font-semibold text-slate-500">Phone</dt>
                  <dd><a href={`tel:${company.phone.replace(/\s/g, '')}`} className="mt-1 block font-display text-lg font-bold text-ink hover:text-brand-blue">{company.phone}</a></dd>
                  {company.whatsapp && <dd><a href={`https://wa.me/${company.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-sm font-semibold text-brand-blue hover:underline">WhatsApp</a></dd>}
                </div>
              </div>
              <div className="flex gap-4 border-b-2 border-ink p-5">
                <Mail size={22} className="mt-0.5 shrink-0 text-brand-blue" />
                <div className="min-w-0">
                  <dt className="text-sm font-semibold text-slate-500">Email</dt>
                  {company.emails.map((e) => (
                    <dd key={e}><a href={`mailto:${e}`} className="mt-1 block break-all text-[15px] font-semibold text-ink hover:text-brand-blue">{e}</a></dd>
                  ))}
                </div>
              </div>
            </div>
            <div className="bg-ink p-5 text-white">
              <p className="font-display text-lg font-bold text-white">Have a product and size in mind?</p>
              <p className="mt-1 text-sm leading-relaxed text-white/70">Put the product, size and working pressure in your message.</p>
            </div>
          </dl>
        </aside>

        <section className="lg:col-span-7" aria-labelledby="msg">
          <h2 id="msg" className="font-display text-3xl font-bold tracking-tight text-ink">Send a message</h2>
          {sent ? (
            <div role="status" className="mt-6 border-l-4 border-emerald-600 bg-white p-8">
              <CheckCircle2 size={32} className="text-emerald-600" />
              <h3 className="mt-3 font-display text-xl font-bold text-ink">Thank you, your message has been received.</h3>
              <p className="mt-1 text-slate-600">Our sales team will get back to you. For anything urgent, call {company.phone}.</p>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-2">
              <label className="text-sm font-semibold text-slate-700">Full name *
                <input required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={field} />
              </label>
              <label className="text-sm font-semibold text-slate-700">Company
                <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} autoComplete="organization" className={field} />
              </label>
              <label className="text-sm font-semibold text-slate-700">Email *
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="you@company.com" className={field} />
              </label>
              <label className="text-sm font-semibold text-slate-700">Phone
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" className={field} />
              </label>
              <label className="text-sm font-semibold text-slate-700 sm:col-span-2">Subject
                <select value={subject} onChange={(e) => setSubject(e.target.value)} className={field}>
                  {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </label>
              <label className="text-sm font-semibold text-slate-700 sm:col-span-2">Message *
                <textarea required rows={6} value={message} onChange={(e) => setMessage(e.target.value)} className={`${field} resize-y border-2 px-3`} />
              </label>
              {error && <p role="alert" className="text-sm font-semibold text-red-600 sm:col-span-2">{error}</p>}
              <div className="flex items-center justify-between sm:col-span-2">
                <span className="text-xs text-slate-500">* required</span>
                <button type="submit" disabled={loading} className="btn btn-primary btn-lg">
                  {loading ? 'Sending…' : 'Send message'} <Send size={16} />
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </div>
  )
}
