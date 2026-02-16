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

export const WARNING_LABELS: Record<ContentWarningType, string> = {
  [CONTENT_WARNING_TYPES.ABUSE]: "Abuse",
  [CONTENT_WARNING_TYPES.TRAUMA]: "Trauma",
  [CONTENT_WARNING_TYPES.SELF_HARM_SUICIDE]: "Self-harm / Suicide",
  [CONTENT_WARNING_TYPES.EATING_DISORDERS]: "Eating Disorders",
  [CONTENT_WARNING_TYPES.VIOLENCE]: "Violence",
  [CONTENT_WARNING_TYPES.DEATH_DYING]: "Death / Dying",
  [CONTENT_WARNING_TYPES.MENTAL_ILLNESS]: "Mental Illness",
};

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
