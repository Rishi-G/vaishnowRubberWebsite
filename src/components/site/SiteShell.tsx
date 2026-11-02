'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import type { PageRoute } from '@/types'
import { useSiteData } from '@/lib/site-context'
import { SiteHeader } from '@/components/navigation/SiteHeader'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { EnquiryModal } from '@/components/enquiry/EnquiryModal'

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = (usePathname() || '/').replace(/\/$/, '') || '/'
  const { navigate, openEnquiry, closeEnquiry, enquiryOpen, enquiryProductId } = useSiteData()

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
      <SiteHeader currentRoute={pathname as PageRoute} onNavigate={navigate} onOpenEnquiry={openEnquiry} />
      <main className="flex-1 w-full">{children}</main>
      <SiteFooter onNavigate={navigate} onOpenEnquiry={openEnquiry} />
      <EnquiryModal isOpen={enquiryOpen} onClose={closeEnquiry} initialProductId={enquiryProductId} />
    </div>
  )
}
