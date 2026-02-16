import type { ComicPage } from "@/lib/types";

interface ComicImageProps {
  page: ComicPage;
}

export function ComicImage({ page }: ComicImageProps) {
  const alt = page.title || `Page ${page.pageNumber}`;
  const cacheBust = `?v=${encodeURIComponent(page.updatedAt)}`;

  return (
    <picture>
      {page.imageMobileUrl && (
        <source
          srcSet={`/api/images/${page.imageMobileUrl}${cacheBust}`}
          media="(max-width: 768px)"
          type="image/webp"
        />
      )}
      <img
        src={`/api/images/${page.imageUrl}${cacheBust}`}
        alt={alt}
        loading="eager"
        className="mx-auto max-w-full"
        style={
          page.imageBlurHash
            ? { background: `url(${page.imageBlurHash}) center/cover` }
            : undefined
        }
      />
    </picture>
  );
}
