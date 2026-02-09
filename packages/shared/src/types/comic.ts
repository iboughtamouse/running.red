/**
 * Comic page status values.
 */
export const COMIC_PAGE_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
} as const;

export type ComicPageStatus =
  (typeof COMIC_PAGE_STATUS)[keyof typeof COMIC_PAGE_STATUS];

/**
 * A comic page as returned by the CMS API.
 */
export interface ComicPage {
  id: string;
  title?: string;
  slug: string;
  pageNumber: number;
  image: MediaItem;
  commentary?: string;
  contentWarning: boolean;
  contentWarningText?: string;
  publishDate: string;
  status: ComicPageStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * A media item (image) as returned by the CMS API.
 */
export interface MediaItem {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  width: number;
  height: number;
  alt?: string;
  sizes?: {
    desktop?: ImageSize;
    mobile?: ImageSize;
  };
}

/**
 * An image size variant.
 */
export interface ImageSize {
  url: string;
  width: number;
  height: number;
}
