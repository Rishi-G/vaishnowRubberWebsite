import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getProduct, getProducts } from '@/lib/cms'
import { ProductDetailView } from '@/components/site/Views'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const products = await getProducts()
  return products.map((p) => ({ slug: p.id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct((await params).slug)
  if (!product) return {}
  return {
    title: product.name,
    description: product.kind === 'hose' ? `${product.tagline}. ${product.standard}. Working pressure up to ${product.maxPressureBar} bar, sizes ${product.sizeRange}.` : `${product.tagline}. ${product.description}`,
    alternates: { canonical: `/products/${product.id}` },
    openGraph: { images: product.image ? [product.image] : undefined },
  }
}

export default async function Page({ params }: Props) {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image ? [product.image] : undefined,
    category: product.categoryLabel,
    brand: { '@type': 'Brand', name: 'VEXTRA' },
    manufacturer: { '@type': 'Organization', name: 'Vaishno Rubber Industries Pvt. Ltd.' },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProductDetailView productId={product.id} />
    </>
  )
}
