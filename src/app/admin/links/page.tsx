import { db } from "@/lib/db";
import { LinksForm } from "@/components/admin/links-form";

import type { Link } from "@/lib/types";

export default async function AdminLinksPage() {
  const result = await db.query("SELECT * FROM links_page LIMIT 1");

  const links: Link[] = (result.rows[0]?.links as Link[]) || [];

  return <LinksForm initialLinks={links} />;
}
