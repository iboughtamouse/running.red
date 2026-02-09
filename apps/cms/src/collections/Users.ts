import type { Access, CollectionConfig } from 'payload';

const isAuthenticated: Access = ({ req }) => Boolean(req.user);

const canCreateUser: Access = async ({ req }) => {
  if (req.user) return true;

  const { totalDocs } = await req.payload.count({ collection: 'users' });
  return totalDocs === 0;
};

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  access: {
    read: isAuthenticated,
    create: canCreateUser,
    update: isAuthenticated,
    delete: isAuthenticated,
  },
  admin: {
    useAsTitle: 'email',
  },
  fields: [],
};
