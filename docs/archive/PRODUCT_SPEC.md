# Product Spec

> Last updated: 2026-02-09

## Overview

Running Red is a webcomic by Ren, telling the story of Alexandrus — a character he created at age 13 and has developed for over a decade. This is his first comic, and the platform should make publishing as simple as possible.

The product has two interfaces:

1. **Reader-facing website** at `running.red` — browse and read the comic
2. **Author admin UI** at `admin.running.red` — Ren uploads pages and manages content

## Users

| User | Role | Interface |
|------|------|-----------|
| Readers | Browse and read the comic | Public website |
| Ren (author) | Upload comic pages, write commentary, edit site content | Payload CMS admin |
| Site owner | Deployment, infrastructure, code | Git repo, Vercel/Railway dashboards |

Ren does **not** need access to the code repository. He interacts entirely through the CMS admin UI.

---

## Pages

### Home (`/`)

The comic reader. This is the primary experience.

**Layout:**
- Comic page image (responsive, centered)
- Navigation bar below the image: **First** | **Previous** | **Next** | **Last**
  - Buttons disable at boundaries (First/Previous disabled on page 1, Next/Last disabled on latest page)
- Below navigation: info box showing:
  - Page title (optional, from CMS)
  - Date posted
  - Author commentary (rich text, from CMS)

**Behavior:**
- URL structure: `/` shows the latest page. `/comic/[slug]` shows a specific page.
- Keyboard navigation: left arrow = previous, right arrow = next
- Preload adjacent page images for instant navigation
- Pages with content warnings display blurred with a confirmation overlay before revealing

**Future (not in initial build):**
- Comment section for readers (consider Giscus or similar if ever added)
- Option to view older versions of updated pages (version history)

### About (`/about`)

Static content page, fully editable via CMS.

**Sections:**
- **About Me** — Ren's bio
- **About the Comic** — Background on Alexandrus and the story
- **Comic Content Warnings** — List of themes (abuse, trauma, self-harm/suicide, eating disorders, violence, death, mental illness)
- **Update Schedule** — "Updates Mondays"

All text managed as rich text in the CMS so Ren can edit it without code changes.

### Archive (`/archive`)

A complete list of all published comic pages.

**Layout:**
- Chronological list (oldest first)
- Each entry shows: page number, title (if any), publication date
- Each entry links to that comic page
- Grouped by chapter (if/when chapters are introduced)

### Links (`/links`)

External links page, editable via CMS.

**Content:**
- List of links with titles, URLs, and optional descriptions
- Initial links: Patreon, Twitch
- Ren can add/remove/reorder links via CMS

### RSS (`/rss.xml`)

Standard RSS feed for comic updates.

- Generates valid RSS 2.0 XML
- Each item = one comic page (title, date, link, thumbnail)
- Auto-updates when new pages are published

---

## Content Model (CMS)

### Collections

#### Comic Pages (`comic-pages`)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| title | text | No | Optional page title |
| slug | text | Yes | URL-safe identifier, auto-generated from page number |
| pageNumber | number | Yes | Sequential page number |
| chapter | relationship | No | Reference to chapter (future use) |
| image | upload | Yes | The comic page image |
| commentary | richText | No | Author's notes displayed below the page |
| contentWarning | boolean | No | Whether this page should show a content warning |
| contentWarningText | text | No | Specific warning text (if different from default) |
| publishDate | date | Yes | When to make this page visible |
| status | select | Yes | `draft` or `published` |

- Pages with `status: draft` or `publishDate` in the future are not visible to readers.
- Ordered by `pageNumber` for navigation.

#### Media (`media`)

Payload's built-in media collection, configured with:
- Storage adapter: Cloudflare R2
- Image sizes: full (original width), desktop (max 1200px wide), mobile (max 800px wide)
- Formats: WebP output
- LQIP blur hash generated on upload

### Globals (Singletons)

#### Site Settings (`site-settings`)

| Field | Type | Notes |
|-------|------|-------|
| siteTitle | text | "Running Red" |
| siteDescription | text | SEO meta description |
| socialImage | upload | Default OG image |

#### About Page (`about-page`)

| Field | Type | Notes |
|-------|------|-------|
| aboutMe | richText | "About Me" section content |
| aboutComic | richText | "About the Comic" section content |
| contentWarnings | richText | Content warnings section |
| updateSchedule | text | e.g., "Updates Mondays" |

#### Links Page (`links-page`)

| Field | Type | Notes |
|-------|------|-------|
| links | array | Ordered list of `{ title, url, description? }` |

---

## Content Warning System

Pages flagged with `contentWarning: true` in the CMS:

1. Display with the comic image **blurred** (CSS `filter: blur()`)
2. Show an overlay with:
   - Warning text (custom per-page, or default: "This page contains sensitive content")
   - "View Page" button to reveal
3. User's choice to reveal is **not** persisted (resets on navigation)
4. The blur/reveal is client-side only — no additional server round-trip

---

## Navigation & URL Structure

| URL | Page |
|-----|------|
| `/` | Latest comic page |
| `/comic/[slug]` | Specific comic page |
| `/about` | About page |
| `/archive` | Archive listing |
| `/links` | Links page |
| `/rss.xml` | RSS feed |

---

## SEO & Metadata

Each page includes:
- `<title>` — e.g., "Page 12 - Running Red" or "About - Running Red"
- `<meta name="description">` — from site settings or page-specific
- Open Graph tags (`og:title`, `og:description`, `og:image`)
- Twitter card tags
- Canonical URL

Comic pages use the comic image as the OG image.

---

## Performance Goals

- Comic page images load in under 2 seconds on 4G
- Navigation between pages feels instant (preloading)
- Lighthouse score > 90 on all categories
- Total JS bundle < 100KB (first load)

---

## Out of Scope (for now)

- Comment system
- Page version history (viewing older versions of updated pages)
- Search
- User accounts / reader profiles
- Print/download functionality
- Multi-language support
