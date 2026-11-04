'use client'

import React, { useRef, useState } from 'react'
import { Briefcase, CheckCircle2, FileUp, Send, ShieldCheck, Sprout, Target, Wrench } from 'lucide-react'
import type { PageRoute } from '@/types'
import { useSiteData } from '@/lib/site-context'
import { fill } from '@/lib/content'
import { submitApplication, resumeProblem } from '@/lib/submitApplication'
import { ArtCareer, SheetHero } from '@/components/site/graphics'
import type { PageContent } from '@/seed/pages'

interface Props {
  content: PageContent<'career'>
  onNavigate?: (route: PageRoute) => void
  onOpenEnquiry: (productId?: string) => void
}

const field = 'mt-1 w-full border-0 border-b-2 border-slate-300 bg-transparent px-0 py-2.5 text-base text-ink outline-none transition-colors focus:border-brand-blue'
const WHY_ICONS = [Wrench, Target, ShieldCheck, Sprout]

export const CareerPage: React.FC<Props> = ({ content: c }) => {
  const { company } = useSiteData()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [note, setNote] = useState('')
  const [resume, setResume] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const tokens = { landArea: company.landArea, phone: company.phone, email: company.emails[0] ?? '' }

  const pick = (f: File | null) => {
    const problem = f ? resumeProblem(f) : ''
    setError(problem)
    setResume(problem ? null : f)
    if (problem && fileRef.current) fileRef.current.value = ''
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const problem = resumeProblem(resume)
    if (problem || !resume) return setError(problem)
    setLoading(true)
    setError('')
    const result = await submitApplication({ fullName: name, email, phone, coverNote: note, resume }, { phone: company.phone, email: company.emails[0] ?? '' })
    setLoading(false)
    if (result.ok) setSent(true)
    else setError(result.message)
  }

  return (
    <div className="bg-paper">
      <SheetHero crumbs={[{ label: 'Home', href: '/' }, { label: 'Career' }]} title={c.hero.title} lede={c.hero.lede} art={<ArtCareer />} />

      <section aria-label="Company in numbers" className="border-b-2 border-ink bg-white">
        <dl className="container grid divide-y-2 divide-ink sm:grid-cols-3 sm:divide-x-2 sm:divide-y-0">
          {c.stats.map((s) => (
            <div key={s.label} className="px-2 py-6 sm:px-8">
              <dd className="font-display text-3xl font-bold text-ink">{fill(s.value, tokens)}</dd>
              <dt className="mt-1 text-sm font-semibold text-slate-500">{s.label}</dt>
            </div>
          ))}
        </dl>
      </section>

      <section className="container py-14 lg:py-20">
        <h2 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">{c.why.heading}</h2>
        <p className="mt-2 max-w-xl text-slate-600">{c.why.text}</p>
        <ul className="mt-10 grid gap-px border border-slate-300 bg-slate-300 sm:grid-cols-2 lg:grid-cols-4">
          {c.why.items.map((it, i) => {
            const Icon = WHY_ICONS[i % WHY_ICONS.length]
            return (
              <li key={it.title} className="bg-white p-6">
                <Icon size={28} className="text-brand-blue" />
                <h3 className="mt-4 font-display text-lg font-bold text-ink">{it.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-slate-600">{it.text}</p>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="bg-ink py-14 text-white lg:py-20">
        <div className="container">
          <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">{c.roles.heading}</h2>
          <p className="mt-2 max-w-xl text-white/70">{c.roles.text}</p>
          <ul className="mt-10 grid gap-x-12 md:grid-cols-2 lg:grid-cols-3">
            {c.roles.items.map((r) => (
              <li key={r.title} className="flex gap-4 border-t border-white/15 py-5">
                <Briefcase size={20} className="mt-1 shrink-0 text-brand-accent" />
                <div>
                  <h3 className="font-display text-lg font-bold text-white">{r.title}</h3>
                  <p className="mt-1 text-[15px] leading-relaxed text-white/65">{r.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="container grid gap-12 py-14 lg:grid-cols-12 lg:py-20">
        <aside className="lg:col-span-5">
          <h2 className="font-display text-3xl font-bold tracking-tight text-ink">{c.process.heading}</h2>
          <ol className="mt-8 border-l-2 border-ink">
            {c.process.items.map((s, i) => (
              <li key={s.title} className="relative pb-8 pl-8 last:pb-0">
                <span className="absolute -left-[15px] top-0 flex h-7 w-7 items-center justify-center bg-ink font-mono text-xs font-bold text-white">{i + 1}</span>
                <h3 className="font-display text-lg font-bold text-ink">{s.title}</h3>
                <p className="mt-1 text-[15px] leading-relaxed text-slate-600">{s.text}</p>
              </li>
            ))}
          </ol>
        </aside>

        <section id="apply" className="scroll-mt-28 lg:col-span-7" aria-labelledby="apply-h">
          <div className="border-2 border-ink bg-white p-6 sm:p-8">
            <h2 id="apply-h" className="font-display text-3xl font-bold tracking-tight text-ink">{c.form.heading}</h2>
            <p className="mt-1 text-slate-600">{c.form.text}</p>
            {sent ? (
              <div role="status" className="mt-6 border-l-4 border-emerald-600 bg-emerald-50/50 p-6">
                <CheckCircle2 size={32} className="text-emerald-600" />
                <h3 className="mt-3 font-display text-xl font-bold text-ink">{c.form.successTitle}</h3>
                <p className="mt-1 text-slate-600">{fill(c.form.successText, tokens)}</p>
              </div>
            ) : (
              <form onSubmit={submit} className="mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-2">
                <label className="text-sm font-semibold text-slate-700 sm:col-span-2">Full name *
                  <input required maxLength={120} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={field} />
                </label>
                <label className="text-sm font-semibold text-slate-700">Email *
                  <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="you@example.com" className={field} />
                </label>
                <label className="text-sm font-semibold text-slate-700">Phone number *
                  <input required type="tel" maxLength={40} value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" className={field} />
                </label>
                <label className="text-sm font-semibold text-slate-700 sm:col-span-2">Cover note
                  <textarea rows={5} maxLength={3000} value={note} onChange={(e) => setNote(e.target.value)} className={`${field} resize-y border-2 px-3`} />
                </label>
                <div className="sm:col-span-2">
                  <span className="text-sm font-semibold text-slate-700">Resume *</span>
                  <input ref={fileRef} id="resume" type="file" accept=".pdf,.doc,.docx,application/pdf" className="sr-only" onChange={(e) => pick(e.target.files?.[0] ?? null)} />
                  <label htmlFor="resume" className="mt-1 flex cursor-pointer items-center gap-3 border-2 border-dashed border-slate-300 px-4 py-4 text-sm transition-colors hover:border-brand-blue">
                    <FileUp size={22} className="shrink-0 text-brand-blue" />
                    <span className="min-w-0 flex-1 truncate font-semibold text-ink">{resume ? resume.name : 'Choose a file'}</span>
                    <span className="shrink-0 text-xs text-slate-500">{c.form.resumeHint}</span>
                  </label>
                </div>
                {error && <p role="alert" className="text-sm font-semibold text-red-600 sm:col-span-2">{error}</p>}
                <div className="flex items-center justify-between sm:col-span-2">
                  <span className="text-xs text-slate-500">* required</span>
                  <button type="submit" disabled={loading} className="btn btn-primary btn-lg">
                    {loading ? 'Sending…' : c.form.submitLabel} {loading ? null : <Send size={16} />}
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
