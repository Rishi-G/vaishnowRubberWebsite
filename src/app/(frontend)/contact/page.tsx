import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'
import { getPage } from '@/lib/cms'
import { ContactView } from '@/components/site/Views'

export const generateMetadata = (): Promise<Metadata> => pageMetadata('contact', '/contact')

export default async function Page() {
  return <ContactView content={await getPage('contact')} />
}
