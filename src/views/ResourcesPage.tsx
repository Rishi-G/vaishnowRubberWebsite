'use client'

import React, { useMemo, useState } from 'react'
import { Download, FileText } from 'lucide-react'
import type { PageRoute } from '@/types'
import { BoreDiagram, Gauge, HosePict, SheetHero } from '@/components/site/graphics'
import type { PageContent } from '@/seed/pages'

interface Props {
  content: PageContent<'resources'>
  onNavigate?: (route: PageRoute) => void
  onOpenEnquiry: (productId?: string) => void
}

const input = 'mt-1 w-full border-0 border-b-2 border-slate-300 bg-transparent px-0 py-2 font-display text-lg font-bold text-ink outline-none transition-colors focus:border-brand-blue'

function FlowCalc() {
  const [gpm, setGpm] = useState(13)
  const [line, setLine] = useState<'pressure' | 'suction'>('pressure')
  const [vel, setVel] = useState(10)
  const area = useMemo(() => (gpm * 0.3208) / vel, [gpm, vel])
  const idIn = Math.sqrt((4 * area) / Math.PI)
  const choose = (l: 'pressure' | 'suction') => {
    setLine(l)
    setVel(l === 'pressure' ? 10 : 3)
  }
  return (
    <div className="grid gap-8 bg-white p-6 sm:grid-cols-[1fr_16rem] sm:p-8">
      <div>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-slate-700">Flow (US gal/min)
            <input type="number" min={0.4} max={100} step={0.5} value={gpm} onChange={(e) => setGpm(Math.max(0.1, Number(e.target.value)))} className={input} />
          </label>
          <label className="block text-sm font-semibold text-slate-700">Velocity (ft/s)
            <input type="number" min={1} max={25} step={0.5} value={vel} onChange={(e) => setVel(Math.max(1, Number(e.target.value)))} className={input} />
          </label>
          <label className="block text-sm font-semibold text-slate-700 sm:col-span-2">Line type
            <select value={line} onChange={(e) => choose(e.target.value as 'pressure' | 'suction')} className={input}>
              <option value="pressure">Pressure line (suggested 7–15 ft/s)</option>
              <option value="suction">Pump inlet / suction (suggested 2–4 ft/s)</option>
            </select>
          </label>
        </div>
        <dl className="mt-7 grid grid-cols-2 gap-4 bg-ink p-5 text-white">
          <div>
            <dt className="text-sm text-white/60">Flow area</dt>
            <dd className="font-display text-3xl font-bold">{area.toFixed(2)} <span className="text-base font-medium text-white/60">sq in</span></dd>
          </div>
          <div>
            <dt className="text-sm text-white/60">Hose inside diameter</dt>
            <dd className="font-display text-3xl font-bold text-brand-accent">{idIn.toFixed(2)} <span className="text-base font-medium text-white/60">in ({(idIn * 25.4).toFixed(1)} mm)</span></dd>
          </div>
        </dl>
        <p className="mt-4 text-xs leading-relaxed text-slate-500">
          Area (sq in) = GPM × 0.3208 ÷ velocity (ft/s). Suggestions apply to oils of maximum viscosity 315 SSU at +100°F (+38°C) operating between +65°F and +155°F (+54°C to +69°C). Under certain conditions pressure-line velocity can be increased up to 25 ft/s. Choose the next standard size at or above the result.
        </p>
      </div>
      <BoreDiagram idIn={idIn} />
    </div>
  )
}

const DIAL_MAX_BAR = 600

function Converter() {
  const [bar, setBar] = useState(250)
  const row = [
    ['bar', bar.toFixed(1)],
    ['psi', (bar * 14.5038).toFixed(0)],
    ['MPa', (bar / 10).toFixed(2)],
  ]
  return (
    <div className="grid gap-6 bg-white p-6 sm:p-8">
      <Gauge light value={bar / DIAL_MAX_BAR} readout={bar.toFixed(0)} unit="bar" max={`${DIAL_MAX_BAR} bar`} />
      <label className="block text-sm font-semibold text-slate-700">Pressure (bar)
        <input type="number" min={0} value={bar} onChange={(e) => setBar(Math.max(0, Number(e.target.value)))} className={input} />
      </label>
      <dl className="grid grid-cols-3 gap-4 border-t border-slate-200 pt-5">
        {row.map(([k, v]) => (
          <div key={k}>
            <dt className="text-sm text-slate-500">{k}</dt>
            <dd className="font-display text-2xl font-bold text-ink">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

export const ResourcesPage: React.FC<Props> = ({ content: c }) => {
  return (
    <div className="bg-paper">
      <SheetHero
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Resources' }]}
        title={c.hero.title}
        lede={c.hero.lede}
        art={<Gauge value={0.42} readout="250" unit="bar, example reading" max="600 bar" />}
      />

      <section className="container py-14 lg:py-20">
        <h2 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">{c.downloads.heading}</h2>
        <ul className="mt-8 grid gap-6 md:grid-cols-2">
          {c.downloads.items.map(({ title: t, text: d, href }) => (
            <li key={t}>
              <a href={href} target="_blank" rel="noopener noreferrer" className="group flex h-full items-start gap-5 border border-slate-300 bg-white p-6 transition-colors hover:border-brand-blue hover:bg-ink hover:text-white">
                <FileText size={34} className="mt-1 shrink-0 text-brand-blue group-hover:text-brand-accent" />
                <span className="flex-1">
                  <span className="block font-display text-xl font-bold">{t}</span>
                  <span className="mt-1 block text-[15px] leading-relaxed text-slate-600 group-hover:text-white/70">{d}</span>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-brand-blue group-hover:text-brand-accent"><Download size={15} /> Download PDF</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-slate-200/60 py-14 lg:py-20">
        <div className="container grid gap-10 lg:grid-cols-[1.35fr_1fr]">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight text-ink">{c.calculators.flowHeading}</h2>
            <p className="mb-5 mt-2 text-slate-600">{c.calculators.flowText}</p>
            <FlowCalc />
          </div>
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight text-ink">{c.calculators.pressureHeading}</h2>
            <p className="mb-5 mt-2 text-slate-600">{c.calculators.pressureText}</p>
            <Converter />
          </div>
        </div>
      </section>

      <section className="container py-14 lg:py-20">
        <h2 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">{c.guidance.heading}</h2>
        <p className="mt-2 max-w-xl text-slate-600">{c.guidance.text}</p>
        <ul className="mt-8 grid gap-x-12 md:grid-cols-2">
          {c.guidance.items.map(({ kind, title: t, text: d }) => (
            <li key={t} className="flex gap-5 border-t border-slate-300 py-6">
              <HosePict kind={kind} />
              <div>
                <h3 className="font-display text-lg font-bold text-ink">{t}</h3>
                <p className="mt-1 text-[15px] leading-relaxed text-slate-600">{d}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
