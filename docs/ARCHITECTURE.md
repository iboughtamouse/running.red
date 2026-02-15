# Architecture

**Last updated:** 2026-02-15

---

## System Overview

Running Red is a **single Next.js application** with two sections:

1. **Public routes** (`/`, `/comic/[slug]`, `/about`, etc.) — The reader-facing website
2. **Admin routes** (`/admin/*`) — Protected interface where Ren manages content

Both sections share:

- The same codebase
- The same database (PostgreSQL)
- The same image storage (Cloudflare R2)
- The same deployment (Vercel or similar)

This is intentionally simple. One app, one deployment, one database.

---

## High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                       Next.js App (Vercel)                  │
│                                                             │
│  ┌────────────────────┐       ┌──────────────────────────┐  │
│  │  Public Routes     │       │  Admin Routes            │  │
│  │  /                 │       │  /admin (protected)      │  │
│  │  /comic/[slug]     │       │  /admin/comics           │  │
│  │  /about            │       │  /admin/about            │  │
│  │  /archive          │       │  /admin/links            │  │
│  │  /links            │       │  /admin/settings         │  │
│  │  /rss.xml          │       │                          │  │
│  └─────────┬──────────┘       └──────────┬───────────────┘  │
│            │                             │                  │
│            └─────────────┬───────────────┘                  │
│                          │                                  │
│                          ▼                                  │
│            ┌──────────────────────────┐                     │
│            │  Database Layer          │                     │
│            │  (Postgres client)       │                     │
│            └──────────┬───────────────┘                     │
└───────────────────────┼─────────────────────────────────────┘
                        │
                        ▼
         ┌──────────────────────────┐
         │  PostgreSQL Database     │
         │      (Railway)           │
         │                          │
         │  Tables:                 │
         │  - comic_pages           │
         │  - about_page            │
         │  - links_page            │
         │  - site_settings         │
         └──────────────────────────┘

         ┌──────────────────────────┐
         │  Cloudflare R2           │
         │  (Image Storage)         │
         │                          │
         │  Buckets:                │
         │  - originals/            │
         │  - images/               │
         └──────────────────────────┘
```

---

## Components

### 1. Next.js App

**Purpose:** Serves both public pages and admin interface.

**Technology:** Next.js 15 with App Router

**Key Features:**

- **Public routes** use React Server Components (no client JS unless needed)
- **Admin routes** are protected with NextAuth (or simple password auth)
- **ISR (Incremental Static Regeneration)** for comic pages — static, but revalidates
- **API routes** for image upload, database mutations, revalidation triggers

**Deployment:** Vercel (or similar JAMstack host)

**Why Next.js?**

- Built-in SSG/ISR (perfect for comic pages that are static but update weekly)
- App Router with Server Components minimizes client JS (better performance)
- Image optimization built-in
- Vercel deployment is straightforward
- File-based routing is intuitive

**Why not separate apps?**

- One deployment is simpler than two
- Shared code (components, utilities, types)
- No CORS issues
- Admin and public can share the same database client

---

### 2. Database (PostgreSQL)

**Purpose:** Store all content metadata (not images).

**Choice:** Railway — Free tier: 500MB, then $5/month

**Schema (simplified):**

```sql
-- Comic pages (the main content)
CREATE TABLE comic_pages (
  id SERIAL PRIMARY KEY,
  page_number INTEGER UNIQUE NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255),
  image_url VARCHAR(500) NOT NULL,         -- R2 URL for desktop WebP
  image_mobile_url VARCHAR(500),           -- R2 URL for mobile WebP
  image_blur_hash TEXT,                    -- Base64 blur placeholder
  commentary TEXT,                         -- Markdown or plain text
  content_warnings TEXT[] DEFAULT '{}',    -- Array of warning types
  content_warning_other TEXT,              -- Free text for "Other"
  publish_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'draft',      -- 'draft' or 'published'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- About page (singleton)
CREATE TABLE about_page (
  id SERIAL PRIMARY KEY,
  about_me TEXT NOT NULL,                  -- Markdown or rich text
  about_comic TEXT NOT NULL,
  content_warnings TEXT NOT NULL,
  update_schedule VARCHAR(255) NOT NULL
);

-- Links page (singleton)
CREATE TABLE links_page (
  id SERIAL PRIMARY KEY,
  links JSONB NOT NULL                     -- Array of {title, url, description}
);

-- Site settings (singleton)
CREATE TABLE site_settings (
  id SERIAL PRIMARY KEY,
  site_title VARCHAR(255) NOT NULL,
  site_description TEXT NOT NULL,
  social_image_url VARCHAR(500)
);
```

**Note:** Full schema details in [CONTENT_MODEL.md](CONTENT_MODEL.md)

**Why PostgreSQL?**

- Reliable, well-understood
- Generous free tiers available
- Good for structured data (comic pages, settings)
- JSONB support for flexible fields (links array)

**Why not SQLite?**

- Vercel doesn't support persistent volumes (no place to store the .db file)
- Could use SQLite locally + sync to Git, but that's weird UX for Ren's edits

**Why not Git-based (JSON/Markdown files)?**

- Ren's edits would create Git commits (confusing)
- Slower writes
- Harder to query (no SQL)

---

### 3. Image Storage (Cloudflare R2)

**Purpose:** Store comic page images (originals and processed variants).

**Technology:** Cloudflare R2 (S3-compatible object storage)

**Structure:**

```
running-red-bucket/
  originals/
    page-1.png
    page-2.png
    ...
  images/
    page-1-desktop.webp
    page-1-mobile.webp
    page-2-desktop.webp
    page-2-mobile.webp
    ...
```

**Access:** Public read via Cloudflare CDN (or signed URLs if private)

**Why R2?**

- **Zero egress fees** (downloading images is free)
- S3-compatible API (easy to work with)
- Cloudflare CDN built-in (fast delivery)
- Free tier: 10GB storage, 1M reads/month

**Why not store images in the database?**

- Databases aren't designed for large binary files
- Expensive to scale
- Slower to serve

**Why not Vercel Blob Storage?**

- Could work, but R2's zero egress is compelling
- R2 is already proven (used by many webcomics/image-heavy sites)

---

### 4. Image Processing Pipeline

**When Ren uploads a PNG:**

1. **Admin form submits** image file to API route (`/api/admin/upload-image`)
2. **Server receives file** (Node.js/Next.js API route)
3. **Process with Sharp:**
   - Resize to desktop size (max 1200px width, preserve aspect ratio)
   - Convert to WebP at 85% quality
   - Resize to mobile size (max 800px width)
   - Convert to WebP at 80% quality
   - Generate tiny blur placeholder (20px width, base64-encoded)
4. **Upload to R2:**
   - Original PNG → `originals/page-{N}.png`
   - Desktop WebP → `images/page-{N}-desktop.webp`
   - Mobile WebP → `images/page-{N}-mobile.webp`
5. **Save metadata to database:**
   - Store R2 URLs for desktop/mobile images
   - Store base64 blur hash
6. **Return success** to admin UI

**Why WebP?**

- ~30% smaller than JPEG at equivalent quality
- Universal browser support (as of 2023+)
- Better compression for both photos and graphics

**Why two sizes (desktop + mobile)?**

- Mobile users on 4G don't need 1200px images
- Responsive images (`<picture>` element with `srcset`) load the right size
- Faster page loads = better UX

---

## Data Flow

### Flow 1: Reader Views a Comic Page

1. User navigates to `running.red/comic/page-42`
2. Next.js renders page:
   - **Server Component** fetches from database:
     ```sql
     SELECT * FROM comic_pages
     WHERE slug = 'page-42'
       AND status = 'published'
       AND publish_date <= CURRENT_DATE
     ```
   - If found, renders page with image, commentary, navigation
   - If not found (404) or not published yet (404 or "coming soon")
3. Browser receives HTML with:
   - `<picture>` element with `srcset` (desktop + mobile WebP from R2)
   - Blur placeholder (base64) shown while image loads
   - Navigation buttons (First/Prev/Next/Last) based on page_number
4. User clicks "Next" → navigates to `page-43` (repeat)

**Why Server Components?**

- No client-side API calls (faster initial load)
- SEO-friendly (HTML includes content)
- Smaller JS bundle (less code shipped to browser)

---

### Flow 2: Ren Uploads a New Comic Page

1. Ren logs into `/admin` (authenticated with NextAuth or password)
2. Navigates to `/admin/comics/new`
3. Fills out form:
   - Page number: 43
   - Title: "The Reckoning" (optional)
   - Image: uploads PNG file
   - Commentary: types text (markdown or plain text)
   - Publish date: picks Monday, Feb 17
   - Content warning: checks box, adds custom text
   - Status: "published"
4. Clicks "Save"
5. Form submits to `/api/admin/comic-pages` (POST)
6. API route:
   - Validates data
   - Processes image (Sharp → WebP variants)
   - Uploads to R2
   - Inserts row into `comic_pages` table
   - Triggers revalidation of `/comic/page-43` (ISR)
7. Admin UI redirects to `/admin/comics` (list view) with success message
8. Page 43 is now live on the public site

---

### Flow 3: Ren Edits the About Page

1. Ren navigates to `/admin/about`
2. Sees form with 4 fields (pre-filled with current content):
   - About Me (markdown textarea)
   - About the Comic (markdown textarea)
   - Content Warnings (markdown textarea)
   - Update Schedule (text input)
3. Edits "About Me" section
4. Clicks "Save"
5. Form submits to `/api/admin/about` (PUT)
6. API route updates the `about_page` table (singleton — only 1 row)
7. Triggers revalidation of `/about` (ISR)
8. About page is updated immediately

---

## Authentication

**Goal:** Protect `/admin/*` routes so only Ren can access them.

**Approach:** NextAuth.js with credentials provider (or simpler password auth)

**Simple Option (Recommended):**

- Single user (Ren)
- Email + password stored in environment variables
- Login form at `/admin/login`
- Session stored in HTTP-only cookie
- Middleware protects `/admin/*` routes

**Implementation:**

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const session = getSession(request); // Check cookie
    if (!session) {
      return NextResponse.redirect("/admin/login");
    }
  }
}
```

**Why not NextAuth with OAuth (Google, GitHub)?**

- Overkill for single user
- More dependencies
- Ren just needs a simple password

**Why not role-based access control?**

- Only one user (Ren)
- No need for "editor" vs "admin" roles

---

## Deployment

### Frontend (Next.js App)

**Platform:** Vercel (recommended) or Netlify

**Process:**

1. Push to Git (main branch)
2. Vercel auto-deploys
3. Environment variables set in Vercel dashboard:
   - `DATABASE_URL` (Postgres connection string)
   - `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_ENDPOINT`
   - `ADMIN_PASSWORD` (or NextAuth secret)

**URLs:**

- Production: `running.red`
- Preview (PR branches): `*.vercel.app`

---

### Database (Railway)

- Create PostgreSQL instance in Railway dashboard
- Copy connection string to Vercel environment variables (`DATABASE_URL`)
- Free tier: 500MB, then $5/month

---

### Image Storage (R2)

**Setup:**

1. Create Cloudflare account
2. Create R2 bucket (`running-red`)
3. Generate API token (read + write)
4. Add credentials to Vercel env vars
5. Configure public access (or use signed URLs)

---

## Caching & Performance

### ISR (Incremental Static Regeneration)

Comic pages are **static-first** but can update:

```typescript
// app/comic/[slug]/page.tsx
export const revalidate = 3600; // Revalidate every hour

export async function generateStaticParams() {
  const pages = await db.getPublishedPages();
  return pages.map((p) => ({ slug: p.slug }));
}
```

**Benefits:**

- Pages are pre-rendered at build time (fast!)
- Stale pages revalidate in the background
- New pages appear within 1 hour (or on-demand revalidation)

**On-Demand Revalidation:**
When Ren publishes a new page, the API route triggers:

```typescript
revalidatePath("/comic/page-43");
revalidatePath("/archive"); // Also update archive
```

---

### Image Loading

**Strategy:**

- Blur placeholder (base64) shown immediately (from database)
- Browser loads WebP from R2 (via Cloudflare CDN)
- `<picture>` element with `srcset` loads appropriate size (desktop or mobile)
- Adjacent pages preloaded on hover/touch (for instant navigation)

**Example:**

```tsx
<picture>
  <source
    srcset={page.imageMobileUrl}
    media="(max-width: 768px)"
    type="image/webp"
  />
  <img
    src={page.imageDesktopUrl}
    alt={page.title || `Page ${page.pageNumber}`}
    loading="eager"
    style={{ background: `url(${page.blurHash})` }}
  />
</picture>
```

---

## Security

### Threats & Mitigations

| Threat                            | Mitigation                                                               |
| --------------------------------- | ------------------------------------------------------------------------ |
| Unauthorized admin access         | Password-protected `/admin` routes, HTTP-only session cookies            |
| SQL injection                     | Use parameterized queries (Postgres client handles escaping)             |
| XSS (cross-site scripting)        | Sanitize user input (commentary, titles), use React (auto-escapes)       |
| CSRF (cross-site request forgery) | CSRF tokens on admin forms (NextAuth handles this)                       |
| Image upload abuse                | Validate file type (PNG/JPEG only), max size limit (10MB), rate limiting |
| R2 bucket exposure                | Use signed URLs or restrict public access to `images/` only              |

---

## Monitoring & Error Handling

**Errors:**

- Next.js `error.tsx` boundaries at route level (show friendly error pages)
- Server errors logged to console (Vercel captures logs)
- Database errors logged, user sees "Something went wrong"

**Monitoring:**

- Vercel Analytics (built-in, tracks page views, performance)
- Optional: Sentry for error tracking (if needed later)

---

## Scalability

**Current scale:** ~100 pages/year, ~1,000 readers/week (estimate)

**Expected load:**

- Database: Tiny (a few hundred rows max)
- Images: ~5GB/year (100 pages × ~50MB each)
- Bandwidth: Minimal (R2's zero egress helps)

**This architecture easily handles 10x or 100x growth** with no changes needed.

---

## Related Docs

- **[TECH_STACK.md](TECH_STACK.md)** — Detailed rationale for each technology choice
- **[CONTENT_MODEL.md](CONTENT_MODEL.md)** — Full database schema and data structures
- **[DECISIONS.md](DECISIONS.md)** — Why we made specific architectural decisions
