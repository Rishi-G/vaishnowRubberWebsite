import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'
import { getPage } from '@/lib/cms'
import { CareerView } from '@/components/site/Views'

export const generateMetadata = (): Promise<Metadata> => pageMetadata('career', '/career')

export default async function Page() {
  return <CareerView content={await getPage('career')} />
}
