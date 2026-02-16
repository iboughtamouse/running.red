// Content Warning Types
export const CONTENT_WARNING_TYPES = {
  ABUSE: "abuse",
  TRAUMA: "trauma",
  SELF_HARM_SUICIDE: "self-harm-suicide",
  EATING_DISORDERS: "eating-disorders",
  VIOLENCE: "violence",
  DEATH_DYING: "death-dying",
  MENTAL_ILLNESS: "mental-illness",
} as const;

export type ContentWarningType =
  (typeof CONTENT_WARNING_TYPES)[keyof typeof CONTENT_WARNING_TYPES];

// Comic Page
export interface ComicPage {
  id: number;
  pageNumber: number;
  slug: string;
  title: string | null;
  imageUrl: string;
  imageMobileUrl: string | null;
  imageBlurHash: string | null;
  commentary: string | null;
  contentWarnings: ContentWarningType[];
  contentWarningOther: string | null;
  publishDate: string;
  status: "draft" | "published";
  createdAt: string;
  updatedAt: string;
}

// About Page
export interface AboutPage {
  id: number;
  aboutMe: string;
  aboutComic: string;
  contentWarnings: string;
  updateSchedule: string;
}

// Links Page
export interface Link {
  title: string;
  url: string;
  description?: string;
}

export interface LinksPage {
  id: number;
  links: Link[];
}

// Site Settings
export interface SiteSettings {
  id: number;
  siteTitle: string;
  siteDescription: string;
  socialImageUrl: string | null;
}
