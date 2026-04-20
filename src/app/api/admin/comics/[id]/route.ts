import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { originalKey, processImage, servingKeys } from "@/lib/image";
import { mapComicRow, toPublishTimestamp } from "@/lib/mappers";
import { deleteFile, uploadFile } from "@/lib/r2";

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

  return Response.json(mapComicRow(result.rows[0]));
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
    // Validate image size (max 20MB)
    if (image.size > 20 * 1024 * 1024) {
      return Response.json({ error: "Image must be under 20MB" }, { status: 400 });
    }

    const imageBuffer = Buffer.from(await image.arrayBuffer());
    const processed = await processImage(imageBuffer);

    // Upload new original (timestamped — old originals are preserved for version history)
    const ext = image.name.split(".").pop()?.toLowerCase() || "png";
    const origKey = originalKey(pageNumber, ext);
    await uploadFile(origKey, imageBuffer, image.type || "image/png");

    // Overwrite serving variants
    const newKeys = servingKeys(pageNumber);
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
    const oldKeys = servingKeys(currentPage.page_number as number);
    imageUrl = oldKeys.desktop;
    imageMobileUrl = oldKeys.mobile;
  }

  let contentWarnings: string[];
  if (contentWarningsRaw) {
    try {
      contentWarnings = JSON.parse(contentWarningsRaw);
    } catch {
      return Response.json({ error: "contentWarnings must be valid JSON" }, { status: 400 });
    }
  } else {
    contentWarnings = currentPage.content_warnings as string[];
  }

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
      publishDate ? toPublishTimestamp(publishDate) : currentPage.publish_date,
      status || currentPage.status,
      id,
    ]
  );

  const updatedPage = mapComicRow(result.rows[0]);

  revalidatePath("/");
  revalidatePath("/archive");
  revalidatePath("/rss.xml");
  revalidatePath(`/comic/${updatedPage.slug}`);
  // If slug changed (page number changed), also revalidate the old slug
  if (updatedPage.slug !== `page-${currentPage.page_number}`) {
    revalidatePath(`/comic/page-${currentPage.page_number}`);
  }

  // Revalidate adjacent pages so their prev/next navigation updates
  const [adjPrev, adjNext] = await Promise.all([
    db.query(
      `SELECT slug FROM comic_pages WHERE page_number < $1 ORDER BY page_number DESC LIMIT 1`,
      [pageNumber]
    ),
    db.query(
      `SELECT slug FROM comic_pages WHERE page_number > $1 ORDER BY page_number ASC LIMIT 1`,
      [pageNumber]
    ),
  ]);
  if (adjPrev.rows[0]?.slug) revalidatePath(`/comic/${adjPrev.rows[0].slug}`);
  if (adjNext.rows[0]?.slug) revalidatePath(`/comic/${adjNext.rows[0].slug}`);

  return Response.json(updatedPage);
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

  // Delete serving variants from R2 (originals are preserved for version history)
  const keys = servingKeys(pageNumber);
  await Promise.all([deleteFile(keys.desktop), deleteFile(keys.mobile)]);

  // Delete from database
  await db.query("DELETE FROM comic_pages WHERE id = $1", [id]);

  revalidatePath("/");
  revalidatePath("/archive");
  revalidatePath("/rss.xml");
  revalidatePath(`/comic/page-${pageNumber}`);

  // Revalidate adjacent pages so their prev/next navigation updates
  const [adjPrev, adjNext] = await Promise.all([
    db.query(
      `SELECT slug FROM comic_pages WHERE page_number < $1 ORDER BY page_number DESC LIMIT 1`,
      [pageNumber]
    ),
    db.query(
      `SELECT slug FROM comic_pages WHERE page_number > $1 ORDER BY page_number ASC LIMIT 1`,
      [pageNumber]
    ),
  ]);
  if (adjPrev.rows[0]?.slug) revalidatePath(`/comic/${adjPrev.rows[0].slug}`);
  if (adjNext.rows[0]?.slug) revalidatePath(`/comic/${adjNext.rows[0].slug}`);

  return Response.json({ success: true });
}
