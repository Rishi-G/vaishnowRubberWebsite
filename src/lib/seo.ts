import type { Metadata } from 'next'
import type { SeoPage } from '@/types'
import { getSettings } from '@/lib/cms'

/** Title and description for a fixed page, from Site Settings → SEO → Per-page SEO. */
export async function pageMetadata(page: SeoPage, path: string): Promise<Metadata> {
  const { pageSeo } = await getSettings()
  return { title: pageSeo[page].title, description: pageSeo[page].description, alternates: { canonical: path } }
}
