import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { mapLinksRow } from "@/lib/mappers";

import type { Link } from "@/lib/types";

/**
 * GET /api/admin/links
 * Fetch the singleton links page.
 */
export async function GET(): Promise<Response> {
  const result = await db.query("SELECT * FROM links_page LIMIT 1");

  if (result.rows.length === 0) {
    return Response.json({ error: "Links page not found" }, { status: 404 });
  }

  return Response.json(mapLinksRow(result.rows[0]));
}

/**
 * PUT /api/admin/links
 * Replace the links array. Expects JSON body: { links: Link[] }
 */
export async function PUT(request: Request): Promise<Response> {
  const body = await request.json();
  const { links } = body as { links?: Link[] };

  if (!links || !Array.isArray(links)) {
    return Response.json({ error: "links array is required" }, { status: 400 });
  }

  const existing = await db.query("SELECT id FROM links_page LIMIT 1");
  if (existing.rows.length === 0) {
    return Response.json({ error: "Links page not found" }, { status: 404 });
  }

  const result = await db.query(
    "UPDATE links_page SET links = $1::jsonb WHERE id = $2 RETURNING *",
    [JSON.stringify(links), existing.rows[0].id]
  );

  revalidatePath("/links");

  return Response.json(mapLinksRow(result.rows[0]));
}
