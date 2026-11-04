import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'
import { ContactView } from '@/components/site/Views'

export const generateMetadata = (): Promise<Metadata> => pageMetadata('contact', '/contact')

export default function Page() {
  return <ContactView />
}
