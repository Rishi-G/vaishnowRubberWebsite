import type { Metadata } from 'next'
import { ProductsView } from '@/components/site/Views'

export const metadata: Metadata = {
  title: 'Hose Product Catalogue',
  description: 'Browse VEXTRA hydraulic, industrial and automotive hoses by family and working pressure, with full technical data sheets.',
  alternates: { canonical: '/products' },
}

export default function Page() {
  return <ProductsView />
}
