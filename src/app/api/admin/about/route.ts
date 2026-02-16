import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { mapAboutRow } from "@/lib/mappers";

/**
 * GET /api/admin/about
 * Fetch the singleton about page.
 */
export async function GET(): Promise<Response> {
  const result = await db.query("SELECT * FROM about_page LIMIT 1");

  if (result.rows.length === 0) {
    return Response.json({ error: "About page not found" }, { status: 404 });
  }

  return Response.json(mapAboutRow(result.rows[0]));
}

/**
 * PUT /api/admin/about
 * Update the singleton about page.
 */
export async function PUT(request: Request): Promise<Response> {
  const body = await request.json();
  const { aboutMe, aboutComic, contentWarnings, updateSchedule } = body as {
    aboutMe?: string;
    aboutComic?: string;
    contentWarnings?: string;
    updateSchedule?: string;
  };

  const existing = await db.query("SELECT * FROM about_page LIMIT 1");
  if (existing.rows.length === 0) {
    return Response.json({ error: "About page not found" }, { status: 404 });
  }
  const current = existing.rows[0];

  const result = await db.query(
    `UPDATE about_page SET
      about_me = $1, about_comic = $2, content_warnings = $3, update_schedule = $4
    WHERE id = $5
    RETURNING *`,
    [
      aboutMe ?? current.about_me,
      aboutComic ?? current.about_comic,
      contentWarnings ?? current.content_warnings,
      updateSchedule ?? current.update_schedule,
      current.id,
    ]
  );

  revalidatePath("/about");

  return Response.json(mapAboutRow(result.rows[0]));
}
