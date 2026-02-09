import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
};

export default function AboutPage() {
  return (
    <div className="prose mx-auto max-w-2xl">
      <h1>About</h1>
      <p className="text-gray-500">
        About page content will be fetched from the CMS.
      </p>
    </div>
  );
}
