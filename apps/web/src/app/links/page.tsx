import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Links',
};

export default function LinksPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">Links</h1>
      <p className="text-gray-500">
        Links will be fetched from the CMS.
      </p>
    </div>
  );
}
