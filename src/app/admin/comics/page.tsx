import Link from "next/link";

import { db } from "@/lib/db";
import { mapComicRow } from "@/lib/mappers";

export const dynamic = "force-dynamic";

export default async function AdminComicsPage() {
  const result = await db.query(
    `SELECT * FROM comic_pages ORDER BY page_number DESC`
  );

  const pages = result.rows.map(mapComicRow);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Comic Pages</h2>
        <Link
          href="/admin/comics/new"
          className="rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800"
        >
          Add New Page
        </Link>
      </div>

      {pages.length === 0 ? (
        <p className="mt-8 text-center text-gray-500">
          No comic pages yet. Add your first page to get started.
        </p>
      ) : (
        <table className="mt-4 w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-300 text-left text-sm text-gray-500">
              <th className="py-2 font-medium">#</th>
              <th className="py-2 font-medium">Title</th>
              <th className="py-2 font-medium">Status</th>
              <th className="py-2 font-medium">Publish Date</th>
              <th className="py-2 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((page) => (
              <tr key={page.id} className="border-b border-gray-200">
                <td className="py-3 text-sm">{page.pageNumber}</td>
                <td className="py-3 text-sm">{page.title || "(untitled)"}</td>
                <td className="py-3 text-sm">
                  <span
                    className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
                      page.status === "published"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {page.status}
                  </span>
                </td>
                <td className="py-3 text-sm text-gray-500">
                  {new Date(page.publishDate).toLocaleDateString()}
                </td>
                <td className="py-3 text-right text-sm">
                  <Link
                    href={`/admin/comics/${page.slug}`}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
