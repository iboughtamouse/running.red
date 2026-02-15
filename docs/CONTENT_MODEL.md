# Content Model

**Last updated:** 2026-02-15

---

## Overview

This document describes all data structures in the Running Red project. The database uses **PostgreSQL**, and all content metadata is stored in tables (images are stored in Cloudflare R2).

---

## Database Schema

### Tables

1. **comic_pages** — The comic pages (collection)
2. **about_page** — About page content (singleton)
3. **links_page** — Links page content (singleton)
4. **site_settings** — Global site settings (singleton)

**Note on singletons:** These tables only ever have 1 row. They're not collections (many items), they're single pieces of content.

---

## Table: `comic_pages`

**Purpose:** Stores metadata for each comic page.

**Schema:**

```sql
CREATE TABLE comic_pages (
  -- Primary key
  id SERIAL PRIMARY KEY,

  -- Core fields
  page_number INTEGER UNIQUE NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255),

  -- Image URLs (stored in R2)
  image_url VARCHAR(500) NOT NULL,           -- Desktop WebP
  image_mobile_url VARCHAR(500),             -- Mobile WebP
  image_blur_hash TEXT,                      -- Base64 blur placeholder

  -- Content
  commentary TEXT,                           -- Markdown or plain text

  -- Content warnings (multiselect from predefined list)
  content_warnings TEXT[] DEFAULT '{}',     -- Array of warning types
  content_warning_other TEXT,               -- Free text for "Other"

  -- Publishing
  publish_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'draft',        -- 'draft' or 'published'

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_comic_pages_status ON comic_pages(status);
CREATE INDEX idx_comic_pages_publish_date ON comic_pages(publish_date);
CREATE INDEX idx_comic_pages_page_number ON comic_pages(page_number);
```

**Field Details:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | Serial | Yes | Auto-incrementing primary key |
| `page_number` | Integer | Yes | Sequential page number (1, 2, 3...). Must be unique. Used for ordering and navigation. |
| `slug` | Varchar(255) | Yes | URL-safe identifier (e.g., "page-1", "page-42"). Must be unique. Auto-generated from page_number. |
| `title` | Varchar(255) | No | Optional title for the page (e.g., "The Reckoning"). Can be null. |
| `image_url` | Varchar(500) | Yes | R2 URL for the desktop WebP image (e.g., "https://...r2.../images/page-42-desktop.webp") |
| `image_mobile_url` | Varchar(500) | No | R2 URL for the mobile WebP image. Can be null (falls back to desktop). |
| `image_blur_hash` | Text | No | Base64-encoded tiny placeholder image (for loading state). Can be null. |
| `commentary` | Text | No | Author's notes displayed below the comic page. Markdown or plain text. Can be null. |
| `content_warnings` | Text[] | No | Array of content warning types. Valid values: `'abuse'`, `'trauma'`, `'self-harm-suicide'`, `'eating-disorders'`, `'violence'`, `'death-dying'`, `'mental-illness'`. Empty array = no warnings. |
| `content_warning_other` | Text | No | Free text for content warnings not covered by predefined list. Only shown if not null. |
| `publish_date` | Date | Yes | The date when this page becomes visible to readers. Pages with future dates are hidden. |
| `status` | Varchar(20) | Yes | Either "draft" or "published". Drafts are only visible in admin. Defaults to "draft". |
| `created_at` | Timestamp | Yes | When the row was created. Auto-set. |
| `updated_at` | Timestamp | Yes | When the row was last updated. Auto-set (needs trigger or app-level update). |

**Example Row:**

```sql
INSERT INTO comic_pages (
  page_number, slug, title, image_url, image_mobile_url, image_blur_hash,
  commentary, content_warnings, content_warning_other, publish_date, status
) VALUES (
  42,
  'page-42',
  'The Reckoning',
  'https://pub-abc123.r2.dev/images/page-42-desktop.webp',
  'https://pub-abc123.r2.dev/images/page-42-mobile.webp',
  'data:image/webp;base64,UklGRi...',
  'This took forever to draw! Hope you like it.',
  ARRAY['violence', 'death-dying'],
  NULL,
  '2026-02-17',
  'published'
);
```

**Common Queries:**

Get all published pages:
```sql
SELECT * FROM comic_pages
WHERE status = 'published'
  AND publish_date <= CURRENT_DATE
ORDER BY page_number ASC;
```

Get latest published page:
```sql
SELECT * FROM comic_pages
WHERE status = 'published'
  AND publish_date <= CURRENT_DATE
ORDER BY page_number DESC
LIMIT 1;
```

Get a specific page by slug:
```sql
SELECT * FROM comic_pages
WHERE slug = 'page-42'
  AND status = 'published'
  AND publish_date <= CURRENT_DATE;
```

Get previous/next pages:
```sql
-- Previous page (highest page_number less than current)
SELECT * FROM comic_pages
WHERE page_number < 42
  AND status = 'published'
  AND publish_date <= CURRENT_DATE
ORDER BY page_number DESC
LIMIT 1;

-- Next page (lowest page_number greater than current)
SELECT * FROM comic_pages
WHERE page_number > 42
  AND status = 'published'
  AND publish_date <= CURRENT_DATE
ORDER BY page_number ASC
LIMIT 1;
```

**Content Warning Values:**

Pages can have multiple content warnings. Valid predefined values:

| Value | Display Label |
|-------|---------------|
| `abuse` | Abuse |
| `trauma` | Trauma |
| `self-harm-suicide` | Self-harm/Suicide |
| `eating-disorders` | Eating Disorders |
| `violence` | Violence |
| `death-dying` | Death/Dying |
| `mental-illness` | Mental Illness |

If none of the predefined values fit, use the `content_warning_other` field for custom text.

**Display Logic:**
- If `content_warnings` array is empty AND `content_warning_other` is null → No warning shown
- If `content_warnings` has values → Show blur overlay with list of warnings
- If `content_warning_other` is set → Also display in warning list

---

## Table: `about_page`

**Purpose:** Stores content for the About page.

**Schema:**

```sql
CREATE TABLE about_page (
  id SERIAL PRIMARY KEY,
  about_me TEXT NOT NULL,
  about_comic TEXT NOT NULL,
  content_warnings TEXT NOT NULL,
  update_schedule VARCHAR(255) NOT NULL DEFAULT 'Updates Mondays'
);

-- Ensure only 1 row exists
CREATE UNIQUE INDEX idx_about_page_singleton ON about_page ((1));
```

**Field Details:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | Serial | Yes | Primary key (always 1) |
| `about_me` | Text | Yes | "About Me" section content. Markdown or plain text. |
| `about_comic` | Text | Yes | "About the Comic" section content. Markdown or plain text. |
| `content_warnings` | Text | Yes | "Content Warnings" section content. Markdown or plain text. |
| `update_schedule` | Varchar(255) | Yes | Update schedule text (e.g., "Updates Mondays"). Plain text. |

**Example Row:**

```sql
INSERT INTO about_page (about_me, about_comic, content_warnings, update_schedule)
VALUES (
  'I''m Ren, a queer artist living in the Pacific Northwest. I''ve been drawing for 15 years...',
  'Running Red follows Alexandrus, a character I created when I was 13...',
  'This comic contains themes of trauma, abuse, mental health, violence, and death. Reader discretion advised.',
  'Updates Mondays'
);
```

**Common Queries:**

Get the about page content:
```sql
SELECT * FROM about_page LIMIT 1;
```

Update the about page:
```sql
UPDATE about_page
SET about_me = 'New bio...',
    about_comic = 'New description...',
    content_warnings = 'Updated warnings...',
    update_schedule = 'Updates Mondays'
WHERE id = 1;
```

---

## Table: `links_page`

**Purpose:** Stores external links (Patreon, Twitch, etc.).

**Schema:**

```sql
CREATE TABLE links_page (
  id SERIAL PRIMARY KEY,
  links JSONB NOT NULL DEFAULT '[]'::jsonb
);

-- Ensure only 1 row exists
CREATE UNIQUE INDEX idx_links_page_singleton ON links_page ((1));
```

**Field Details:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | Serial | Yes | Primary key (always 1) |
| `links` | JSONB | Yes | Array of link objects: `[{title, url, description}, ...]`. Order matters (displayed in order). |

**JSONB Structure:**

```typescript
// TypeScript type
interface Link {
  title: string;        // e.g., "Patreon"
  url: string;          // e.g., "https://patreon.com/ren"
  description?: string; // e.g., "Support the comic!" (optional)
}

type Links = Link[];
```

**Example Row:**

```sql
INSERT INTO links_page (links)
VALUES (
  '[
    {
      "title": "Patreon",
      "url": "https://patreon.com/ren",
      "description": "Support the comic and get early access!"
    },
    {
      "title": "Twitch",
      "url": "https://twitch.tv/ren",
      "description": "Watch me draw live"
    },
    {
      "title": "Ko-fi",
      "url": "https://ko-fi.com/ren"
    }
  ]'::jsonb
);
```

**Common Queries:**

Get all links:
```sql
SELECT links FROM links_page LIMIT 1;
```

Update links (replace entire array):
```sql
UPDATE links_page
SET links = '[
  {"title": "Patreon", "url": "https://patreon.com/ren", "description": "Support me!"},
  {"title": "Twitch", "url": "https://twitch.tv/ren"}
]'::jsonb
WHERE id = 1;
```

Add a link (append to array):
```sql
UPDATE links_page
SET links = links || '{"title": "Twitter", "url": "https://twitter.com/ren"}'::jsonb
WHERE id = 1;
```

---

## Table: `site_settings`

**Purpose:** Stores global site settings.

**Schema:**

```sql
CREATE TABLE site_settings (
  id SERIAL PRIMARY KEY,
  site_title VARCHAR(255) NOT NULL DEFAULT 'Running Red',
  site_description TEXT NOT NULL DEFAULT 'A webcomic by Ren',
  social_image_url VARCHAR(500)
);

-- Ensure only 1 row exists
CREATE UNIQUE INDEX idx_site_settings_singleton ON site_settings ((1));
```

**Field Details:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | Serial | Yes | Primary key (always 1) |
| `site_title` | Varchar(255) | Yes | Site title used in `<title>` tags and header. |
| `site_description` | Text | Yes | Default meta description for SEO. |
| `social_image_url` | Varchar(500) | No | R2 URL for the default Open Graph image. Can be null. |

**Example Row:**

```sql
INSERT INTO site_settings (site_title, site_description, social_image_url)
VALUES (
  'Running Red',
  'A webcomic by Ren about identity, trauma, and resilience.',
  'https://pub-abc123.r2.dev/images/social-default.webp'
);
```

**Common Queries:**

Get site settings:
```sql
SELECT * FROM site_settings LIMIT 1;
```

Update site settings:
```sql
UPDATE site_settings
SET site_title = 'Running Red - A Webcomic',
    site_description = 'Follow Alexandrus in this queer webcomic...',
    social_image_url = 'https://pub-abc123.r2.dev/images/social-new.webp'
WHERE id = 1;
```

---

## TypeScript Types

These types mirror the database schema for type safety in the Next.js app.

**File:** `lib/types.ts`

```typescript
// Content Warning Types
export const CONTENT_WARNING_TYPES = {
  ABUSE: 'abuse',
  TRAUMA: 'trauma',
  SELF_HARM_SUICIDE: 'self-harm-suicide',
  EATING_DISORDERS: 'eating-disorders',
  VIOLENCE: 'violence',
  DEATH_DYING: 'death-dying',
  MENTAL_ILLNESS: 'mental-illness',
} as const;

export type ContentWarningType = (typeof CONTENT_WARNING_TYPES)[keyof typeof CONTENT_WARNING_TYPES];

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
  contentWarnings: ContentWarningType[]; // Array of predefined warning types
  contentWarningOther: string | null; // Custom warning text
  publishDate: string; // ISO date string
  status: 'draft' | 'published';
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
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
```

---

## Image Storage (R2)

Images are stored in Cloudflare R2, not in the database. The database only stores URLs.

**Bucket Structure:**

```
running-red/
  originals/
    page-1.png
    page-2.png
    page-42.png
    social-default.png
  images/
    page-1-desktop.webp
    page-1-mobile.webp
    page-2-desktop.webp
    page-2-mobile.webp
    page-42-desktop.webp
    page-42-mobile.webp
    social-default.webp
```

**Naming Convention:**
- Originals: `originals/{filename}.{ext}` (e.g., `originals/page-42.png`)
- Desktop WebP: `images/{filename}-desktop.webp` (e.g., `images/page-42-desktop.webp`)
- Mobile WebP: `images/{filename}-mobile.webp` (e.g., `images/page-42-mobile.webp`)

**URL Format:**
```
https://pub-{bucket-id}.r2.dev/{path}
```

Example:
```
https://pub-abc123.r2.dev/images/page-42-desktop.webp
```

---

## Data Validation Rules

### Comic Pages

| Field | Validation |
|-------|------------|
| `page_number` | Must be positive integer, unique |
| `slug` | Must match pattern `^page-\d+$`, unique |
| `title` | Max 255 chars, optional |
| `image_url` | Must be valid URL, required |
| `image_mobile_url` | Must be valid URL if provided |
| `commentary` | No HTML tags (sanitize), optional |
| `content_warnings` | Each value must be in predefined list, optional |
| `content_warning_other` | Max 500 chars, optional |
| `publish_date` | Must be valid date, required |
| `status` | Must be 'draft' or 'published' |

### About Page

| Field | Validation |
|-------|------------|
| `about_me` | Required, max 10,000 chars |
| `about_comic` | Required, max 10,000 chars |
| `content_warnings` | Required, max 5,000 chars |
| `update_schedule` | Required, max 255 chars |

### Links Page

| Field | Validation |
|-------|------------|
| `links` | Must be valid JSON array |
| `links[].title` | Required, max 255 chars |
| `links[].url` | Required, valid URL |
| `links[].description` | Optional, max 500 chars |

### Site Settings

| Field | Validation |
|-------|------------|
| `site_title` | Required, max 255 chars |
| `site_description` | Required, max 1,000 chars |
| `social_image_url` | Valid URL if provided |

---

## Relationships

There are no foreign key relationships in this schema (no joins needed). Each table is independent:

- `comic_pages` is a collection (many rows)
- `about_page`, `links_page`, `site_settings` are singletons (1 row each)

**Why no relationships?**
- Simple content model (no comments, no users, no categories)
- No need for joins
- Each table is queried independently

---

## Migrations

Database schema changes should be managed with migrations. Use a tool like:
- **Prisma Migrate** (if using Prisma ORM)
- **node-pg-migrate** (if using raw SQL)
- **Drizzle Kit** (if using Drizzle ORM)

**Initial migration:**
```sql
-- Create all tables (see schemas above)
-- Insert default rows for singletons
```

**Future migrations:**
- Add/remove columns
- Change column types
- Add indexes
- Update default values

---

## Seeding (Initial Data)

When setting up a new database, seed with default data:

```sql
-- Seed site settings
INSERT INTO site_settings (site_title, site_description)
VALUES ('Running Red', 'A webcomic by Ren');

-- Seed about page
INSERT INTO about_page (about_me, about_comic, content_warnings, update_schedule)
VALUES (
  'I'm Ren, the creator of Running Red.',
  'Running Red is a story about Alexandrus.',
  'This comic contains sensitive themes.',
  'Updates Mondays'
);

-- Seed links page
INSERT INTO links_page (links)
VALUES ('[]'::jsonb);
```

---

## Related Docs

- **[ARCHITECTURE.md](ARCHITECTURE.md)** — How data flows through the system
- **[PRODUCT.md](PRODUCT.md)** — What content the user sees
- **[CONVENTIONS.md](CONVENTIONS.md)** — Database naming conventions
