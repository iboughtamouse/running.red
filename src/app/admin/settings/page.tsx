import { db } from "@/lib/db";
import { SettingsForm } from "@/components/admin/settings-form";

import type { SiteSettings } from "@/lib/types";

export default async function AdminSettingsPage() {
  const result = await db.query("SELECT * FROM site_settings LIMIT 1");

  const row = result.rows[0];
  const data: SiteSettings = {
    id: row.id as number,
    siteTitle: (row.site_title as string) || "",
    siteDescription: (row.site_description as string) || "",
    socialImageUrl: (row.social_image_url as string | null) ?? null,
  };

  return <SettingsForm initialData={data} />;
}
