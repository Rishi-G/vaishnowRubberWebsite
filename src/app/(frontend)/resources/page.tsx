import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'
import { ResourcesView } from '@/components/site/Views'

export const generateMetadata = (): Promise<Metadata> => pageMetadata('resources', '/resources')

export default function Page() {
  return <ResourcesView />
}
