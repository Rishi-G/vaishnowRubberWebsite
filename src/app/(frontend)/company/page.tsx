import type { Metadata } from 'next'
import { CompanyView } from '@/components/site/Views'

export const metadata: Metadata = {
  title: 'Company & Moradabad Plant',
  description: 'About Vaishno Rubber Industries: leadership, the 5-acre Moradabad manufacturing plant, machinery and quality systems.',
  alternates: { canonical: '/company' },
}

export default function Page() {
  return <CompanyView />
}
