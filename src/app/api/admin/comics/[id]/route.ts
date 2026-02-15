import { db } from "@/lib/db";
import { imageKeys, processImage } from "@/lib/image";
import { deleteFile, uploadFile } from "@/lib/r2";

import type { ComicPage, ContentWarningType } from "@/lib/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/comics/[id]
 * Fetch a single comic page by ID.
 */
export async function GET(_request: Request, { params }: RouteParams): Promise<Response> {
  const { id } = await params;

  const result = await db.query("SELECT * FROM comic_pages WHERE id = $1", [id]);

  if (result.rows.length === 0) {
    return Response.json({ error: "Comic page not found" }, { status: 404 });
  }

  return Response.json(mapRow(result.rows[0]));
}

/**
 * PUT /api/admin/comics/[id]
 * Update a comic page. Accepts multipart/form-data (image is optional for updates).
 */
export async function PUT(request: Request, { params }: RouteParams): Promise<Response> {
  const { id } = await params;

  // Check page exists
  const existing = await db.query("SELECT * FROM comic_pages WHERE id = $1", [id]);
  if (existing.rows.length === 0) {
    return Response.json({ error: "Comic page not found" }, { status: 404 });
  }
  const currentPage = existing.rows[0];

  const formData = await request.formData();

  const pageNumber = formData.has("pageNumber")
    ? Number(formData.get("pageNumber"))
    : (currentPage.page_number as number);
  const title = formData.has("title") ? (formData.get("title") as string | null) : undefined;
  const commentary = formData.has("commentary")
    ? (formData.get("commentary") as string | null)
    : undefined;
  const publishDate = formData.has("publishDate")
    ? (formData.get("publishDate") as string)
    : undefined;
  const status = formData.has("status") ? (formData.get("status") as string) : undefined;
  const contentWarningsRaw = formData.get("contentWarnings") as string | null;
  const contentWarningOther = formData.has("contentWarningOther")
    ? (formData.get("contentWarningOther") as string | null)
    : undefined;
  const image = formData.get("image") as File | null;

  if (status && status !== "draft" && status !== "published") {
    return Response.json({ error: "status must be 'draft' or 'published'" }, { status: 400 });
  }

  // If page number changed, check for duplicates and update slug
  if (pageNumber !== currentPage.page_number) {
    const duplicate = await db.query(
      "SELECT id FROM comic_pages WHERE page_number = $1 AND id != $2",
      [pageNumber, id]
    );
    if (duplicate.rows.length > 0) {
      return Response.json({ error: `Page number ${pageNumber} already exists` }, { status: 409 });
    }
  }

  const slug = `page-${pageNumber}`;

  // Process new image if provided
  let imageUrl = currentPage.image_url as string;
  let imageMobileUrl = currentPage.image_mobile_url as string;
  let imageBlurHash = currentPage.image_blur_hash as string;

  if (image && image instanceof File && image.size > 0) {
    const imageBuffer = Buffer.from(await image.arrayBuffer());
    const processed = await processImage(imageBuffer);

    // Delete old images from R2
    const oldKeys = imageKeys(currentPage.page_number as number);
    await Promise.all([deleteFile(oldKeys.desktop), deleteFile(oldKeys.mobile)]);

    // Upload new images
    const newKeys = imageKeys(pageNumber);
    await Promise.all([
      uploadFile(newKeys.desktop, processed.desktop, "image/webp"),
      uploadFile(newKeys.mobile, processed.mobile, "image/webp"),
    ]);

    imageUrl = newKeys.desktop;
    imageMobileUrl = newKeys.mobile;
    imageBlurHash = processed.blurDataUrl;
  } else if (pageNumber !== currentPage.page_number) {
    // Page number changed but no new image — keep existing R2 keys.
    // The files stay at their original paths; only the DB references matter.
    const oldKeys = imageKeys(currentPage.page_number as number);
    imageUrl = oldKeys.desktop;
    imageMobileUrl = oldKeys.mobile;
  }

  const contentWarnings: string[] = contentWarningsRaw
    ? JSON.parse(contentWarningsRaw)
    : (currentPage.content_warnings as string[]);

  const result = await db.query(
    `UPDATE comic_pages SET
      page_number = $1, slug = $2, title = $3, image_url = $4, image_mobile_url = $5,
      image_blur_hash = $6, commentary = $7, content_warnings = $8, content_warning_other = $9,
      publish_date = $10, status = $11, updated_at = NOW()
    WHERE id = $12
    RETURNING *`,
    [
      pageNumber,
      slug,
      title !== undefined ? title || null : currentPage.title,
      imageUrl,
      imageMobileUrl,
      imageBlurHash,
      commentary !== undefined ? commentary || null : currentPage.commentary,
      contentWarnings,
      contentWarningOther !== undefined
        ? contentWarningOther || null
        : currentPage.content_warning_other,
      publishDate || currentPage.publish_date,
      status || currentPage.status,
      id,
    ]
  );

  return Response.json(mapRow(result.rows[0]));
}

/**
 * DELETE /api/admin/comics/[id]
 * Delete a comic page and its images from R2.
 */
export async function DELETE(_request: Request, { params }: RouteParams): Promise<Response> {
  const { id } = await params;

  const existing = await db.query(
    "SELECT page_number FROM comic_pages WHERE id = $1",
    [id]
  );

  if (existing.rows.length === 0) {
    return Response.json({ error: "Comic page not found" }, { status: 404 });
  }

  const pageNumber = existing.rows[0].page_number as number;

  // Delete images from R2
  const keys = imageKeys(pageNumber);
  await Promise.all([deleteFile(keys.desktop), deleteFile(keys.mobile)]);

  // Delete from database
  await db.query("DELETE FROM comic_pages WHERE id = $1", [id]);

  return Response.json({ success: true });
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
