import Link from "next/link";
import { db } from "@/lib/db";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Archive",
  description: "Browse all published pages of Running Red",
};

export const revalidate = 3600;

export default async function ArchivePage() {
  const result = await db.query(
    `SELECT page_number, slug, title, publish_date FROM comic_pages
     WHERE status = 'published' AND publish_date <= NOW()
     ORDER BY page_number ASC`
  );

  if (result.rows.length === 0) {
    return (
      <div className="py-10 text-center text-foreground/60">
        <h1 className="mb-4 text-2xl font-bold text-btn-gold">Archive</h1>
        <p>No pages published yet.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl rounded-lg bg-base/60 backdrop-blur-sm p-6">
      <h1 className="mb-6 text-2xl font-bold text-btn-gold">Archive</h1>
      <ul className="space-y-2">
        {result.rows.map((row) => (
          <li key={row.slug as string}>
            <Link
              href={`/comic/${row.slug}`}
              className="flex items-baseline gap-3 rounded px-3 py-2 hover:bg-btn-dark/30 transition-colors"
            >
              <span className="text-sm font-mono text-foreground/50">
                #{row.page_number as number}
              </span>
              <span className="text-foreground">
                {(row.title as string) || `Page ${row.page_number}`}
              </span>
              <span className="ml-auto text-sm text-foreground/40">
                {new Date(String(row.publish_date)).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
