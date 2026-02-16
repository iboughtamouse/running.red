import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { mapSettingsRow } from "@/lib/mappers";
import { SettingsForm } from "@/components/admin/settings-form";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const result = await db.query("SELECT * FROM site_settings LIMIT 1");

  if (result.rows.length === 0) {
    notFound();
  }

  return <SettingsForm initialData={mapSettingsRow(result.rows[0])} />;
}
