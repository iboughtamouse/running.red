import path from 'path';
import { fileURLToPath } from 'url';
import { buildConfig } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { s3Storage } from '@payloadcms/storage-s3';
import sharp from 'sharp';

import { ComicPages } from './collections/ComicPages';
import { Media } from './collections/Media';
import { Users } from './collections/Users';
import { SiteSettings } from './globals/SiteSettings';
import { AboutPage } from './globals/AboutPage';
import { LinksPage } from './globals/LinksPage';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: ' - Running Red Admin',
    },
  },
  collections: [ComicPages, Media, Users],
  globals: [SiteSettings, AboutPage, LinksPage],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || 'CHANGE_ME_IN_PRODUCTION',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  plugins: [
    ...(process.env.R2_BUCKET
      ? [
          s3Storage({
            collections: {
              media: {
                prefix: 'media',
              },
            },
            bucket: process.env.R2_BUCKET,
            config: {
              credentials: {
                accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
                secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
              },
              endpoint: process.env.R2_ENDPOINT || '',
              region: 'auto',
            },
          }),
        ]
      : []),
  ],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- sharp version mismatch with Payload's expected types
  sharp: sharp as any,
});
