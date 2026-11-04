import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'
import { getPage } from '@/lib/cms'
import { ResourcesView } from '@/components/site/Views'

export const generateMetadata = (): Promise<Metadata> => pageMetadata('resources', '/resources')

export default async function Page() {
  return <ResourcesView content={await getPage('resources')} />
}
