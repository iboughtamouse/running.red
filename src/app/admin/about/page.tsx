import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { mapAboutRow } from "@/lib/mappers";
import { AboutForm } from "@/components/admin/about-form";

export const dynamic = "force-dynamic";

export default async function AdminAboutPage() {
  const result = await db.query("SELECT * FROM about_page LIMIT 1");

  if (result.rows.length === 0) {
    notFound();
  }

  return <AboutForm initialData={mapAboutRow(result.rows[0])} />;
}
