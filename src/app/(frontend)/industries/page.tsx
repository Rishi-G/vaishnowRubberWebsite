import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'
import { getPage } from '@/lib/cms'
import { IndustriesView } from '@/components/site/Views'

export const generateMetadata = (): Promise<Metadata> => pageMetadata('industries', '/industries')

export default async function Page() {
  return <IndustriesView content={await getPage('industries')} />
}
