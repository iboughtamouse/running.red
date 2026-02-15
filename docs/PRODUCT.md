# Product Requirements

**Last updated:** 2026-02-15

---

## Product Overview

Running Red is a webcomic reader and content management system for a single-author comic that updates weekly. It has two user-facing interfaces:

1. **Public website** (`running.red`) — Readers browse the comic
2. **Admin interface** (`/admin`) — Ren uploads pages and manages content

---

## Users & Personas

### Reader (Primary User)

**Who:** Fans of webcomics, LGBTQ+ fiction, character-driven stories

**Goals:**
- Read the latest comic page
- Navigate between pages easily (First/Prev/Next/Last)
- Catch up from the beginning (archive)
- Learn about the author and comic (About page)
- Support the author (Links to Patreon, Twitch, etc.)
- Subscribe via RSS

**Behaviors:**
- Visits weekly (Monday updates)
- May binge-read the archive first
- Often reads on mobile (phone or tablet)
- Shares pages on social media

**Pain Points:**
- Slow-loading images (especially on mobile/4G)
- Confusing navigation (can't find first page, or latest)
- Content warnings not clear (wants to know before seeing triggering content)

---

### Ren (Author, Admin User)

**Who:** Artist, writer, creator of the comic

**Goals:**
- Upload new comic pages quickly (under 2 minutes)
- Edit static content (About, Links) without touching code
- Replace images for older pages (if he redraws them)
- Preview pages before publishing
- Set content warnings for sensitive pages

**Behaviors:**
- Works on iPad sometimes (admin must be mobile-friendly)
- Uploads pages on Sunday night (for Monday publish)
- Occasionally updates About page (rarely, maybe quarterly)
- Adds new links when he starts a new platform (Patreon, Ko-fi, etc.)

**Pain Points:**
- Complex admin UIs (wants simple forms, not Notion-level features)
- Can't preview how a page will look before publishing
- Scared of breaking things (needs clear confirmation messages)

---

### Site Owner (You)

**Who:** Developer maintaining the infrastructure

**Goals:**
- Keep hosting costs low (ideally $0, max $10/month)
- Minimize maintenance burden (no manual deployments, no database migrations)
- Ensure Ren can work independently (doesn't need your help to publish)

**Behaviors:**
- Deploys via Git push (Vercel auto-deploys)
- Monitors errors occasionally (Vercel logs)
- Updates dependencies every few months

**Pain Points:**
- Complex infrastructure (multiple apps, databases, services)
- Breaking changes in dependencies (want stable, boring tech)
- Ren asking for help with basic tasks (admin should be self-explanatory)

---

## Public Website

### Page: Home (`/`)

**Purpose:** Show the latest comic page.

**Content:**
- Comic page image (responsive, centered)
- Page title (if set) and publish date
- Author commentary below the image
- Navigation bar (First | Previous | Next | Last)
  - "Previous" and "First" are disabled (grayed out, no link)
  - "Next" and "Last" navigate to the next page (if it exists)
- If page has a content warning: blurred with confirmation overlay

**Behavior:**
- Fetches the most recent published page (highest page_number where status=published and publish_date <= today)
- If no pages exist yet, shows placeholder: "Coming soon!"

**URL:** `/`

---

### Page: Comic Page (`/comic/[slug]`)

**Purpose:** Display a specific comic page.

**Content:**
- Same as Home, but for a specific page (identified by slug)
- Navigation buttons work relative to this page:
  - "First" → `/comic/page-1` (or earliest page)
  - "Previous" → previous page by page_number (disabled if this is first)
  - "Next" → next page by page_number (disabled if this is latest)
  - "Last" → latest published page

**Behavior:**
- If page doesn't exist or isn't published yet → 404
- If page has content_warning=true → show blurred with overlay
- Keyboard navigation: Left arrow = previous, Right arrow = next
- Preload adjacent pages (previous + next) on hover/touch

**URL:** `/comic/page-1`, `/comic/page-42`, etc.

---

### Page: About (`/about`)

**Purpose:** Information about Ren and the comic.

**Content:**
- **About Me** — Ren's bio (rich text/markdown)
- **About the Comic** — Background on Alexandrus and the story
- **Content Warnings** — List of themes (abuse, trauma, violence, mental health, etc.)
- **Update Schedule** — "Updates Mondays"

**Behavior:**
- Fetches content from `about_page` table (singleton)
- Renders markdown/rich text as HTML

**URL:** `/about`

---

### Page: Archive (`/archive`)

**Purpose:** Chronological list of all published pages.

**Content:**
- Page list (oldest first):
  - Page number
  - Title (if set)
  - Publish date
  - Link to page
- Grouped by chapter (if/when chapters are introduced — not in MVP)

**Behavior:**
- Fetches all published pages: `WHERE status='published' AND publish_date <= CURRENT_DATE`
- Orders by page_number ASC

**URL:** `/archive`

---

### Page: Links (`/links`)

**Purpose:** External links (Patreon, Twitch, social media, etc.)

**Content:**
- List of links with:
  - Title (e.g., "Patreon")
  - URL (e.g., "https://patreon.com/ren")
  - Description (optional, e.g., "Support the comic!")
- Links display in the order Ren sets in the admin

**Behavior:**
- Fetches links from `links_page` table (singleton, JSONB array)
- Renders as a simple list or card grid

**URL:** `/links`

---

### Feed: RSS (`/rss.xml`)

**Purpose:** RSS feed for comic updates (readers can subscribe).

**Content:**
- Standard RSS 2.0 XML
- Each published page is an item:
  - Title: Page number + title (if set)
  - Link: URL to the page
  - Description: Commentary excerpt
  - Publish date
  - Thumbnail: Mobile-sized image (for feed readers that show images)

**Behavior:**
- Generates XML dynamically
- Includes last 50 pages (or all, if fewer than 50)

**URL:** `/rss.xml`

---

## Content Warning System

**Goal:** Warn readers before showing sensitive content with specific, clear warnings.

**Predefined Warning Types:**
- Abuse
- Trauma
- Self-harm/Suicide
- Eating Disorders
- Violence
- Death/Dying
- Mental Illness
- Other (custom text)

**Reader Experience:**

1. **Page with content warnings** displays:
   - Blurred image (CSS `filter: blur(20px)`)
   - Overlay centered on screen:
     ```
     ⚠️ Content Warning

     This page contains:
     • Violence
     • Death/Dying

     [ View Page ]
     ```

2. **When reader clicks "View Page":**
   - Remove blur and overlay
   - Show comic page normally
   - Display warning types as pills below the comic:
     ```
     [Comic image]

     Content: [Violence] [Death/Dying]
     ```

3. **Reader's choice is not persisted** (resets on navigation/refresh)
   - Each page requires explicit consent
   - Different readers have different sensitivities

**See [CONTENT_MODEL.md](CONTENT_MODEL.md#content-warning-values) for database structure.**

---

## Admin Interface

### Authentication

**Login Page:** `/admin/login`

**Content:**
- Email field
- Password field
- "Log In" button

**Behavior:**
- On submit, check credentials (email + password in env vars, or database)
- If valid, create session (HTTP-only cookie)
- Redirect to `/admin`

**Security:**
- Rate limiting (max 5 attempts per IP per minute)
- CSRF token
- HTTPS only (enforced by Vercel)

---

### Admin Home (`/admin`)

**Purpose:** Dashboard/overview.

**Content:**
- Welcome message: "Welcome, Ren!"
- Quick stats:
  - Total pages: 42
  - Published pages: 40
  - Draft pages: 2
- Quick actions:
  - "Add New Comic Page" (button → `/admin/comics/new`)
  - "Edit About Page" (button → `/admin/about`)
  - "Manage Links" (button → `/admin/links`)

**Behavior:**
- Fetch counts from database
- Display in a simple grid or list

---

### Comic Pages List (`/admin/comics`)

**Purpose:** View and manage all comic pages.

**Content:**
- Table with columns:
  - Page # (sortable)
  - Title (if set, else "—")
  - Status (Published, Draft)
  - Publish Date (sortable)
  - Actions (Edit, Delete)
- "Add New Page" button (top right)
- Search/filter (optional, nice-to-have)

**Behavior:**
- Fetches all pages (including drafts)
- Clicking "Edit" → `/admin/comics/{id}`
- Clicking "Delete" → confirmation modal, then DELETE request

**URL:** `/admin/comics`

---

### Add Comic Page (`/admin/comics/new`)

**Purpose:** Upload a new comic page.

**Content:**
- Form with fields:
  - **Page Number** (number input, required)
  - **Title** (text input, optional)
  - **Image** (file upload, required, accepts PNG/JPEG)
  - **Commentary** (textarea, markdown or plain text, optional)
  - **Publish Date** (date picker, required)
  - **Content Warnings** (checkbox group):
    - ☐ Abuse
    - ☐ Trauma
    - ☐ Self-harm/Suicide
    - ☐ Eating Disorders
    - ☐ Violence
    - ☐ Death/Dying
    - ☐ Mental Illness
    - ☐ Other: [text input]
  - **Status** (radio buttons: Draft, Published)
- "Save" button
- "Cancel" button (returns to `/admin/comics`)

**Behavior:**
- On submit:
  - Validate inputs (page number unique, image file valid, etc.)
  - Submit FormData (image + metadata) to `/api/admin/comics` (POST)
  - API processes image (Sharp → WebP variants)
  - API uploads to R2
  - API inserts row into `comic_pages` table
  - Redirect to `/admin/comics` with success message
- Image preview shown after upload (before save)

**URL:** `/admin/comics/new`

---

### Edit Comic Page (`/admin/comics/{slug}`)

**Purpose:** Edit an existing comic page.

**Content:**
- Same form as "Add Comic Page", but pre-filled with existing data
- "Replace Image" option (allows uploading a new image)
- "Save Changes" button
- "Cancel" button

**Behavior:**
- Server component fetches comic by slug, passes to client form component
- On submit:
  - Submit FormData to `/api/admin/comics/[id]` (PUT)
  - If image replaced: upload new image to R2, update URLs
  - Redirect to `/admin/comics` with success message

**URL:** `/admin/comics/page-1` (slug-based, not database ID)

---

### Edit About Page (`/admin/about`)

**Purpose:** Edit the About page content.

**Content:**
- Form with fields:
  - **About Me** (markdown textarea, required)
  - **About the Comic** (markdown textarea, required)
  - **Content Warnings** (markdown textarea, required)
  - **Update Schedule** (text input, required)
- "Save" button
- Preview pane (optional, nice-to-have — shows rendered markdown)

**Behavior:**
- On submit:
  - Update the `about_page` table (singleton — always 1 row)
  - Trigger revalidation of `/about` (ISR)
  - Show success message

**URL:** `/admin/about`

---

### Edit Links Page (`/admin/links`)

**Purpose:** Manage external links.

**Content:**
- List of links (editable):
  - Each link has: Title, URL, Description
  - "Add Link" button
  - "Remove" button next to each link
  - Drag handles to reorder (or up/down arrows)
- "Save" button

**Behavior:**
- On submit:
  - Update `links_page` table (singleton — JSONB array)
  - Trigger revalidation of `/links` (ISR)
  - Show success message

**URL:** `/admin/links`

---

### Edit Site Settings (`/admin/settings`)

**Purpose:** Edit global site settings.

**Content:**
- Form with fields:
  - **Site Title** (text input, required)
  - **Site Description** (textarea, required)
  - **Social Image** (file upload, optional — for Open Graph)
- "Save" button

**Behavior:**
- On submit:
  - Update `site_settings` table (singleton)
  - If social image uploaded: process + upload to R2
  - Trigger revalidation (if needed)
  - Show success message

**URL:** `/admin/settings`

---

## SEO & Metadata

Every page includes:
- `<title>` — e.g., "Page 12 - Running Red" or "About - Running Red"
- `<meta name="description">` — from site settings or page-specific
- **Open Graph tags:**
  - `og:title`
  - `og:description`
  - `og:image` (comic page image for comic pages, social image for others)
  - `og:url`
- **Twitter Card tags:**
  - `twitter:card`
  - `twitter:title`
  - `twitter:description`
  - `twitter:image`
- **Canonical URL:** `<link rel="canonical">`

**For comic pages:**
- Title: "Page {N}: {Title} - Running Red" (or just "Page {N} - Running Red" if no title)
- Description: Excerpt from commentary (first 150 chars)
- OG image: The comic page image (mobile size)

**For static pages:**
- Title: "{Page Name} - Running Red"
- Description: From site settings
- OG image: Social image from site settings

---

## Performance Goals

| Metric | Target | How to Achieve |
|--------|--------|----------------|
| **Page load time** | <2s on 4G | ISR (pre-rendered pages), optimized WebP images |
| **Lighthouse score** | >90 (all categories) | Minimal JS, optimized images, good HTML structure |
| **First Contentful Paint** | <1.5s | Server-side rendering, inlined critical CSS |
| **Total JS bundle** | <100KB (first load) | Use Server Components, minimal client JS |
| **Image load time** | <1s (mobile on 4G) | WebP format, responsive sizes, blur placeholders |

---

## Accessibility

- **Semantic HTML:** Use `<main>`, `<nav>`, `<article>`, etc.
- **Alt text:** Every comic image has alt text (from admin or auto-generated)
- **Keyboard navigation:** All interactive elements (buttons, links) are keyboard-accessible
- **Focus states:** Visible focus indicators for keyboard users
- **Color contrast:** WCAG AA compliant (4.5:1 for text)
- **Screen readers:** Content warnings announced clearly

---

## Browser Support

**Target browsers:**
- Chrome, Firefox, Safari, Edge (last 2 versions)
- Mobile Safari (iOS 14+)
- Mobile Chrome (Android 10+)

**No support for:**
- Internet Explorer (EOL)
- Old browsers without WebP support (they're <1% of users now)

---

## Out of Scope (For MVP)

These features are explicitly NOT included in the initial build:

- **Comments system** (Giscus, Disqus, etc.) — Maybe later
- **Search** (search comics by title, commentary) — Not needed yet
- **Chapters** (grouping pages into chapters) — Ren hasn't defined chapters yet
- **Page version history** (viewing older versions of updated pages) — Complex, defer
- **Multi-language support** — English only for now
- **User accounts for readers** — No login, no profiles
- **Analytics dashboard in admin** — Can use Vercel Analytics or Google Analytics externally
- **Scheduled publishing** (cron job to auto-publish at specific time) — Ren publishes manually

---

## User Stories

### Reader Stories

1. As a reader, I want to see the latest comic page when I visit the homepage, so I can stay up-to-date.
2. As a reader, I want to navigate between pages using First/Prev/Next/Last buttons, so I can read sequentially.
3. As a reader, I want to use arrow keys to navigate, so I can read quickly without clicking.
4. As a reader, I want to see a warning before viewing sensitive content, so I can decide if I want to view it.
5. As a reader, I want to view the archive, so I can see all pages and catch up.
6. As a reader, I want to read the About page, so I can learn about the author and comic.
7. As a reader, I want to subscribe via RSS, so I get notified of new pages.
8. As a reader, I want pages to load quickly on my phone, so I don't waste data or time.

### Ren (Admin) Stories

1. As Ren, I want to upload a new comic page in under 2 minutes, so I don't waste time on admin tasks.
2. As Ren, I want to set a publish date for a page, so I can prepare pages in advance.
3. As Ren, I want to mark pages as Draft, so I can preview them before publishing.
4. As Ren, I want to replace an image for an existing page, so I can update old artwork.
5. As Ren, I want to select specific content warnings for sensitive pages, so readers know exactly what to expect.
6. As Ren, I want to edit the About page, so I can update my bio or comic description.
7. As Ren, I want to add/remove links, so I can keep my Patreon, Twitch, etc. up-to-date.
8. As Ren, I want to see confirmation messages when I save, so I know my changes worked.

---

## Related Docs

- **[CONTENT_MODEL.md](CONTENT_MODEL.md)** — Database schema and data structures
- **[ARCHITECTURE.md](ARCHITECTURE.md)** — How the system works technically
- **[CONVENTIONS.md](CONVENTIONS.md)** — UI/UX patterns, design system
