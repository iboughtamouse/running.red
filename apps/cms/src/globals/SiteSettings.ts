import type { GlobalConfig } from 'payload';

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  fields: [
    {
      name: 'siteTitle',
      type: 'text',
      required: true,
      defaultValue: 'Running Red',
    },
    {
      name: 'siteDescription',
      type: 'textarea',
      required: true,
      defaultValue: 'A webcomic by Ren',
    },
    {
      name: 'socialImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Default image for social media sharing',
      },
    },
  ],
};
