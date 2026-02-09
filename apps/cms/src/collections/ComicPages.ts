import type { CollectionConfig } from 'payload';

const isAuthenticated = ({ req }: { req: { user?: unknown } }): boolean =>
  Boolean(req.user);

const publishedOnly = (): { status: { equals: string }; publishDate: { less_than_equal: string } } => ({
  status: { equals: 'published' },
  publishDate: { less_than_equal: new Date().toISOString() },
});

export const ComicPages: CollectionConfig = {
  slug: 'comic-pages',
  access: {
    read: ({ req }) => (req.user ? true : publishedOnly()),
    create: isAuthenticated,
    update: isAuthenticated,
    delete: isAuthenticated,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['pageNumber', 'title', 'status', 'publishDate'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      admin: {
        description: 'Optional title for this page',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL-safe identifier (auto-generated from page number)',
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (!value && data?.pageNumber) {
              return `page-${data.pageNumber}`;
            }
            return value;
          },
        ],
      },
    },
    {
      name: 'pageNumber',
      type: 'number',
      required: true,
      unique: true,
      admin: {
        description: 'Sequential page number',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'commentary',
      type: 'richText',
      admin: {
        description: "Author's notes displayed below the comic page",
      },
    },
    {
      name: 'contentWarning',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Show a content warning overlay on this page',
      },
    },
    {
      name: 'contentWarningText',
      type: 'text',
      admin: {
        description: 'Custom warning text (leave blank for default)',
        condition: (data) => data?.contentWarning === true,
      },
    },
    {
      name: 'publishDate',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
        },
        description: 'Page will not be visible to readers before this date',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
    },
  ],
};
