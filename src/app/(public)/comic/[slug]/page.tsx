import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ComicPageView } from "@/components/public/ComicPageView";
import type { ComicPage } from "@/lib/types";
import type { Metadata } from "next";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const result = await db.query(
    `SELECT slug FROM comic_pages
     WHERE status = 'published' AND publish_date <= NOW()`
  );
  return result.rows.map((row) => ({ slug: row.slug as string }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await db.query(
    `SELECT title, page_number, commentary FROM comic_pages
     WHERE slug = $1 AND status = 'published' AND publish_date <= NOW()`,
    [slug]
  );

  if (result.rows.length === 0) {
    return { title: "Not Found" };
  }

  const row = result.rows[0];
  const title = row.title
    ? `Page ${row.page_number}: ${row.title}`
    : `Page ${row.page_number}`;
  const description = row.commentary
    ? String(row.commentary).slice(0, 160)
    : "A webcomic by Ren";

  return { title, description };
}

export default async function ComicSlugPage({ params }: PageProps) {
  const { slug } = await params;

  const result = await db.query(
    `SELECT * FROM comic_pages
     WHERE slug = $1 AND status = 'published' AND publish_date <= NOW()`,
    [slug]
  );

  if (result.rows.length === 0) {
    notFound();
  }

  const page = mapRow(result.rows[0]);

  const [firstResult, prevResult, nextResult, lastResult] = await Promise.all([
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
    db.query(
      `SELECT slug, image_url, image_mobile_url, updated_at FROM comic_pages
       WHERE status = 'published' AND publish_date <= NOW()
         AND page_number > $1
       ORDER BY page_number ASC LIMIT 1`,
      [page.pageNumber]
    ),
    db.query(
      `SELECT slug FROM comic_pages
       WHERE status = 'published' AND publish_date <= NOW()
       ORDER BY page_number DESC LIMIT 1`
    ),
  ]);

  const firstSlug = firstResult.rows[0]?.slug as string | undefined;
  const prevSlug = prevResult.rows[0]?.slug as string | undefined;
  const nextRow = nextResult.rows[0];
  const nextSlug = nextRow?.slug as string | undefined;
  const lastSlug = lastResult.rows[0]?.slug as string | undefined;

  const prefetchImages = nextRow
    ? {
        imageUrl: nextRow.image_url as string,
        imageMobileUrl: nextRow.image_mobile_url as string | null,
        updatedAt: String(nextRow.updated_at),
      }
    : null;

  return (
    <ComicPageView
      page={page}
      firstSlug={firstSlug && firstSlug !== page.slug ? firstSlug : null}
      prevSlug={prevSlug ?? null}
      nextSlug={nextSlug ?? null}
      lastSlug={lastSlug && lastSlug !== page.slug ? lastSlug : null}
      prefetchImages={prefetchImages}
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
