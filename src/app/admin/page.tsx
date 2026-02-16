import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const comicsResult = await db.query("SELECT COUNT(*) FROM comic_pages");
  const publishedResult = await db.query(
    "SELECT COUNT(*) FROM comic_pages WHERE status = 'published'"
  );
  const draftsResult = await db.query(
    "SELECT COUNT(*) FROM comic_pages WHERE status = 'draft'"
  );

  const total = Number(comicsResult.rows[0]?.count ?? 0);
  const published = Number(publishedResult.rows[0]?.count ?? 0);
  const drafts = Number(draftsResult.rows[0]?.count ?? 0);

  return (
    <div>
      <h2 className="text-xl font-bold">Dashboard</h2>

      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="rounded border border-gray-300 bg-white p-4">
          <p className="text-2xl font-bold">{total}</p>
          <p className="text-sm text-gray-500">Total Pages</p>
        </div>
        <div className="rounded border border-gray-300 bg-white p-4">
          <p className="text-2xl font-bold">{published}</p>
          <p className="text-sm text-gray-500">Published</p>
        </div>
        <div className="rounded border border-gray-300 bg-white p-4">
          <p className="text-2xl font-bold">{drafts}</p>
          <p className="text-sm text-gray-500">Drafts</p>
        </div>
      </div>
    </div>
  );
}
