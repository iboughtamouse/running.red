// Database types matching schema from docs/CONTENT_MODEL.md

export interface ComicPage {
  id: number;
  pageNumber: number;
  slug: string;
  title: string | null;
  imageUrl: string;
  imageMobileUrl: string | null;
  imageBlurHash: string | null;
  commentary: string | null;
  contentWarnings: string[];
  contentWarningOther: string | null;
  publishDate: Date;
  status: "draft" | "published";
  createdAt: Date;
  updatedAt: Date;
}

export interface AboutPage {
  id: number;
  aboutMe: string;
  aboutComic: string;
  contentWarnings: string;
  updateSchedule: string;
}

export interface LinksPage {
  id: number;
  links: Array<{
    title: string;
    url: string;
    description?: string;
  }>;
}

export interface SiteSettings {
  id: number;
  siteTitle: string;
  siteDescription: string;
  socialImageUrl: string | null;
}
