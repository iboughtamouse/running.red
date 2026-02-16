import sharp from "sharp";

interface ProcessedImage {
  desktop: Buffer;
  mobile: Buffer;
  blurDataUrl: string;
}

/**
 * Process an uploaded image into desktop WebP, mobile WebP, and a blur placeholder.
 *
 * - Desktop: max 1200px width, WebP at 85% quality
 * - Mobile: max 800px width, WebP at 80% quality
 * - Blur: 20px width, base64 data URL
 */
export async function processImage(input: Buffer): Promise<ProcessedImage> {
  const image = sharp(input);

  const [desktop, mobile, blurDataUrl] = await Promise.all([
    image
      .clone()
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer(),
    image
      .clone()
      .resize({ width: 800, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer(),
    generateBlurDataUrl(image.clone()),
  ]);

  return { desktop, mobile, blurDataUrl };
}

async function generateBlurDataUrl(image: sharp.Sharp): Promise<string> {
  const buffer = await image
    .resize({ width: 20 })
    .webp({ quality: 20 })
    .toBuffer();

  return `data:image/webp;base64,${buffer.toString("base64")}`;
}

/**
 * Build R2 object key for a new original upload.
 * Timestamped so originals accumulate (never overwritten or deleted).
 */
export function originalKey(pageNumber: number, extension: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `originals/page-${pageNumber}-${timestamp}.${extension}`;
}

/**
 * Build R2 object keys for the current serving variants.
 * These get overwritten when an image is replaced.
 */
export function servingKeys(pageNumber: number): {
  desktop: string;
  mobile: string;
} {
  return {
    desktop: `images/page-${pageNumber}-desktop.webp`,
    mobile: `images/page-${pageNumber}-mobile.webp`,
  };
}
