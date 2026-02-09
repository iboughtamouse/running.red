interface ComicPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ComicPage({ params }: ComicPageProps) {
  const { slug } = await params;

  return (
    <div className="flex flex-col items-center gap-8">
      <p className="text-gray-500">Comic page: {slug}</p>
    </div>
  );
}
