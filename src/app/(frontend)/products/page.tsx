import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'
import { getPage } from '@/lib/cms'
import { ProductsView } from '@/components/site/Views'

export const generateMetadata = (): Promise<Metadata> => pageMetadata('products', '/products')

export default async function Page() {
  return <ProductsView content={await getPage('products')} />
}
