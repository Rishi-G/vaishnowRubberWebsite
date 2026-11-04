import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'
import { IndustriesView } from '@/components/site/Views'

export const generateMetadata = (): Promise<Metadata> => pageMetadata('industries', '/industries')

export default function Page() {
  return <IndustriesView />
}
