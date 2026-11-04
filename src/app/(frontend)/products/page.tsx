import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'
import { ProductsView } from '@/components/site/Views'

export const generateMetadata = (): Promise<Metadata> => pageMetadata('products', '/products')

export default function Page() {
  return <ProductsView />
}
