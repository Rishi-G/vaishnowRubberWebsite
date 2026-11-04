'use client'

import React from 'react'
import { HeroStory } from '@/components/home/HeroStory'
import { FactStrip, RailwayShowcase, HoseFamilies, PressureFinder, Customers, Works, QuoteBand } from '@/components/home/HomeSections'
import type { PageContent } from '@/seed/pages'

/**
 * Home — each section has its own composition and a single job:
 * hero story → facts → railway parts in action → hose range → hose finder → customers → works → quote.
 * Text comes from the Home page global (Pages → Home page in the admin).
 */
export const HomePage: React.FC<{ content: PageContent<'home'> }> = ({ content: c }) => (
  <div className="w-full">
    <HeroStory hero={c.hero} />
    <FactStrip c={c.facts} />
    <RailwayShowcase c={c.railway} />
    <HoseFamilies c={c.hoses} />
    <PressureFinder c={c.finder} />
    <Customers c={c.customers} />
    <Works c={c.works} />
    <QuoteBand c={c.quote} />
  </div>
)
