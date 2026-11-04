import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'
import { getPage } from '@/lib/cms'
import { CompanyView } from '@/components/site/Views'

export const generateMetadata = (): Promise<Metadata> => pageMetadata('company', '/company')

export default async function Page() {
  return <CompanyView content={await getPage('company')} />
}
