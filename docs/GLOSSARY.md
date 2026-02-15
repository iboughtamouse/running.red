# Glossary

**Last updated:** 2026-02-15

---

## Overview

This document defines terms, concepts, and abbreviations used throughout the Running Red project.

---

## Project-Specific Terms

### Alexandrus
The main character of the Running Red webcomic. Created by Ren when he was 13, developed over a decade.

### Comic Page
A single page of the webcomic. Each page has:
- A sequential page number (1, 2, 3...)
- An image (the actual comic artwork)
- Optional title
- Optional author commentary
- Publish date
- Status (draft or published)

### Content Warning
A flag on comic pages that contain sensitive content (violence, trauma, etc.). Pages with content warnings display blurred with a confirmation overlay before revealing.

### Ren
The author and artist of Running Red. He uses the admin interface to manage the comic. He/him pronouns.

### Running Red
The name of the webcomic and this project. The domain is `running.red`.

### Slug
A URL-safe identifier for a comic page. Format: `page-{N}` (e.g., `page-1`, `page-42`). Used in URLs like `/comic/page-42`.

---

## Technical Terms

### Admin Interface
The password-protected section of the website (`/admin`) where Ren manages content. Includes pages for uploading comics, editing About/Links, and site settings.

### API Route
A serverless function in Next.js that handles backend logic (e.g., uploading images, database mutations). Located in `app/api/`.

### App Router
Next.js's new routing system (introduced in v13+, stable in v15). Uses the `app/` directory with file-based routing and React Server Components.

### Blur Hash / LQIP
**LQIP = Low-Quality Image Placeholder**. A tiny, base64-encoded version of an image used as a placeholder while the full image loads. Prevents blank space, improves perceived performance.

### CDN (Content Delivery Network)
A network of servers that cache and serve content (images, CSS, JS) from locations close to users. Cloudflare's CDN serves our R2 images.

### Client Component
A React component in Next.js that runs in the browser. Marked with `"use client"`. Used for interactivity (state, events, browser APIs).

### Collection
In database terms, a table with multiple rows (e.g., `comic_pages`). Contrast with **singleton**.

### ISR (Incremental Static Regeneration)
Next.js feature that pre-renders pages at build time (like SSG) but can revalidate and regenerate them in the background. Perfect for comic pages (static but update weekly).

### Middleware
Code that runs before a request is completed (in Next.js). Used to protect `/admin` routes (check authentication before allowing access).

### On-Demand Revalidation
Triggering ISR revalidation manually (via API call) instead of waiting for the revalidation window. Used when Ren publishes a new page.

### PostgreSQL
The relational database we use to store content metadata (comic pages, about page, links, site settings). Often abbreviated as "Postgres."

### R2 (Cloudflare R2)
Cloudflare's object storage service (S3-compatible). We use it to store comic page images. Zero egress fees = free to serve images to readers.

### Revalidation
The process of updating a statically-generated page in Next.js. Triggered automatically (ISR with a time window) or manually (on-demand).

### Server Component
A React component in Next.js that runs on the server only. Default in App Router. Generates HTML, doesn't ship JavaScript to the browser.

### Sharp
A Node.js library for image processing (resize, convert formats, optimize). We use it to generate WebP variants and blur placeholders.

### Singleton
In database terms, a table with only 1 row (e.g., `about_page`, `site_settings`). Not a collection.

### SSG (Static Site Generation)
Pre-rendering pages at build time. Pages are generated once, served as static HTML. Fast, but doesn't update without rebuilding.

### SSR (Server-Side Rendering)
Rendering pages on every request (on the server). Always fresh, but slower than SSG.

### Tailwind CSS
A utility-first CSS framework. Provides classes like `flex`, `px-4`, `text-blue-500` that you apply directly to HTML elements.

### WebP
A modern image format developed by Google. ~30% smaller than JPEG at equivalent quality. Supported by all modern browsers.

---

## Database Terms

### JSONB
PostgreSQL's data type for JSON data stored in binary format. Used for the `links` array in `links_page` table (flexible, queryable).

### Migration
A script that changes the database schema (e.g., adding a column, creating a table). Migrations are versioned and applied in order.

### Primary Key
A unique identifier for a row in a table (e.g., `id` column). Every table has one.

### Schema
The structure of a database table (column names, types, constraints). Also used to refer to the overall database structure.

### Seed Data
Initial data inserted into the database (e.g., default site settings, empty about page). Used when setting up a new database.

---

## Acronyms

### ADR
**Architecture Decision Record**. A document explaining why we made a specific architectural choice. See `DECISIONS.md`.

### API
**Application Programming Interface**. In this project, usually refers to Next.js API routes (serverless functions).

### CDN
**Content Delivery Network**. Cloudflare's CDN serves our R2 images fast.

### CMS
**Content Management System**. We initially tried Payload CMS, then decided to build our own simple admin interface instead.

### CSS
**Cascading Style Sheets**. The language for styling web pages. We use Tailwind CSS.

### DX
**Developer Experience**. How easy/pleasant it is to work with a tool or codebase.

### HTML
**HyperText Markup Language**. The markup language for web pages.

### ISR
**Incremental Static Regeneration**. Next.js feature for static pages that can update.

### LQIP
**Low-Quality Image Placeholder**. Same as blur hash.

### OG
**Open Graph**. The protocol for social media sharing metadata (e.g., `og:title`, `og:image`). Used by Facebook, Twitter, etc.

### PR
**Pull Request**. A Git workflow for reviewing code changes before merging into the main branch.

### RSS
**Really Simple Syndication**. A web feed format that allows users to subscribe to content updates.

### SEO
**Search Engine Optimization**. Practices to make the site more discoverable via search engines (Google, Bing, etc.).

### SSG
**Static Site Generation**. Pre-rendering pages at build time.

### SSR
**Server-Side Rendering**. Rendering pages on every request.

### TS / TypeScript
TypeScript, the typed superset of JavaScript we use for all code.

### UI
**User Interface**. The visual elements users interact with.

### URL
**Uniform Resource Locator**. The web address (e.g., `https://running.red/comic/page-42`).

### UX
**User Experience**. How users feel when using the site.

---

## Workflow Terms

### CI/CD
**Continuous Integration / Continuous Deployment**. Automated testing and deployment (e.g., GitHub Actions runs tests on every PR, Vercel auto-deploys on push).

### Conventional Commits
A commit message format: `type: description` (e.g., `feat: add content warning overlay`). Types: `feat`, `fix`, `docs`, `chore`, `refactor`, etc.

### Develop Branch
The integration/staging branch. All PRs target `develop`. Merges into `main` for production releases.

### Main Branch
The production branch. Code in `main` is deployed to `running.red`.

### Monorepo
A repository with multiple apps/packages (e.g., `apps/web`, `apps/cms`, `packages/shared`). We **don't** use this anymore (we ditched the monorepo for a single app).

### Preview Deployment
Vercel creates a preview URL for every PR (e.g., `*.vercel.app`). Useful for testing before merging.

---

## User Interface Terms

### Archive
A page (`/archive`) that lists all published comic pages chronologically.

### Blur Overlay
The visual effect on content-warning pages: the comic image is blurred, covered with an overlay showing warning text and a "View Page" button.

### Commentary
Author's notes displayed below each comic page. Written by Ren, can be markdown or plain text.

### Navigation Bar
The buttons below the comic image: **First | Previous | Next | Last**. Used to navigate between pages.

### Site Header
The top navigation on the public site, showing the site title and links (Home, About, Archive, Links).

---

## Image Terms

### Desktop Image
The larger WebP variant (max 1200px wide) for desktop/tablet screens.

### Mobile Image
The smaller WebP variant (max 800px wide) for mobile phones.

### Original Image
The PNG or JPEG file Ren uploads. Stored in R2 for archival, but not served to readers (we serve WebP variants instead).

### Responsive Images
Images that load different sizes based on the user's screen size. Implemented with `<picture>` and `srcset`.

### Srcset
An HTML attribute that lists multiple image sources (sizes) for the browser to choose from. Used for responsive images.

---

## Hosting Terms

### Cloudflare
The company that provides R2 (object storage) and CDN. Also handles DNS for the domain.

### Railway
A platform for hosting databases and backend services. We use Railway for PostgreSQL.

### Vercel
The platform that hosts the Next.js app. Auto-deploys on Git push, provides preview URLs, has a generous free tier.

---

## Related Docs

- **[ARCHITECTURE.md](ARCHITECTURE.md)** — Technical architecture (uses these terms)
- **[PRODUCT.md](PRODUCT.md)** — Product requirements (uses these terms)
- **[CONVENTIONS.md](CONVENTIONS.md)** — Code conventions (uses these terms)
