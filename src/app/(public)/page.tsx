import { db } from "@/lib/db";
import { ComicPageView } from "@/components/public/ComicPageView";
import type { ComicPage } from "@/lib/types";

export const revalidate = 3600;

export default async function HomePage() {
  const latestResult = await db.query(
    `SELECT * FROM comic_pages
     WHERE status = 'published' AND publish_date <= NOW()
     ORDER BY page_number DESC
     LIMIT 1`
  );

  if (latestResult.rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h1 className="text-3xl font-bold text-btn-gold">Running Red</h1>
        <p className="mt-4 text-foreground/60">Coming soon...</p>
      </div>
    );
  }

  const page = mapRow(latestResult.rows[0]);

  // Get navigation info
  const [firstResult, prevResult] = await Promise.all([
    db.query(
      `SELECT slug FROM comic_pages
       WHERE status = 'published' AND publish_date <= NOW()
       ORDER BY page_number ASC LIMIT 1`
    ),
    db.query(
      `SELECT slug FROM comic_pages
       WHERE status = 'published' AND publish_date <= NOW()
         AND page_number < $1
       ORDER BY page_number DESC LIMIT 1`,
      [page.pageNumber]
    ),
  ]);

  const firstSlug = firstResult.rows[0]?.slug as string | undefined;
  const prevSlug = prevResult.rows[0]?.slug as string | undefined;

  return (
    <ComicPageView
      page={page}
      firstSlug={firstSlug && firstSlug !== page.slug ? firstSlug : null}
      prevSlug={prevSlug ?? null}
      nextSlug={null}
      lastSlug={null}
    />
  );
}

function mapRow(row: Record<string, unknown>): ComicPage {
  return {
    id: row.id as number,
    pageNumber: row.page_number as number,
    slug: row.slug as string,
    title: row.title as string | null,
    imageUrl: row.image_url as string,
    imageMobileUrl: row.image_mobile_url as string | null,
    imageBlurHash: row.image_blur_hash as string | null,
    commentary: row.commentary as string | null,
    contentWarnings: (row.content_warnings as ComicPage["contentWarnings"]) || [],
    contentWarningOther: row.content_warning_other as string | null,
    publishDate: String(row.publish_date),
    status: row.status as "draft" | "published",
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}
