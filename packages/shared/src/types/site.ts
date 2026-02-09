/**
 * Site-wide settings managed via CMS global.
 */
export interface SiteSettings {
  siteTitle: string;
  siteDescription: string;
  socialImage?: {
    url: string;
    width: number;
    height: number;
  };
}

/**
 * About page content managed via CMS global.
 */
export interface AboutPage {
  aboutMe: unknown; // Rich text — shape depends on Payload's serialization
  aboutComic: unknown;
  contentWarnings: unknown;
  updateSchedule: string;
}

/**
 * A single external link on the Links page.
 */
export interface ExternalLink {
  title: string;
  url: string;
  description?: string;
}

/**
 * Links page content managed via CMS global.
 */
export interface LinksPage {
  links: ExternalLink[];
}
