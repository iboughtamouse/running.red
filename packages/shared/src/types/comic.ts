import type { RichText } from './rich-text';

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
 *
 * Note on `image`: Payload returns a string (ID) at depth=0,
 * or a full MediaItem object at depth>=1. The API client should
 * always request depth>=1 so consumers get the full object.
 */
export interface ComicPage {
  id: string;
  title?: string;
  slug: string;
  pageNumber: number;
  image: string | MediaItem;
  commentary?: RichText | null;
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
