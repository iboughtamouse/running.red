import type { AboutPage, ComicPage, ContentWarningType, Link, LinksPage, SiteSettings } from "@/lib/types";

/** Map a snake_case DB row to a camelCase ComicPage. */
export function mapComicRow(row: Record<string, unknown>): ComicPage {
  return {
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
}

/** Map a snake_case DB row to a camelCase AboutPage. */
export function mapAboutRow(row: Record<string, unknown>): AboutPage {
  return {
    id: row.id as number,
    aboutMe: (row.about_me as string) || "",
    aboutComic: (row.about_comic as string) || "",
    contentWarnings: (row.content_warnings as string) || "",
    updateSchedule: (row.update_schedule as string) || "",
  };
}

/** Map a snake_case DB row to a camelCase LinksPage. */
export function mapLinksRow(row: Record<string, unknown>): LinksPage {
  return {
    id: row.id as number,
    links: row.links as Link[],
  };
}

/** Map a snake_case DB row to a camelCase SiteSettings. */
export function mapSettingsRow(row: Record<string, unknown>): SiteSettings {
  return {
    id: row.id as number,
    siteTitle: (row.site_title as string) || "",
    siteDescription: (row.site_description as string) || "",
    socialImageUrl: (row.social_image_url as string | null) ?? null,
  };
}
