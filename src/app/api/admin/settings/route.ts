import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { mapSettingsRow } from "@/lib/mappers";

/**
 * GET /api/admin/settings
 * Fetch the singleton site settings.
 */
export async function GET(): Promise<Response> {
  const result = await db.query("SELECT * FROM site_settings LIMIT 1");

  if (result.rows.length === 0) {
    return Response.json({ error: "Site settings not found" }, { status: 404 });
  }

  return Response.json(mapSettingsRow(result.rows[0]));
}

/**
 * PUT /api/admin/settings
 * Update site settings.
 */
export async function PUT(request: Request): Promise<Response> {
  const body = await request.json();
  const { siteTitle, siteDescription, socialImageUrl } = body as {
    siteTitle?: string;
    siteDescription?: string;
    socialImageUrl?: string | null;
  };

  const existing = await db.query("SELECT * FROM site_settings LIMIT 1");
  if (existing.rows.length === 0) {
    return Response.json({ error: "Site settings not found" }, { status: 404 });
  }
  const current = existing.rows[0];

  const result = await db.query(
    `UPDATE site_settings SET
      site_title = $1, site_description = $2, social_image_url = $3
    WHERE id = $4
    RETURNING *`,
    [
      siteTitle ?? current.site_title,
      siteDescription ?? current.site_description,
      socialImageUrl !== undefined ? socialImageUrl : current.social_image_url,
      current.id,
    ]
  );

  revalidatePath("/", "layout");

  return Response.json(mapSettingsRow(result.rows[0]));
}
