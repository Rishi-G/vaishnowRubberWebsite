import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'
import { CompanyView } from '@/components/site/Views'

export const generateMetadata = (): Promise<Metadata> => pageMetadata('company', '/company')

export default function Page() {
  return <CompanyView />
}
