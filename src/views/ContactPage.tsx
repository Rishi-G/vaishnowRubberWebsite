'use client'

import React, { useState } from 'react'
import { CheckCircle2, Mail, MapPin, Phone, Send, Wrench } from 'lucide-react'
import type { PageRoute } from '@/types'
import { useSiteData } from '@/lib/site-context'
import { submitEnquiry } from '@/lib/submitEnquiry'
import { PageHead } from '@/components/site/PageHead'

interface Props {
  onNavigate?: (route: PageRoute) => void
  onOpenEnquiry: (productId?: string) => void
}

const SUBJECTS = ['General enquiry', 'Railway components', 'Hose or hose assembly', 'Export / technology partnership', 'Other']

const field = 'mt-1 w-full rounded-sm border border-slate-300 bg-white p-2.5 text-sm outline-none focus:border-brand-blue'

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
    const result = await submitEnquiry({ type: 'contact', fullName: name, companyName, email, phone, subject, notes: message })
    setLoading(false)
    if (result.ok) setSent(true)
    else setError(result.message)
  }

  return (
    <div className="bg-white">
      <PageHead
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Contact' }]}
        eyebrow="Contact sales"
        title="Talk to the Moradabad works."
        lede="Send a requirement, specification or drawing for a quotation — or ask about export and technology partnerships."
      />

      <div className="container grid gap-10 py-12 lg:grid-cols-12">
        <aside className="space-y-6 lg:col-span-4">
          <dl className="divide-y divide-slate-200 border-y border-slate-200 text-sm">
            <div className="flex gap-3 py-4">
              <MapPin size={18} className="mt-0.5 shrink-0 text-brand-accent" />
              <div>
                <dt className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-500">Works</dt>
                <dd className="mt-1 leading-relaxed text-slate-800">{company.name}<br />{company.location}</dd>
              </div>
            </div>
            <div className="flex gap-3 py-4">
              <Phone size={18} className="mt-0.5 shrink-0 text-brand-blue" />
              <div>
                <dt className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-500">Phone</dt>
                <dd><a href={`tel:${company.phone.replace(/\s/g, '')}`} className="mt-1 block font-mono font-bold text-slate-900 hover:text-brand-blue">{company.phone}</a></dd>
              </div>
            </div>
            <div className="flex gap-3 py-4">
              <Mail size={18} className="mt-0.5 shrink-0 text-brand-blue" />
              <div>
                <dt className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-500">Email</dt>
                {company.emails.map((e) => (
                  <dd key={e}><a href={`mailto:${e}`} className="mt-1 block font-mono text-slate-900 hover:text-brand-blue">{e}</a></dd>
                ))}
              </div>
            </div>
          </dl>
          <div className="rounded-sm bg-slate-950 p-5 text-white">
            <p className="text-sm font-bold">Have a product and size in mind?</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-300">Use the quote form to specify product, size and working pressure.</p>
            <button onClick={() => onOpenEnquiry()} className="btn btn-primary btn-sm mt-3"><Wrench size={14} /> Request a quote</button>
          </div>
        </aside>

        <section className="lg:col-span-8" aria-labelledby="msg">
          <h2 id="msg" className="text-xl font-extrabold text-slate-950">Send a message</h2>
          {sent ? (
            <div role="status" className="mt-4 rounded-sm border border-emerald-200 bg-emerald-50 p-8 text-center">
              <CheckCircle2 size={32} className="mx-auto text-emerald-600" />
              <h3 className="mt-3 text-lg font-bold text-slate-900">Thank you — your message has been received.</h3>
              <p className="mt-1 text-sm text-slate-600">Our sales team will get back to you. For anything urgent, call {company.phone}.</p>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="text-xs font-semibold text-slate-700">Full name *
                <input required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={field} />
              </label>
              <label className="text-xs font-semibold text-slate-700">Company
                <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} autoComplete="organization" className={field} />
              </label>
              <label className="text-xs font-semibold text-slate-700">Email *
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="you@company.com" className={field} />
              </label>
              <label className="text-xs font-semibold text-slate-700">Phone
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" className={field} />
              </label>
              <label className="text-xs font-semibold text-slate-700 sm:col-span-2">Subject
                <select value={subject} onChange={(e) => setSubject(e.target.value)} className={field}>
                  {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </label>
              <label className="text-xs font-semibold text-slate-700 sm:col-span-2">Message *
                <textarea required rows={6} value={message} onChange={(e) => setMessage(e.target.value)} className={field} />
              </label>
              {error && <p role="alert" className="text-sm font-semibold text-red-600 sm:col-span-2">{error}</p>}
              <div className="flex items-center justify-between sm:col-span-2">
                <span className="text-[11px] text-slate-500">* required</span>
                <button type="submit" disabled={loading} className="btn btn-primary">
                  {loading ? 'Sending…' : 'Send message'} <Send size={14} />
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </div>
  )
}
