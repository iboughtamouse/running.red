import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Archive',
};

export default function ArchivePage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">Archive</h1>
      <p className="text-gray-500">
        Archive listing will be fetched from the CMS.
      </p>
    </div>
  );
}
