import { notFound } from "next/navigation";

import { db } from "@/lib/db";
import { EditComicForm } from "@/components/admin/edit-comic-form";

import type { ComicPage, ContentWarningType } from "@/lib/types";

export default async function EditComicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await db.query("SELECT * FROM comic_pages WHERE slug = $1", [slug]);

  if (result.rows.length === 0) {
    notFound();
  }

  const row = result.rows[0];
  const comic: ComicPage = {
    id: row.id as number,
    pageNumber: row.page_number as number,
    slug: row.slug as string,
    title: row.title as string | null,
    imageUrl: row.image_url as string,
    imageMobileUrl: row.image_mobile_url as string | null,
    imageBlurHash: row.image_blur_hash as string | null,
    commentary: row.commentary as string | null,
    contentWarnings: (row.content_warnings as ContentWarningType[]) || [],
    contentWarningOther: row.content_warning_other as string | null,
    publishDate: String(row.publish_date),
    status: row.status as "draft" | "published",
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };

  return <EditComicForm comic={comic} />;
}
