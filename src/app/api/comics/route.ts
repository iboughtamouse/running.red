import { db } from "@/lib/db";
import { mapComicRow } from "@/lib/mappers";

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

  const pages = result.rows.map(mapComicRow);

  return Response.json(pages);
}
