import { db } from "@/lib/db";
import { mapComicRow } from "@/lib/mappers";
import { ComicPageView } from "@/components/public/ComicPageView";

// Short revalidation so scheduled pages appear on the homepage promptly.
// The homepage shows the latest published page, so it needs to pick up
// newly-live publish_dates within a minute rather than waiting an hour.
export const revalidate = 60;

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

  const page = mapComicRow(latestResult.rows[0]);

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
