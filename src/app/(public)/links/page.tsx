import { db } from "@/lib/db";
import type { Link } from "@/lib/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Links",
  description: "Links and resources from Running Red",
};

export const revalidate = 3600;

export default async function LinksPage() {
  const result = await db.query("SELECT links FROM links_page LIMIT 1");

  const links: Link[] = result.rows.length > 0
    ? (result.rows[0].links as Link[])
    : [];

  if (links.length === 0) {
    return (
      <div className="py-10 text-center text-foreground/60">
        <h1 className="mb-4 text-2xl font-bold text-btn-gold">Links</h1>
        <p>No links yet.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl rounded-lg bg-base/60 backdrop-blur-sm p-6">
      <h1 className="mb-6 text-2xl font-bold text-btn-gold">Links</h1>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.url}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded bg-btn-dark px-4 py-3 text-btn-gold hover:bg-btn-red hover:text-btn-dark transition-colors"
            >
              <span className="font-medium">{link.title}</span>
              {link.description && (
                <span className="mt-1 block text-sm opacity-70">
                  {link.description}
                </span>
              )}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
