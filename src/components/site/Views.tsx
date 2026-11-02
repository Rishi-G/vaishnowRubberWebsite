'use client'

/**
 * Client bridges: the ported page components take onNavigate/onOpenEnquiry props.
 * These wrappers supply them from SiteProvider so server route files stay thin.
 */
import { useSiteData } from '@/lib/site-context'
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

export const HomeView = () => <HomePage {...useNav()} />
export const ProductsView = () => <ProductsPage {...useNav()} />
export const ProductDetailView = ({ productId }: { productId: string }) => (
  <ProductDetailPage productId={productId} {...useNav()} />
)
export const CompanyView = () => <CompanyPage {...useNav()} />
export const IndustriesView = () => <IndustriesPage {...useNav()} />
export const ResourcesView = () => <ResourcesPage {...useNav()} />
export const ContactView = () => <ContactPage {...useNav()} />
