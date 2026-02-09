import type { GlobalConfig } from 'payload';

export const AboutPage: GlobalConfig = {
  slug: 'about-page',
  label: 'About Page',
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
