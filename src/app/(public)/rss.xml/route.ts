import { db } from "@/lib/db";

export const revalidate = 3600;

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET(): Promise<Response> {
  const result = await db.query(
    `SELECT page_number, slug, title, commentary, publish_date FROM comic_pages
     WHERE status = 'published' AND publish_date <= NOW()
     ORDER BY page_number DESC
     LIMIT 50`
  );

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://running.red";

  const items = result.rows
    .map((row) => {
      const title = row.title
        ? `Page ${row.page_number}: ${row.title}`
        : `Page ${row.page_number}`;
      const link = `${siteUrl}/comic/${row.slug}`;
      const pubDate = new Date(String(row.publish_date)).toUTCString();
      const description = row.commentary
        ? escapeXml(String(row.commentary).slice(0, 500))
        : "";

      return `    <item>
      <title>${escapeXml(title)}</title>
      <link>${link}</link>
      <guid>${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${description}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Running Red</title>
    <link>${siteUrl}</link>
    <description>A webcomic by Ren</description>
    <language>en-us</language>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
