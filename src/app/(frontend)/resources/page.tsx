import type { Metadata } from 'next'
import { ResourcesView } from '@/components/site/Views'

export const metadata: Metadata = {
  title: 'Technical Resources',
  description: 'Hose selection guidance, pressure conversion and the downloadable VEXTRA product catalogue.',
  alternates: { canonical: '/resources' },
}

export default function Page() {
  return <ResourcesView />
}
