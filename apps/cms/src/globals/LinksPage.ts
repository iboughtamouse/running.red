import type { GlobalConfig } from 'payload';

export const LinksPage: GlobalConfig = {
  slug: 'links-page',
  label: 'Links Page',
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'links',
      type: 'array',
      label: 'Links',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'url',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          type: 'text',
        },
      ],
    },
  ],
};
