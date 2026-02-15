# Implementation Plan

**Last updated:** 2026-02-15

---

## Overview

This document outlines the phased implementation plan for Running Red. Each phase is a milestone with clear deliverables.

**Status Key:**
- `[ ]` = Not started
- `[~]` = In progress
- `[x]` = Done

---

## Phase 0: Documentation ✅

> **Goal:** Establish project direction, document all decisions, create foundation for implementation.

- [x] Create `docs/README.md` (documentation index)
- [x] Create `docs/OVERVIEW.md` (project overview)
- [x] Create `docs/ARCHITECTURE.md` (technical architecture)
- [x] Create `docs/PRODUCT.md` (product requirements)
- [x] Create `docs/CONTENT_MODEL.md` (data structures)
- [x] Create `docs/TECH_STACK.md` (technology choices)
- [x] Create `docs/CONVENTIONS.md` (code style, workflow)
- [x] Create `docs/IMPLEMENTATION.md` (this file)
- [x] Create `docs/DECISIONS.md` (architecture decisions)
- [x] Create `docs/GLOSSARY.md` (terms and definitions)
- [x] Archive old documentation

**Completion Criteria:**
- All documentation files exist
- Documentation is comprehensive and clear
- No major questions remain unanswered in docs

**Notes:**
- Documentation-first approach ensures clarity before coding
- These docs will be updated as implementation progresses

---

## Phase 1: Foundation

> **Goal:** Working Next.js app with basic structure, database, and image storage.

### 1.1 Next.js Setup

- [ ] Initialize Next.js 15 project with TypeScript
- [ ] Configure Tailwind CSS
- [ ] Set up path aliases (`@/`)
- [ ] Create basic directory structure (see `CONVENTIONS.md`)
- [ ] Create root layout with basic HTML structure
- [ ] Add global CSS (Tailwind imports)

### 1.2 Database Setup

- [ ] Choose database provider (Vercel Postgres, Railway, or Supabase)
- [ ] Create database instance
- [ ] Run initial migration (create tables: `comic_pages`, `about_page`, `links_page`, `site_settings`)
- [ ] Seed database with default data (site settings, about page, empty links)
- [ ] Create database client (`lib/db.ts`)
- [ ] Define TypeScript types (`lib/types.ts`)

### 1.3 Image Storage Setup

- [ ] Create Cloudflare R2 bucket
- [ ] Generate R2 API credentials
- [ ] Configure R2 client (`lib/r2.ts`)
- [ ] Test upload/download (manual test)

### 1.4 Environment Setup

- [ ] Create `.env.example` with all required variables
- [ ] Create `.env.local` with actual credentials (not committed)
- [ ] Document environment variables in README

### 1.5 Basic Deployment

- [ ] Connect repo to Vercel (or chosen host)
- [ ] Configure environment variables in Vercel dashboard
- [ ] Deploy to preview URL
- [ ] Verify deployment works

**Completion Criteria:**
- Next.js app runs locally (`npm run dev`)
- Database is accessible and seeded
- R2 bucket is accessible
- App deploys to Vercel preview URL
- All environment variables documented

**Estimated Time:** 1-2 days

---

## Phase 2: Public Website (Read-Only)

> **Goal:** Readers can view comic pages and navigate between them.

### 2.1 Home Page (`/`)

- [ ] Create `app/page.tsx`
- [ ] Fetch latest published comic page from database
- [ ] Display comic page (placeholder component for now)
- [ ] Show "Coming soon!" if no pages exist

### 2.2 Comic Page Component

- [ ] Create `components/public/ComicImage.tsx`
- [ ] Render `<picture>` element with desktop/mobile srcset
- [ ] Display blur placeholder (from database)
- [ ] Handle loading state
- [ ] Add alt text

### 2.3 Navigation Component

- [ ] Create `components/public/ComicNav.tsx`
- [ ] Render First | Previous | Next | Last buttons
- [ ] Fetch previous/next pages from database
- [ ] Disable buttons at boundaries (First/Previous on page 1, Next/Last on latest)
- [ ] Add keyboard navigation (left/right arrow keys)

### 2.4 Comic Page Route (`/comic/[slug]`)

- [ ] Create `app/comic/[slug]/page.tsx`
- [ ] Fetch comic page by slug
- [ ] Return 404 if not found or not published
- [ ] Render ComicImage + ComicNav components
- [ ] Display page title (if set), publish date, commentary
- [ ] Implement ISR (`revalidate` setting)

### 2.5 About Page (`/about`)

- [ ] Create `app/about/page.tsx`
- [ ] Fetch content from `about_page` table
- [ ] Render markdown as HTML (use a markdown library or simple formatting)
- [ ] Display: About Me, About the Comic, Content Warnings, Update Schedule

### 2.6 Archive Page (`/archive`)

- [ ] Create `app/archive/page.tsx`
- [ ] Fetch all published pages (ordered by page_number ASC)
- [ ] Render list with: page number, title (if set), publish date, link

### 2.7 Links Page (`/links`)

- [ ] Create `app/links/page.tsx`
- [ ] Fetch links from `links_page` table (JSONB array)
- [ ] Render list of links with title, URL, description

### 2.8 RSS Feed (`/rss.xml`)

- [ ] Create `app/rss.xml/route.ts`
- [ ] Fetch last 50 published pages
- [ ] Generate RSS 2.0 XML (use a library or template)
- [ ] Include: title, link, description (commentary excerpt), date, thumbnail (mobile image URL)

### 2.9 Site Header

- [ ] Create `components/public/SiteHeader.tsx`
- [ ] Display site title (from site settings)
- [ ] Navigation links: Home, About, Archive, Links
- [ ] Responsive (mobile menu or horizontal nav)

### 2.10 SEO & Metadata

- [ ] Add metadata to all pages (title, description, OG tags, Twitter cards)
- [ ] Use comic page image as OG image for comic pages
- [ ] Use social image from site settings for other pages
- [ ] Add canonical URLs

**Completion Criteria:**
- Home page displays latest comic (or "Coming soon")
- Readers can navigate between comic pages
- About, Archive, Links pages work
- RSS feed generates valid XML
- All pages have proper SEO metadata
- Site works on mobile

**Estimated Time:** 3-4 days

---

## Phase 3: Admin Interface

> **Goal:** Ren can upload comic pages and edit content via admin UI.

### 3.1 Authentication

- [ ] Create `lib/auth.ts` (simple password auth or NextAuth setup)
- [ ] Create `app/admin/login/page.tsx` (login form)
- [ ] Create `middleware.ts` (protect `/admin/*` routes)
- [ ] Store session in HTTP-only cookie
- [ ] Add logout functionality

### 3.2 Admin Layout

- [ ] Create `app/admin/layout.tsx`
- [ ] Check authentication (redirect to login if not authenticated)
- [ ] Add admin header/navigation
- [ ] Style with Tailwind (simple, clean)

### 3.3 Admin Dashboard (`/admin`)

- [ ] Create `app/admin/page.tsx`
- [ ] Display stats (total pages, published, drafts)
- [ ] Quick action buttons (Add New Page, Edit About, Manage Links)

### 3.4 Image Upload Utility

- [ ] Create `lib/image.ts` (Sharp image processing)
- [ ] Function to resize/convert to WebP (desktop + mobile)
- [ ] Function to generate blur placeholder (base64)
- [ ] Create `app/api/admin/upload-image/route.ts` (API route)
- [ ] Accept file upload, process with Sharp, upload to R2, return URLs + blur hash

### 3.5 Comic Pages List (`/admin/comics`)

- [ ] Create `app/admin/comics/page.tsx`
- [ ] Fetch all comic pages (including drafts)
- [ ] Render table with: page #, title, status, publish date, actions (Edit, Delete)
- [ ] Add "Add New Page" button

### 3.6 Add Comic Page (`/admin/comics/new`)

- [ ] Create `app/admin/comics/new/page.tsx`
- [ ] Create form with fields: page number, title, image upload, commentary, publish date, content warning, status
- [ ] On submit: upload image (API route), insert row into database
- [ ] Show success message, redirect to `/admin/comics`

### 3.7 Edit Comic Page (`/admin/comics/[id]`)

- [ ] Create `app/admin/comics/[id]/page.tsx`
- [ ] Fetch existing page data
- [ ] Pre-fill form with current values
- [ ] Allow replacing image (optional)
- [ ] On submit: update database (and upload new image if replaced)
- [ ] Show success message

### 3.8 Delete Comic Page

- [ ] Add delete button to edit page or list
- [ ] Show confirmation modal
- [ ] Delete row from database (keep images in R2? or delete those too?)

### 3.9 Edit About Page (`/admin/about`)

- [ ] Create `app/admin/about/page.tsx`
- [ ] Fetch current about page content
- [ ] Render form with textareas for: About Me, About Comic, Content Warnings, Update Schedule
- [ ] On submit: update `about_page` table
- [ ] Trigger revalidation of `/about`

### 3.10 Edit Links Page (`/admin/links`)

- [ ] Create `app/admin/links/page.tsx`
- [ ] Fetch current links
- [ ] Render editable list (title, URL, description for each)
- [ ] Add "Add Link" button
- [ ] Allow removing links
- [ ] Allow reordering (drag-drop or up/down arrows)
- [ ] On submit: update `links_page` table (JSONB array)
- [ ] Trigger revalidation of `/links`

### 3.11 Edit Site Settings (`/admin/settings`)

- [ ] Create `app/admin/settings/page.tsx`
- [ ] Fetch current site settings
- [ ] Render form: site title, site description, social image upload
- [ ] On submit: update `site_settings` table (upload social image to R2 if changed)
- [ ] Trigger revalidation (if needed)

### 3.12 On-Demand Revalidation

- [ ] Create `app/api/revalidate/route.ts`
- [ ] Call `revalidatePath()` for specific routes when content changes
- [ ] Trigger from admin forms (after successful save)

**Completion Criteria:**
- Ren can log in at `/admin/login`
- Ren can add/edit/delete comic pages
- Ren can upload images, images are processed and uploaded to R2
- Ren can edit About page, Links page, Site Settings
- Changes appear on public site immediately (or within ISR window)

**Estimated Time:** 4-5 days

---

## Phase 4: Content Warning System

> **Goal:** Pages with content warnings display blurred with a confirmation overlay.

### 4.1 Content Warning Overlay Component

- [ ] Create `components/public/ContentWarning.tsx`
- [ ] Client component (needs state for revealed/hidden)
- [ ] Display blur overlay with warning text
- [ ] Add "View Page" button
- [ ] On click: remove blur, remove overlay

### 4.2 Integrate into Comic Page

- [ ] Update `app/comic/[slug]/page.tsx`
- [ ] Check if `contentWarning` is true
- [ ] If true, wrap ComicImage in ContentWarning component
- [ ] Pass custom warning text (or use default)

### 4.3 Styling

- [ ] Style overlay (centered, readable, accessible)
- [ ] Style blur (CSS filter: blur(20px))
- [ ] Ensure it works on mobile

**Completion Criteria:**
- Pages with content_warning=true show blurred with overlay
- Clicking "View Page" reveals the image
- Custom warning text displays correctly
- Default warning text used if custom not provided

**Estimated Time:** 1 day

---

## Phase 5: Polish & Launch

> **Goal:** Production-ready quality. Performance, accessibility, visual design.

### 5.1 Performance Optimization

- [ ] Run Lighthouse audit (target >90 all categories)
- [ ] Optimize images (ensure WebP is working, srcset is correct)
- [ ] Minimize client-side JS (check bundle size)
- [ ] Add preloading for adjacent pages (on hover/touch)
- [ ] Test on 4G (comic page load <2s)

### 5.2 Accessibility

- [ ] Semantic HTML (`<main>`, `<nav>`, `<article>`, etc.)
- [ ] Alt text on all images
- [ ] Keyboard navigation works (tab, arrow keys)
- [ ] Focus states visible
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] Screen reader testing (content warnings announced)

### 5.3 Visual Design

- [ ] Finalize color scheme (get Ren's input)
- [ ] Finalize typography (fonts, sizes, spacing)
- [ ] Responsive layout testing (mobile, tablet, desktop)
- [ ] Favicon and app icons
- [ ] Loading states (spinners, skeletons)
- [ ] Error states (404, 500, empty states)

### 5.4 Error Handling

- [ ] Add `error.tsx` files at route level
- [ ] Add `not-found.tsx` for 404s
- [ ] Test error scenarios (database down, R2 down, bad data)
- [ ] Friendly error messages for users

### 5.5 Final Testing

- [ ] Test all user flows (reader, admin)
- [ ] Test on multiple browsers (Chrome, Firefox, Safari, mobile browsers)
- [ ] Test on multiple devices (phone, tablet, desktop)
- [ ] Test with real data (Ren uploads a few pages)

### 5.6 Production Deployment

- [ ] Merge `develop` → `main`
- [ ] Deploy to production (Vercel)
- [ ] Point domain (running.red) to Vercel
- [ ] Verify production site works
- [ ] Monitor errors (Vercel logs)

### 5.7 Documentation Update

- [ ] Update all docs to reflect final state
- [ ] Update README with live URLs
- [ ] Document any deviations from plan

**Completion Criteria:**
- Lighthouse score >90 (all categories)
- Site is accessible (WCAG AA)
- Site works on all target browsers/devices
- Ren can use admin without help
- Site is live at running.red

**Estimated Time:** 2-3 days

---

## Future Enhancements (Not in MVP)

These are deferred to post-launch:

- [ ] Comment system (Giscus or similar)
- [ ] Page version history (view older versions of updated pages)
- [ ] Search (search comics by title, commentary)
- [ ] Chapters (grouping pages into chapters)
- [ ] Scheduled publishing (cron job to auto-publish at specific time)
- [ ] Analytics dashboard in admin (page views, etc.)
- [ ] Email notifications (new page published)
- [ ] Patreon integration (early access for supporters)

---

## Timeline Estimate

| Phase | Estimated Time | Status |
|-------|---------------|--------|
| Phase 0: Documentation | 1 day | ✅ Done |
| Phase 1: Foundation | 1-2 days | 🔲 Not started |
| Phase 2: Public Website | 3-4 days | 🔲 Not started |
| Phase 3: Admin Interface | 4-5 days | 🔲 Not started |
| Phase 4: Content Warnings | 1 day | 🔲 Not started |
| Phase 5: Polish & Launch | 2-3 days | 🔲 Not started |
| **Total** | **12-16 days** | — |

**Note:** This is elapsed time for an AI agent + human pair working together. Actual calendar time depends on review cycles, deployment issues, etc.

---

## Checkpoints

After each phase, review:
- Does the implementation match the documentation?
- Do docs need to be updated?
- Are there any blockers or open questions?
- Is the quality acceptable (code, UX, performance)?

**No phase is complete until docs are updated.**

---

## Related Docs

- **[ARCHITECTURE.md](ARCHITECTURE.md)** — How everything fits together
- **[PRODUCT.md](PRODUCT.md)** — What we're building
- **[CONVENTIONS.md](CONVENTIONS.md)** — How to write code
