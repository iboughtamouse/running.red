import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  upload: {
    mimeTypes: ['image/*'],
    imageSizes: [
      {
        name: 'desktop',
        width: 1200,
        height: undefined,
        position: 'centre',
        formatOptions: {
          format: 'webp',
          options: {
            quality: 85,
          },
        },
      },
      {
        name: 'mobile',
        width: 800,
        height: undefined,
        position: 'centre',
        formatOptions: {
          format: 'webp',
          options: {
            quality: 80,
          },
        },
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      admin: {
        description: 'Alt text for accessibility',
      },
    },
  ],
}
