import { db } from "@/lib/db";
import { imageKeys, processImage } from "@/lib/image";
import { uploadFile } from "@/lib/r2";

import type { ComicPage, ContentWarningType } from "@/lib/types";

/**
 * GET /api/admin/comics
 * List all comic pages (including drafts), ordered by page number descending.
 */
export async function GET(): Promise<Response> {
  const result = await db.query(
    `SELECT id, page_number, slug, title, image_url, image_mobile_url,
            image_blur_hash, commentary, content_warnings, content_warning_other,
            publish_date, status, created_at, updated_at
     FROM comic_pages
     ORDER BY page_number DESC`
  );

  const pages: ComicPage[] = result.rows.map(mapRow);

  return Response.json(pages);
}

/**
 * POST /api/admin/comics
 * Create a new comic page. Expects multipart/form-data with an image file.
 */
export async function POST(request: Request): Promise<Response> {
  const formData = await request.formData();

  // Extract fields
  const pageNumber = Number(formData.get("pageNumber"));
  const title = formData.get("title") as string | null;
  const commentary = formData.get("commentary") as string | null;
  const publishDate = formData.get("publishDate") as string | null;
  const status = (formData.get("status") as string) || "draft";
  const contentWarningsRaw = formData.get("contentWarnings") as string | null;
  const contentWarningOther = formData.get("contentWarningOther") as string | null;
  const image = formData.get("image") as File | null;

  // Validate required fields
  if (!pageNumber || isNaN(pageNumber)) {
    return Response.json({ error: "pageNumber is required and must be a number" }, { status: 400 });
  }
  if (!publishDate) {
    return Response.json({ error: "publishDate is required" }, { status: 400 });
  }
  if (!image || !(image instanceof File)) {
    return Response.json({ error: "image file is required" }, { status: 400 });
  }
  if (status !== "draft" && status !== "published") {
    return Response.json({ error: "status must be 'draft' or 'published'" }, { status: 400 });
  }

  // Check for duplicate page number
  const existing = await db.query("SELECT id FROM comic_pages WHERE page_number = $1", [
    pageNumber,
  ]);
  if (existing.rows.length > 0) {
    return Response.json({ error: `Page number ${pageNumber} already exists` }, { status: 409 });
  }

  // Parse content warnings (sent as JSON array string)
  const contentWarnings: string[] = contentWarningsRaw ? JSON.parse(contentWarningsRaw) : [];

  // Generate slug from page number
  const slug = `page-${pageNumber}`;

  // Process image
  const imageBuffer = Buffer.from(await image.arrayBuffer());
  const processed = await processImage(imageBuffer);

  // Upload to R2
  const keys = imageKeys(pageNumber);
  await Promise.all([
    uploadFile(keys.desktop, processed.desktop, "image/webp"),
    uploadFile(keys.mobile, processed.mobile, "image/webp"),
  ]);

  // Insert into database
  const result = await db.query(
    `INSERT INTO comic_pages (
      page_number, slug, title, image_url, image_mobile_url, image_blur_hash,
      commentary, content_warnings, content_warning_other, publish_date, status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *`,
    [
      pageNumber,
      slug,
      title || null,
      keys.desktop,
      keys.mobile,
      processed.blurDataUrl,
      commentary || null,
      contentWarnings,
      contentWarningOther || null,
      publishDate,
      status,
    ]
  );

  return Response.json(mapRow(result.rows[0]), { status: 201 });
}

// Map snake_case DB row to camelCase ComicPage
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
