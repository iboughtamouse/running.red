import { db } from "@/lib/db";
import { AboutForm } from "@/components/admin/about-form";

import type { AboutPage } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminAboutPage() {
  const result = await db.query("SELECT * FROM about_page LIMIT 1");

  const row = result.rows[0];
  const data: AboutPage = {
    id: row.id as number,
    aboutMe: (row.about_me as string) || "",
    aboutComic: (row.about_comic as string) || "",
    contentWarnings: (row.content_warnings as string) || "",
    updateSchedule: (row.update_schedule as string) || "",
  };

  return <AboutForm initialData={data} />;
}
