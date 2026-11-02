import type { Metadata } from 'next'
import { IndustriesView } from '@/components/site/Views'

export const metadata: Metadata = {
  title: 'Industries Served',
  description: 'Hose solutions for earthmoving, mining, refineries, railways, automotive and agriculture.',
  alternates: { canonical: '/industries' },
}

export default function Page() {
  return <IndustriesView />
}
