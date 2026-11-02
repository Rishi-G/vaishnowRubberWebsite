'use client'

import React from 'react'
import { HeroStory } from '@/components/home/HeroStory'
import { FactStrip, RailwayShowcase, HoseFamilies, PressureFinder, Customers, Works, QuoteBand } from '@/components/home/HomeSections'

/**
 * Home — each section has its own composition and a single job:
 * hero story → facts → railway parts in action → hose range → hose finder → customers → works → quote.
 */
export const HomePage: React.FC<Record<string, unknown>> = () => (
  <div className="w-full">
    <HeroStory />
    <FactStrip />
    <RailwayShowcase />
    <HoseFamilies />
    <PressureFinder />
    <Customers />
    <Works />
    <QuoteBand />
  </div>
)
