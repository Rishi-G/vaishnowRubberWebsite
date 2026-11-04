'use client'

import React, { createContext, useCallback, useContext, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { PageRoute, Product, SiteSettings } from '@/types'
import type { CompanyFacts } from './cms'

interface SiteContextValue {
  products: Product[]
  company: CompanyFacts
  settings: SiteSettings
  navigate: (route: PageRoute) => void
  openEnquiry: (productId?: string) => void
  closeEnquiry: () => void
  enquiryOpen: boolean
  enquiryProductId?: string
}

const SiteContext = createContext<SiteContextValue | null>(null)

/**
 * Holds CMS data fetched once in the server layout, plus global UI state
 * (enquiry modal). Replaces the legacy App.tsx useState router.
 */
export function SiteProvider({
  products,
  company,
  settings,
  children,
}: {
  products: Product[]
  company: CompanyFacts
  settings: SiteSettings
  children: React.ReactNode
}) {
  const router = useRouter()
  const [enquiryOpen, setEnquiryOpen] = useState(false)
  const [enquiryProductId, setEnquiryProductId] = useState<string | undefined>()

  const navigate = useCallback((route: PageRoute) => router.push(route), [router])
  const openEnquiry = useCallback((productId?: string) => {
    setEnquiryProductId(productId)
    setEnquiryOpen(true)
  }, [])
  const closeEnquiry = useCallback(() => {
    setEnquiryOpen(false)
    setEnquiryProductId(undefined)
  }, [])

  return (
    <SiteContext.Provider
      value={{ products, company, settings, navigate, openEnquiry, closeEnquiry, enquiryOpen, enquiryProductId }}
    >
      {children}
    </SiteContext.Provider>
  )
}

export function useSiteData() {
  const ctx = useContext(SiteContext)
  if (!ctx) throw new Error('useSiteData must be used inside <SiteProvider>')
  return ctx
}
