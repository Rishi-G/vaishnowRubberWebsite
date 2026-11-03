import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

// GitHub Pages build: static HTML export served from /<repo-name>
const isStaticExport = process.env.STATIC_EXPORT === 'true'
const pagesBasePath = process.env.PAGES_BASE_PATH ?? '/vaishnowRubberWebsite'

const nextConfig: NextConfig = {
  ...(isStaticExport && {
    output: 'export' as const,
    basePath: pagesBasePath,
    trailingSlash: true,
  }),
  // Next 16 writes AGENTS.md/CLAUDE.md into the project by default — not wanted here
  agentRules: false,
  images: {
    ...(isStaticExport && { unoptimized: true }),
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default isStaticExport ? nextConfig : withPayload(nextConfig, { devBundleServerPackages: false })
