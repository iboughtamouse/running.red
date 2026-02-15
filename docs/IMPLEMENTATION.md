# Implementation Plan

**Last updated:** 2026-02-15

---

## Overview

This document outlines the phased implementation plan for Running Red. The approach is **backend-first POC** — prove the core functionality works locally before styling and deployment.

**Status Key:**
- `[ ]` = Not started
- `[~]` = In progress
- `[x]` = Done

---

## Phase 0: Documentation ✅

> **Goal:** Establish project direction, document all decisions, create foundation for implementation.

- [x] Create comprehensive documentation suite
- [x] Archive old Payload-era docs
- [x] Update CLAUDE.md
- [x] Clean up repository (remove monorepo scaffolding)

**Completion Criteria:**
- All documentation files exist and are consistent
- Single source of truth established for each topic
- No code exists yet (documentation-first approach validated)

**Status:** ✅ **Complete**

---

## Phase 1: Database & API Layer 🔨

> **Goal:** Working backend with database, API routes, and image processing. Testable via curl/Postman (no UI).

### 1.1 Project Setup ✅

- [x] Initialize Next.js 16 project with TypeScript strict mode
- [x] Configure basic directory structure (see [CONVENTIONS.md](CONVENTIONS.md))
- [x] Set up ESLint, Prettier configs (encode conventions in tooling)
- [x] Create `.env.example` and `.env.local` with required variables
- [x] Verify `npm run dev` works

### 1.2 Database Setup (Railway Postgres) ✅

- [x] Create Railway Postgres instance
- [x] Get connection string, add to `.env.local`
- [x] Create initial schema migration:
  - `comic_pages` table
  - `about_page` table
  - `links_page` table
  - `site_settings` table
- [x] Run migration, verify tables exist
- [x] Seed database with default data (site settings, about page, empty links)
- [x] Create `lib/db.ts` (Postgres client)
- [x] Create `lib/types.ts` (TypeScript types matching schema)

### 1.3 Cloudflare R2 Setup ✅

- [x] Create Cloudflare R2 bucket
- [x] Generate API credentials (access key, secret key)
- [x] Add R2 config to `.env.local`
- [x] Create `lib/r2.ts` (R2 upload/download utilities)
- [x] Test upload/download manually (via Node script or API route)

### 1.4 Image Processing

- [ ] Install Sharp (`npm install sharp`)
- [ ] Create `lib/image.ts`:
  - Function to resize/convert to WebP (desktop: 1200px, mobile: 800px)
  - Function to generate blur placeholder (base64)
- [ ] Test locally (upload PNG, get WebP variants + blur hash)

### 1.5 API Routes

- [ ] Create `/api/admin/comics` route:
  - `GET` - List all comics (including drafts)
  - `POST` - Create new comic page (upload image, process, save to DB)
- [ ] Create `/api/admin/comics/[id]` route:
  - `GET` - Fetch single comic page
  - `PUT` - Update comic page (with optional image replacement)
  - `DELETE` - Delete comic page
- [ ] Create `/api/admin/about` route (GET/PUT for about page singleton)
- [ ] Create `/api/admin/links` route (GET/PUT for links array)
- [ ] Create `/api/admin/settings` route (GET/PUT for site settings)
- [ ] Create `/api/comics` route (GET - public, published pages only)

### 1.6 Testing (No UI Yet)

- [ ] Test all API routes with curl or Postman
- [ ] Verify image upload → Sharp processing → R2 upload works
- [ ] Verify database CRUD operations work
- [ ] Verify published vs draft filtering works

**Completion Criteria:**
- ✅ Railway Postgres is set up and accessible
- ✅ R2 bucket is set up and images can be uploaded
- ✅ All API routes respond correctly (test with curl)
- ✅ Image processing pipeline works (PNG → WebP variants + blur)
- ✅ Can create/read/update/delete comics via API

**Estimated Time:** 2-3 days

---

## Phase 2: Admin Interface

> **Goal:** Ren can upload comic pages and edit content via admin UI. Test locally (no deployment yet).

### 2.1 Authentication

- [ ] Create `lib/auth.ts` (simple password auth - email/password in env vars)
- [ ] Create `/admin/login` page (login form)
- [ ] Create `middleware.ts` (protect `/admin/*` routes, redirect to login if not authenticated)
- [ ] Store session in HTTP-only cookie
- [ ] Test: can't access `/admin` without logging in

### 2.2 Admin Layout

- [ ] Create `/admin/layout.tsx`:
  - Check authentication
  - Simple header with "Running Red Admin" + logout button
  - Navigation: Dashboard, Comics, About, Links, Settings
- [ ] Create `/admin/page.tsx` (dashboard with stats and quick actions)

### 2.3 Comic Pages Management

- [ ] Create `/admin/comics/page.tsx`:
  - Table listing all comics (page #, title, status, publish date, actions)
  - "Add New Page" button
- [ ] Create `/admin/comics/new/page.tsx`:
  - Form with all fields (see [PRODUCT.md](PRODUCT.md#add-comic-page-admincomicsnew))
  - Image upload component
  - Content warnings checkboxes (multiselect)
  - On submit: POST to `/api/admin/comics`
  - Redirect to `/admin/comics` on success
- [ ] Create `/admin/comics/[id]/page.tsx`:
  - Same form, pre-filled with existing data
  - "Replace Image" option
  - On submit: PUT to `/api/admin/comics/[id]`

### 2.4 Static Content Management

- [ ] Create `/admin/about/page.tsx`:
  - Form with 4 markdown textareas (About Me, About Comic, Content Warnings, Update Schedule)
  - On submit: PUT to `/api/admin/about`
- [ ] Create `/admin/links/page.tsx`:
  - Editable list of links (add/remove/reorder)
  - On submit: PUT to `/api/admin/links`
- [ ] Create `/admin/settings/page.tsx`:
  - Form for site title, description, social image upload
  - On submit: PUT to `/api/admin/settings`

### 2.5 Image Upload UI

- [ ] Create `components/admin/ImageUpload.tsx`:
  - File input (accepts PNG/JPEG)
  - Image preview after selection
  - Upload to `/api/admin/upload-image` route
  - Show progress/success/error states
  - Return R2 URLs + blur hash to parent form

### 2.6 Testing (Still Local)

- [ ] Log in as admin
- [ ] Upload a test comic page (with image)
- [ ] Verify image appears in R2 bucket
- [ ] Verify metadata saved to database
- [ ] Edit the comic page, replace image
- [ ] Edit About page, Links page, Site Settings
- [ ] Verify all changes persist

**Completion Criteria:**
- ✅ Ren can log into `/admin`
- ✅ Ren can create/edit/delete comic pages
- ✅ Ren can upload images (processed to WebP, stored in R2)
- ✅ Ren can edit About, Links, Site Settings
- ✅ Admin UI is functional (styling can be basic for now)

**Estimated Time:** 3-4 days

---

## Phase 3: Public Website

> **Goal:** Readers can view comic pages and navigate. Test locally (Ren uploads via admin, readers see on public site).

### 3.1 Public API Routes

- [ ] Create `/api/comics/latest` route (GET - returns latest published page)
- [ ] Create `/api/comics/[slug]` route (GET - returns specific page + prev/next)
- [ ] Create `/api/about` route (GET - returns about page content)
- [ ] Create `/api/archive` route (GET - returns all published pages)
- [ ] Create `/api/links` route (GET - returns links)
- [ ] Create `/api/settings` route (GET - returns site settings)

### 3.2 Home Page (`/`)

- [ ] Create `app/page.tsx`:
  - Fetch latest published comic from `/api/comics/latest`
  - Display comic image (responsive, desktop/mobile srcset)
  - Display title (if set), publish date, commentary
  - Navigation bar (First/Prev/Next/Last)
  - If no pages exist: "Coming soon!"

### 3.3 Comic Page Component

- [ ] Create `components/public/ComicImage.tsx`:
  - `<picture>` element with desktop/mobile WebP sources
  - Blur placeholder while loading
  - Alt text
- [ ] Create `components/public/ComicNav.tsx`:
  - First | Previous | Next | Last buttons
  - Disable at boundaries
  - Keyboard navigation (left/right arrow keys)

### 3.4 Comic Page Route (`/comic/[slug]`)

- [ ] Create `app/comic/[slug]/page.tsx`:
  - Fetch comic page from `/api/comics/[slug]`
  - Render ComicImage + ComicNav
  - Display title, date, commentary
  - If content warnings exist: wrap in ContentWarning component
  - ISR: `revalidate` every hour (or on-demand)
- [ ] Handle 404 (page not found or not published yet)

### 3.5 Content Warning System

- [ ] Create `components/public/ContentWarning.tsx` (client component):
  - Display blur overlay with warning list
  - "View Page" button
  - On click: remove blur, remove overlay
  - Display warning pills below comic after viewing
- [ ] Test with a page that has content warnings

### 3.6 Static Pages

- [ ] Create `app/about/page.tsx`:
  - Fetch from `/api/about`
  - Render markdown as HTML (choose markdown library: `react-markdown` or similar)
- [ ] Create `app/archive/page.tsx`:
  - Fetch from `/api/archive`
  - Render chronological list with links to each page
- [ ] Create `app/links/page.tsx`:
  - Fetch from `/api/links`
  - Render list of external links

### 3.7 RSS Feed

- [ ] Create `app/rss.xml/route.ts`:
  - Fetch last 50 published pages
  - Generate RSS 2.0 XML
  - Include title, link, description, date, thumbnail

### 3.8 Site Header

- [ ] Create `components/public/SiteHeader.tsx`:
  - Display site title (from settings)
  - Navigation links: Home, About, Archive, Links
  - Responsive (mobile menu or horizontal nav)
- [ ] Add to root layout

### 3.9 SEO & Metadata

- [ ] Add metadata to all pages (title, description, OG tags, Twitter cards)
- [ ] Use comic image as OG image for comic pages
- [ ] Use social image from settings for static pages
- [ ] Add canonical URLs

### 3.10 Testing (End-to-End Locally)

- [ ] Ren uploads a comic via admin
- [ ] Reader sees it on home page and `/comic/page-X`
- [ ] Navigation works (First/Prev/Next/Last, arrow keys)
- [ ] Content warnings display correctly
- [ ] About, Archive, Links pages work
- [ ] RSS feed generates valid XML

**Completion Criteria:**
- ✅ Home page displays latest comic
- ✅ Readers can navigate between comics
- ✅ Content warning system works
- ✅ All public pages functional
- ✅ RSS feed works
- ✅ Full workflow tested locally (admin → public)

**Estimated Time:** 3-4 days

---

## Phase 4: Styling & Polish

> **Goal:** Production-ready visual design, responsive layout, accessibility, performance optimization.

### 4.1 Tailwind Design System

- [ ] Finalize color scheme (get Ren's input)
- [ ] Finalize typography (fonts, sizes, line heights)
- [ ] Create reusable UI components (`components/ui/`):
  - Button
  - Input
  - Card
  - etc.

### 4.2 Responsive Layout

- [ ] Test on mobile (phone, tablet)
- [ ] Test on desktop (various screen sizes)
- [ ] Ensure all pages are mobile-friendly
- [ ] Fix any responsive issues

### 4.3 Admin UI Polish

- [ ] Improve admin forms (better spacing, labels, help text)
- [ ] Add loading states (spinners, disabled buttons)
- [ ] Add success/error messages (toasts or inline)
- [ ] Add confirmation modals (delete actions)

### 4.4 Public Site Polish

- [ ] Improve comic page layout (centered, max-width, spacing)
- [ ] Improve navigation UI (buttons, hover states)
- [ ] Add loading states (blur placeholder, skeleton screens)
- [ ] Add error states (404 page, error boundaries)

### 4.5 Accessibility

- [ ] Semantic HTML (`<main>`, `<nav>`, `<article>`)
- [ ] Alt text on all images (admin enforces this)
- [ ] Keyboard navigation works everywhere
- [ ] Focus states visible
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] Screen reader test (content warnings announced)

### 4.6 Performance Optimization

- [ ] Run Lighthouse audit (target >90 all categories)
- [ ] Optimize images (verify WebP, srcset working)
- [ ] Minimize client-side JS (check bundle size)
- [ ] Add preloading for adjacent pages (on hover)
- [ ] Test on 4G (comic page <2s load time)

### 4.7 Error Handling

- [ ] Add `error.tsx` at route level (comic pages, admin pages)
- [ ] Add `not-found.tsx` for 404s
- [ ] Test error scenarios (database down, R2 down, invalid data)
- [ ] Friendly error messages for users

### 4.8 Final Testing

- [ ] Test all user flows (reader, admin)
- [ ] Test on multiple browsers (Chrome, Firefox, Safari, mobile)
- [ ] Test on multiple devices (phone, tablet, desktop)
- [ ] Test with real data (Ren uploads multiple pages)

**Completion Criteria:**
- ✅ Site looks professional and clean
- ✅ Responsive on all devices
- ✅ Accessible (WCAG AA)
- ✅ Performant (Lighthouse >90)
- ✅ All error cases handled gracefully

**Estimated Time:** 2-3 days

---

## Phase 5: Deployment

> **Goal:** Deploy to production, point domain, monitor, go live.

### 5.1 Pre-Deployment Checklist

- [ ] Review all environment variables (production values)
- [ ] Verify Railway Postgres is production-ready (not hobby tier)
- [ ] Verify R2 bucket is configured correctly
- [ ] Run full test suite locally one more time

### 5.2 Vercel Deployment

- [ ] Connect repo to Vercel (if not already)
- [ ] Configure environment variables in Vercel dashboard:
  - `DATABASE_URL` (Railway connection string)
  - `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_ENDPOINT`
  - `ADMIN_EMAIL`, `ADMIN_PASSWORD` (or auth secret)
- [ ] Deploy to preview URL
- [ ] Test preview deployment thoroughly

### 5.3 Domain Configuration

- [ ] Point `running.red` to Vercel (A record or CNAME)
- [ ] Verify domain works
- [ ] Verify SSL certificate (HTTPS)

### 5.4 Production Testing

- [ ] Test on production domain
- [ ] Verify admin login works
- [ ] Upload a test comic via admin
- [ ] Verify it appears on public site
- [ ] Test all pages (home, about, archive, links, RSS)

### 5.5 Monitoring & Cleanup

- [ ] Set up error monitoring (Vercel logs, or Sentry if needed)
- [ ] Monitor for errors/issues
- [ ] Remove test data (if any)
- [ ] Hand off to Ren (walkthrough admin UI)

### 5.6 Documentation Update

- [ ] Update all docs to reflect production state
- [ ] Update README with live URLs
- [ ] Document any production-specific setup
- [ ] Mark all phases as complete

**Completion Criteria:**
- ✅ Site is live at `running.red`
- ✅ Admin works at `/admin`
- ✅ Ren can upload comics independently
- ✅ Monitoring is in place
- ✅ All docs updated

**Estimated Time:** 1-2 days

---

## Future Enhancements (Not in MVP)

Deferred to post-launch:

- [ ] Comments system (Giscus or similar)
- [ ] Page version history (view older versions of updated pages)
- [ ] Search (search comics by title, commentary)
- [ ] Chapters (grouping pages into chapters)
- [ ] Scheduled publishing (cron job to auto-publish)
- [ ] Analytics dashboard in admin
- [ ] Email notifications (new page published)
- [ ] Patreon integration (early access)

---

## Timeline Estimate

| Phase | Estimated Time | Status |
|-------|---------------|--------|
| Phase 0: Documentation | 1 day | ✅ Done |
| Phase 1: Database & API | 2-3 days | 🔨 In progress (1.1–1.3 done) |
| Phase 2: Admin Interface | 3-4 days | 🔲 Not started |
| Phase 3: Public Website | 3-4 days | 🔲 Not started |
| Phase 4: Styling & Polish | 2-3 days | 🔲 Not started |
| Phase 5: Deployment | 1-2 days | 🔲 Not started |
| **Total** | **12-17 days** | — |

**Note:** Backend-first approach de-risks early (prove core functionality works before building UI).

---

## Checkpoints

After each phase, review:
- Does the implementation match the documentation?
- Do docs need to be updated?
- Are there any blockers or open questions?
- Is the quality acceptable (code, UX, performance)?

**No phase is complete until docs are updated and functionality is tested.**

---

## Related Docs

- **[ARCHITECTURE.md](ARCHITECTURE.md)** — How everything fits together
- **[PRODUCT.md](PRODUCT.md)** — What we're building (pages, features, UX)
- **[CONTENT_MODEL.md](CONTENT_MODEL.md)** — Database schema
- **[CONVENTIONS.md](CONVENTIONS.md)** — How to write code
