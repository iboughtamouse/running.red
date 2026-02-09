# Tasks

> Last updated: 2026-02-09

## How to Read This

Each phase is a milestone. Tasks within a phase can often be done in parallel. Every phase ends with a documentation checkpoint — docs must be updated before the phase is considered complete.

Status key: `[ ]` = not started, `[~]` = in progress, `[x]` = done

---

## Phase 0: Planning & Documentation

> Goal: Establish project direction, document all decisions, create foundation for AI-driven development.

- [x] Create `docs/ARCHITECTURE.md`
- [x] Create `docs/PRODUCT_SPEC.md`
- [x] Create `docs/CONVENTIONS.md`
- [x] Create `docs/TASKS.md` (this file)
- [x] Create `CLAUDE.md` (AI agent context)
- [x] Commit and push Phase 0

---

## Phase 1: Foundation

> Goal: Working monorepo with both apps running locally. Deployable to Vercel and Railway.

### Monorepo Setup
- [x] Initialize Turborepo with pnpm workspaces
- [x] Configure root `package.json`, `turbo.json`, `pnpm-workspace.yaml`
- [x] Configure shared TypeScript config

### Web App (Next.js)
- [x] Scaffold Next.js 15 app in `apps/web`
- [x] Configure Tailwind CSS
- [x] Create root layout with site header and navigation
- [x] Create placeholder pages: Home, About, Archive, Links
- [x] Configure path aliases (`@/`)

### CMS App (Payload)
- [x] Scaffold Payload CMS 3.x in `apps/cms`
- [x] Define `comic-pages` collection
- [x] Define `media` collection with R2 storage adapter
- [x] Define globals: `site-settings`, `about-page`, `links-page`
- [x] Configure PostgreSQL connection

### Shared Package
- [x] Create `packages/shared` with TypeScript types
- [x] Define content types matching CMS schemas

### Infrastructure
- [x] Create `.env.example` files for both apps
- [ ] Configure Vercel project for `apps/web` (manual: dashboard)
- [ ] Configure Railway project for `apps/cms` (manual: dashboard)
- [ ] Set up Cloudflare R2 bucket (manual: dashboard)
- [ ] Configure DNS for `running.red` and `admin.running.red` (manual: Namecheap)

### Documentation Checkpoint
- [x] Update all docs to reflect any changes from implementation

---

## Phase 2: Core Comic Reader

> Goal: Readers can view comic pages and navigate between them. Author can upload pages via CMS.

### CMS → Web Data Flow
- [ ] Create API client in `apps/web` to fetch from Payload
- [ ] Implement ISR (Incremental Static Regeneration) for comic pages
- [ ] Handle draft/published status and publish dates

### Comic Page Display
- [ ] Build comic page component with responsive image display
- [ ] Implement `<picture>` element with WebP sources and responsive srcset
- [ ] Add LQIP blur placeholder during image load
- [ ] Build page info box (title, date, commentary)

### Navigation
- [ ] Build navigation bar: First | Previous | Next | Last
- [ ] Disable buttons at boundaries
- [ ] Add keyboard navigation (left/right arrow keys)
- [ ] Preload adjacent page images
- [ ] Implement URL structure: `/` (latest), `/comic/[slug]` (specific page)

### Documentation Checkpoint
- [ ] Update all docs to reflect any changes from implementation

---

## Phase 3: Content Pages

> Goal: All public pages functional with CMS-driven content.

### About Page
- [ ] Fetch about page content from CMS global
- [ ] Render rich text sections (About Me, About the Comic, Content Warnings, Schedule)

### Archive Page
- [ ] Fetch all published comic pages
- [ ] Render chronological list with page number, title, date
- [ ] Link each entry to its comic page
- [ ] Group by chapter (once chapters exist)

### Links Page
- [ ] Fetch links from CMS global
- [ ] Render ordered list of links with titles, URLs, descriptions

### RSS Feed
- [ ] Create RSS 2.0 route handler at `/rss.xml`
- [ ] Include published comic pages with title, date, link, thumbnail

### Documentation Checkpoint
- [ ] Update all docs to reflect any changes from implementation

---

## Phase 4: Polish

> Goal: Production-ready quality. Content warnings, performance, SEO.

### Content Warning System
- [ ] Implement blur overlay for flagged pages
- [ ] Add "View Page" confirmation button
- [ ] Respect per-page custom warning text

### SEO & Metadata
- [ ] Add page-specific `<title>` and `<meta>` tags
- [ ] Add Open Graph and Twitter Card tags
- [ ] Use comic image as OG image for comic pages
- [ ] Add canonical URLs
- [ ] Generate sitemap.xml

### Performance
- [ ] Audit with Lighthouse (target > 90 all categories)
- [ ] Optimize image loading (lazy load off-screen, eager load current)
- [ ] Minimize client-side JS bundle
- [ ] Add loading states and error boundaries

### Visual Design
- [ ] Finalize color scheme, typography, spacing (needs Ren's input)
- [ ] Responsive layout testing (mobile, tablet, desktop)
- [ ] Favicon and app icons

### Documentation Checkpoint
- [ ] Update all docs to reflect final state

---

## Future (Not Scheduled)

These are explicitly out of scope for the initial build. They may be revisited later.

- [ ] Comment system (Giscus or similar)
- [ ] Page version history (view older versions of updated pages)
- [ ] Search
- [ ] Chapter management and chapter-based navigation
- [ ] Print/download mode
- [ ] Analytics integration
