'use client'

import React, { useMemo, useRef, useState } from 'react'
import { Download } from 'lucide-react'
import type { PageRoute } from '@/types'
import { useReveal } from '@/components/motion/useReveal'
import { PageHead } from '@/components/site/PageHead'

interface Props {
  onNavigate?: (route: PageRoute) => void
  onOpenEnquiry: (productId?: string) => void
}

/** Installation guidance — the eight points from the VEXTRA catalogue "Do's and Don'ts" page. */
const GUIDANCE = [
  ['Do not twist the hose', 'Pressure applied to a twisted hose can result in hose failure or loosening of connections.'],
  ['Allow slack for length change', 'When a hose is installed straight, leave enough slack to provide for the length changes that occur when pressure is applied.'],
  ['Keep bend radii as large as possible', 'To avoid hose collapse and flow restriction, refer to the hose specification tables for minimum bend radii.'],
  ['Use proper angle adaptors', 'Angle adaptors avoid a sharp twist or bend in the hose.'],
  ['Allow adequate hose length', 'Enough length distributes movement on flexing applications and avoids abrasion.'],
  ['Use elbows and adaptors to relieve strain', 'They give neater installations that are more accessible for inspection and maintenance.'],
  ['Bend in the plane of the motion', 'Prevent twisting and distortion by bending the hose in the same plane as the motion of the part it connects to.'],
  ['Avoid rubbing and abrasion', 'Route hose away from moving parts. Clamps of the correct size can support long runs; a loose clamp lets the hose move inside it and causes abrasion.'],
] as const

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
    <div className="rounded-sm border border-slate-200 p-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block text-xs font-semibold text-slate-700">Flow (US gal/min)
          <input type="number" min={0.4} max={100} step={0.5} value={gpm} onChange={(e) => setGpm(Math.max(0.1, Number(e.target.value)))} className="mt-1 w-full rounded-sm border border-slate-300 p-2 font-mono text-sm outline-none focus:border-brand-blue" />
        </label>
        <label className="block text-xs font-semibold text-slate-700">Line type
          <select value={line} onChange={(e) => choose(e.target.value as 'pressure' | 'suction')} className="mt-1 w-full rounded-sm border border-slate-300 bg-white p-2 text-sm outline-none focus:border-brand-blue">
            <option value="pressure">Pressure line (suggested 7–15 ft/s)</option>
            <option value="suction">Pump inlet / suction (suggested 2–4 ft/s)</option>
          </select>
        </label>
        <label className="block text-xs font-semibold text-slate-700">Velocity (ft/s)
          <input type="number" min={1} max={25} step={0.5} value={vel} onChange={(e) => setVel(Math.max(1, Number(e.target.value)))} className="mt-1 w-full rounded-sm border border-slate-300 p-2 font-mono text-sm outline-none focus:border-brand-blue" />
        </label>
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-200 pt-4">
        <div><dt className="font-mono text-[10px] uppercase tracking-wider text-slate-500">Flow area</dt><dd className="font-mono text-2xl font-bold text-slate-950">{area.toFixed(2)} <span className="text-sm text-slate-500">sq in</span></dd></div>
        <div><dt className="font-mono text-[10px] uppercase tracking-wider text-slate-500">Hose inside diameter</dt><dd className="font-mono text-2xl font-bold text-brand-blue">{idIn.toFixed(2)} <span className="text-sm text-slate-500">in ({(idIn * 25.4).toFixed(1)} mm)</span></dd></div>
      </dl>
      <p className="mt-3 text-xs leading-relaxed text-slate-500">
        Area (sq in) = GPM × 0.3208 ÷ velocity (ft/s). Suggestions apply to oils of maximum viscosity 315 SSU at +100°F (+38°C) operating between +65°F and +155°F (+54°C to +69°C). Under certain conditions pressure-line velocity can be increased up to 25 ft/s. Choose the next standard size at or above the result.
      </p>
    </div>
  )
}

function Converter() {
  const [bar, setBar] = useState(250)
  const row = [
    ['bar', bar.toFixed(1)],
    ['psi', (bar * 14.5038).toFixed(0)],
    ['MPa', (bar / 10).toFixed(2)],
  ]
  return (
    <div className="rounded-sm border border-slate-200 p-5">
      <label className="block text-xs font-semibold text-slate-700">Pressure (bar)
        <input type="number" min={0} value={bar} onChange={(e) => setBar(Math.max(0, Number(e.target.value)))} className="mt-1 w-full max-w-xs rounded-sm border border-slate-300 p-2 font-mono text-sm outline-none focus:border-brand-blue" />
      </label>
      <dl className="mt-4 grid grid-cols-3 gap-4 border-t border-slate-200 pt-4">
        {row.map(([k, v]) => (
          <div key={k}><dt className="font-mono text-[10px] uppercase tracking-wider text-slate-500">{k}</dt><dd className="font-mono text-xl font-bold text-slate-950">{v}</dd></div>
        ))}
      </dl>
    </div>
  )
}

export const ResourcesPage: React.FC<Props> = () => {
  const ref = useRef<HTMLDivElement>(null)
  useReveal(ref)
  return (
    <div ref={ref} className="bg-white">
      <PageHead crumbs={[{ label: 'Home', href: '/' }, { label: 'Resources' }]} eyebrow="Technical resources" title="Catalogue, certificate and hose guidance." lede="Downloads, installation guidance and two calculators taken from the VEXTRA catalogue." />

      <section className="container py-12">
        <h2 className="text-xl font-extrabold text-slate-950">Downloads</h2>
        <ul className="mt-4 grid gap-4 md:grid-cols-2">
          {[
            ['VEXTRA hose catalogue', 'Hydraulic, industrial, LPG and automotive hose data sheets, flow chart and installation guidance.', '/documents/vextra-hose-catalogue.pdf'],
            ['ISO 14001:2015 certificate', 'Environmental Management System certificate issued by QFS Management Systems LLP.', '/documents/iso-14001-certificate.pdf'],
          ].map(([t, d, href]) => (
            <li key={t} data-reveal>
              <a href={href} target="_blank" rel="noopener noreferrer" className="group flex items-start justify-between gap-4 rounded-sm border border-slate-200 p-5 transition-colors hover:border-brand-blue">
                <span><span className="block text-base font-bold text-slate-900 group-hover:text-brand-blue">{t}</span><span className="mt-1 block text-sm text-slate-600">{d}</span></span>
                <Download size={18} className="mt-1 shrink-0 text-brand-blue" />
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-slate-50 py-12">
        <div className="container grid gap-8 lg:grid-cols-2">
          <div data-reveal><h2 className="text-xl font-extrabold text-slate-950">Hose size from flow</h2><p className="mb-3 mt-1 text-sm text-slate-600">The catalogue’s flow-capacity method.</p><FlowCalc /></div>
          <div data-reveal><h2 className="text-xl font-extrabold text-slate-950">Pressure units</h2><p className="mb-3 mt-1 text-sm text-slate-600">Convert between bar, psi and MPa.</p><Converter /></div>
        </div>
      </section>

      <section className="container py-12">
        <h2 className="text-xl font-extrabold text-slate-950">Installation: do’s and don’ts</h2>
        <ol className="mt-5 grid gap-x-10 sm:grid-cols-2">
          {GUIDANCE.map(([t, d], i) => (
            <li key={t} data-reveal className="grid grid-cols-[2.5rem_1fr] gap-2 border-t border-slate-200 py-4">
              <span className="font-mono text-sm text-slate-400">{String(i + 1).padStart(2, '0')}</span>
              <div><h3 className="text-sm font-bold text-slate-900">{t}</h3><p className="mt-1 text-sm leading-relaxed text-slate-600">{d}</p></div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}
