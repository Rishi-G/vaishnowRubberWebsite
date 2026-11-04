'use client'

/**
 * Client bridges: the ported page components take onNavigate/onOpenEnquiry props.
 * These wrappers supply them from SiteProvider so server route files stay thin.
 */
import { useSiteData } from '@/lib/site-context'
import type { PageContent } from '@/seed/pages'
import { HomePage } from '@/views/HomePage'
import { ProductsPage } from '@/views/ProductsPage'
import { ProductDetailPage } from '@/views/ProductDetailPage'
import { CompanyPage } from '@/views/CompanyPage'
import { IndustriesPage } from '@/views/IndustriesPage'
import { ResourcesPage } from '@/views/ResourcesPage'
import { ContactPage } from '@/views/ContactPage'

function useNav() {
  const { navigate, openEnquiry } = useSiteData()
  return { onNavigate: navigate, onOpenEnquiry: openEnquiry }
}

export const HomeView = ({ content }: { content: PageContent<'home'> }) => <HomePage content={content} />
export const ProductsView = ({ content }: { content: PageContent<'products'> }) => <ProductsPage content={content} {...useNav()} />
export const ProductDetailView = ({ productId }: { productId: string }) => (
  <ProductDetailPage productId={productId} {...useNav()} />
)
export const CompanyView = ({ content }: { content: PageContent<'company'> }) => <CompanyPage content={content} {...useNav()} />
export const IndustriesView = ({ content }: { content: PageContent<'industries'> }) => <IndustriesPage content={content} {...useNav()} />
export const ResourcesView = ({ content }: { content: PageContent<'resources'> }) => <ResourcesPage content={content} {...useNav()} />
export const ContactView = ({ content }: { content: PageContent<'contact'> }) => <ContactPage content={content} {...useNav()} />
