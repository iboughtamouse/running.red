import { ComicImage } from "./ComicImage";
import { ComicNav } from "./ComicNav";
import { ContentWarning } from "./ContentWarning";
import type { ComicPage } from "@/lib/types";

export interface PrefetchImages {
  imageUrl: string;
  imageMobileUrl: string | null;
  updatedAt: string;
}

interface ComicPageViewProps {
  page: ComicPage;
  firstSlug: string | null;
  prevSlug: string | null;
  nextSlug: string | null;
  lastSlug: string | null;
  prefetchImages?: PrefetchImages | null;
}

export function ComicPageView({ page, firstSlug, prevSlug, nextSlug, lastSlug, prefetchImages }: ComicPageViewProps) {
  const hasWarnings = page.contentWarnings.length > 0 || !!page.contentWarningOther;

  const image = <ComicImage page={page} />;

  return (
    <article className="flex flex-col items-center gap-6">
      {page.title && (
        <h1 className="text-2xl font-bold text-foreground">{page.title}</h1>
      )}

      <ComicNav
        firstSlug={firstSlug}
        prevSlug={prevSlug}
        nextSlug={nextSlug}
        lastSlug={lastSlug}
      />

      {hasWarnings ? (
        <ContentWarning
          warnings={page.contentWarnings}
          warningOther={page.contentWarningOther}
        >
          {image}
        </ContentWarning>
      ) : (
        image
      )}

      <ComicNav
        firstSlug={firstSlug}
        prevSlug={prevSlug}
        nextSlug={nextSlug}
        lastSlug={lastSlug}
      />

      {page.commentary && (
        <div className="w-full max-w-2xl rounded-lg bg-base/60 backdrop-blur-sm p-4 text-foreground/80">
          <p className="whitespace-pre-wrap">{page.commentary}</p>
        </div>
      )}

      <time className="rounded-lg bg-base/60 backdrop-blur-sm px-3 py-1 text-sm text-foreground/50" dateTime={page.publishDate}>
        {new Date(page.publishDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </time>

      {prefetchImages && (
        <>
          <link
            rel="prefetch"
            href={`/api/images/${prefetchImages.imageUrl}?v=${encodeURIComponent(prefetchImages.updatedAt)}`}
            as="image"
          />
          {prefetchImages.imageMobileUrl && (
            <link
              rel="prefetch"
              href={`/api/images/${prefetchImages.imageMobileUrl}?v=${encodeURIComponent(prefetchImages.updatedAt)}`}
              as="image"
            />
          )}
        </>
      )}
    </article>
  );
}
