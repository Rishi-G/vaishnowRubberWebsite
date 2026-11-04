import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Products } from './collections/Products'
import { Enquiries } from './collections/Enquiries'
import { ProductCategories } from './collections/ProductCategories'
import { Jobs } from './collections/Jobs'
import { Applications } from './collections/Applications'
import { CompanyInfo } from './globals/CompanyInfo'
import { SiteSettings } from './globals/SiteSettings'
import { Navigation } from './globals/Navigation'
import { Theme } from './globals/Theme'
import { PageGlobals } from './globals/pages'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || '',
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: '— Vaishno Rubber CMS',
    },
  },
  collections: [Products, ProductCategories, Jobs, Applications, Enquiries, Media, Users],
  globals: [CompanyInfo, SiteSettings, Navigation, Theme, ...PageGlobals],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URL || 'file:./vaishno.db',
    },
  }),
  sharp,
  plugins: [],
})
