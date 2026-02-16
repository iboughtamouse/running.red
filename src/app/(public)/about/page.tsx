import { db } from "@/lib/db";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "About Running Red and its creator",
};

export const revalidate = 3600;

export default async function AboutPage() {
  const result = await db.query("SELECT * FROM about_page LIMIT 1");

  if (result.rows.length === 0) {
    return (
      <div className="py-10 text-center text-foreground/60">
        <p>About page content coming soon.</p>
      </div>
    );
  }

  const about = result.rows[0];

  return (
    <div className="mx-auto max-w-2xl space-y-10 rounded-lg bg-base/60 backdrop-blur-sm p-6">
      <section>
        <h1 className="mb-4 text-2xl font-bold text-btn-gold">About Me</h1>
        <div className="whitespace-pre-wrap text-foreground/80">
          {about.about_me as string}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-bold text-btn-gold">About the Comic</h2>
        <div className="whitespace-pre-wrap text-foreground/80">
          {about.about_comic as string}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-bold text-btn-gold">Content Warnings</h2>
        <div className="whitespace-pre-wrap text-foreground/80">
          {about.content_warnings as string}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-bold text-btn-gold">Update Schedule</h2>
        <p className="text-foreground/80">{about.update_schedule as string}</p>
      </section>
    </div>
  );
}
