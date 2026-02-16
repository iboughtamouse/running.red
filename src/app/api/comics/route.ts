import { db } from "@/lib/db";

import type { ComicPage, ContentWarningType } from "@/lib/types";

/**
 * GET /api/comics
 * List published comic pages, ordered by page number ascending.
 */
export async function GET(): Promise<Response> {
  const result = await db.query(
    `SELECT id, page_number, slug, title, image_url, image_mobile_url,
            image_blur_hash, commentary, content_warnings, content_warning_other,
            publish_date, status, created_at, updated_at
     FROM comic_pages
     WHERE status = 'published' AND publish_date <= NOW()
     ORDER BY page_number ASC`
  );

  const pages: ComicPage[] = result.rows.map(mapRow);

  return Response.json(pages);
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
    contentWarnings: (row.content_warnings as ContentWarningType[]) || [],
    contentWarningOther: row.content_warning_other as string | null,
    publishDate: String(row.publish_date),
    status: row.status as "draft" | "published",
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}
