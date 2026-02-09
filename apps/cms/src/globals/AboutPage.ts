import type { GlobalConfig } from 'payload';

export const AboutPage: GlobalConfig = {
  slug: 'about-page',
  label: 'About Page',
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'aboutMe',
      type: 'richText',
      required: true,
      label: 'About Me',
    },
    {
      name: 'aboutComic',
      type: 'richText',
      required: true,
      label: 'About the Comic',
    },
    {
      name: 'contentWarnings',
      type: 'richText',
      required: true,
      label: 'Content Warnings',
    },
    {
      name: 'updateSchedule',
      type: 'text',
      required: true,
      defaultValue: 'Updates Mondays',
    },
  ],
};
