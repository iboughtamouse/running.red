import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { originalKey, processImage, servingKeys } from "@/lib/image";
import { mapComicRow } from "@/lib/mappers";
import { uploadFile } from "@/lib/r2";

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

  const pages = result.rows.map(mapComicRow);

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

  // Validate image size (max 20MB)
  if (image.size > 20 * 1024 * 1024) {
    return Response.json({ error: "Image must be under 20MB" }, { status: 400 });
  }

  // Check for duplicate page number
  const existing = await db.query("SELECT id FROM comic_pages WHERE page_number = $1", [
    pageNumber,
  ]);
  if (existing.rows.length > 0) {
    return Response.json({ error: `Page number ${pageNumber} already exists` }, { status: 409 });
  }

  // Parse content warnings (sent as JSON array string)
  let contentWarnings: string[] = [];
  if (contentWarningsRaw) {
    try {
      contentWarnings = JSON.parse(contentWarningsRaw);
    } catch {
      return Response.json({ error: "contentWarnings must be valid JSON" }, { status: 400 });
    }
  }

  // Generate slug from page number
  const slug = `page-${pageNumber}`;

  // Process image
  const imageBuffer = Buffer.from(await image.arrayBuffer());
  const processed = await processImage(imageBuffer);

  // Upload original (timestamped, never deleted) + serving variants to R2
  const ext = image.name.split(".").pop()?.toLowerCase() || "png";
  const origKey = originalKey(pageNumber, ext);
  const keys = servingKeys(pageNumber);
  await Promise.all([
    uploadFile(origKey, imageBuffer, image.type || "image/png"),
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
      `${publishDate}T12:00:00Z`,
      status,
    ]
  );

  revalidatePath("/");
  revalidatePath("/archive");
  revalidatePath("/rss.xml");
  revalidatePath(`/comic/${slug}`);

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

  return Response.json(mapComicRow(result.rows[0]), { status: 201 });
}
