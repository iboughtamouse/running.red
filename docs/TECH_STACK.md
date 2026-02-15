# Tech Stack

**Last updated:** 2026-02-15

---

## Overview

This document describes every technology used in the project and explains **why** we chose it.

---

## Core Stack

| Technology | Purpose | Version | Why This? |
|------------|---------|---------|-----------|
| **Next.js** | Web framework | 15.x | SSG/ISR perfect for webcomic, App Router = less client JS, Vercel deployment |
| **React** | UI library | 19.x | Required by Next.js, Server Components reduce bundle size |
| **TypeScript** | Language | 5.x | Type safety, better DX, catches errors at compile time |
| **PostgreSQL** | Database | 15+ | Reliable, generous free tiers, good for structured data |
| **Cloudflare R2** | Image storage | — | Zero egress fees, S3-compatible, built-in CDN |

---

## Detailed Choices

### Next.js 15

**What it provides:**
- File-based routing (App Router)
- SSG (Static Site Generation) + ISR (Incremental Static Regeneration)
- React Server Components by default
- Built-in image optimization
- API routes
- TypeScript support out of the box

**Why we chose it:**
1. **ISR is perfect for a webcomic** — Pages are static (fast), but can revalidate when new comics publish
2. **App Router + Server Components** — Less client-side JS = better performance
3. **Vercel deployment is trivial** — Push to Git, auto-deploys
4. **Image optimization** — Handles responsive images well
5. **Ecosystem** — Well-documented, large community, stable

**Alternatives considered:**
- **Astro** — Great for static sites, but less good for the admin interface (would need React anyway)
- **Remix** — SSR-first, but we don't need full SSR (ISR is better for webcomic)
- **Vite + React Router** — More manual setup, would have to build SSG ourselves
- **Plain HTML/CSS/JS** — Too manual, no framework benefits

**Verdict:** Next.js is the right tool for this job.

---

### TypeScript

**What it provides:**
- Static typing
- IDE autocomplete
- Compile-time error checking
- Better refactoring

**Why we chose it:**
1. **Type safety** — Catch errors before runtime (e.g., wrong field names in database queries)
2. **Documentation** — Types serve as inline documentation
3. **Refactoring** — Rename a field, TypeScript finds all usages
4. **Strict mode** — No `any` types = no hidden bugs

**Alternatives considered:**
- **JavaScript** — Faster to write, but more runtime errors, harder to maintain

**Verdict:** TypeScript strict mode is worth the overhead.

---

### PostgreSQL

**What it provides:**
- Relational database
- ACID transactions
- JSONB support (for links array)
- Full-text search (if needed later)

**Why we chose it:**
1. **Reliable** — Battle-tested, widely used
2. **Free tier** — Railway (500MB free, then $5/month)
3. **Good for structured data** — Comic pages have a clear schema
4. **JSONB** — Flexible for fields like links array (don't need a separate table)

**Alternatives considered:**
- **SQLite** — File-based, but Vercel doesn't support persistent storage
- **MongoDB** — NoSQL, but our data is very structured (relational is better)
- **Git-based (JSON files)** — Simple, but Ren's edits = Git commits (weird UX)

**Verdict:** PostgreSQL is the least weird, most reliable choice.

---

### Cloudflare R2

**What it provides:**
- S3-compatible object storage
- Zero egress fees (downloading is free)
- Cloudflare CDN built-in
- 10GB free storage, 1M reads/month

**Why we chose it:**
1. **Zero egress fees** — Unlike S3, serving images to readers is free
2. **S3-compatible API** — Easy to use (AWS SDK works)
3. **Cloudflare CDN** — Fast delivery worldwide
4. **Generous free tier** — 10GB is enough for years of comics

**Alternatives considered:**
- **AWS S3** — Standard, but egress fees add up (readers download images constantly)
- **Vercel Blob Storage** — Could work, but R2's zero egress is compelling
- **Cloudinary** — Image CDN with transforms, but costs more, adds complexity
- **Store in database** — Bad idea (databases aren't for large binaries)

**Verdict:** R2's zero egress fees make it the obvious choice for a webcomic.

---

## Frontend Libraries

| Library | Purpose | Why This? |
|---------|---------|-----------|
| **Tailwind CSS** | Styling | Utility-first, fast, mobile-first, no CSS file bloat |
| **Sharp** | Image processing | Fast, well-maintained, used by Next.js internally |
| **next-auth** (or simple auth) | Authentication | Simple, works with Next.js, supports credentials provider |

---

### Tailwind CSS

**What it provides:**
- Utility-first CSS framework
- Pre-defined classes for layout, typography, colors
- Responsive design (`sm:`, `md:`, `lg:` breakpoints)
- Purges unused CSS (small bundle)

**Why we chose it:**
1. **Mobile-first** — Responsive design is built-in
2. **No CSS file bloat** — Only ship classes you use
3. **Fast to write** — No naming classes, no switching between files
4. **Consistency** — Predefined spacing/colors = consistent design

**Alternatives considered:**
- **Plain CSS** — More control, but slower to write, harder to maintain
- **CSS Modules** — Good, but more files to manage
- **Styled Components** — Runtime cost, not ideal for SSR

**Verdict:** Tailwind is the fastest way to build a clean, responsive UI.

---

### Sharp

**What it provides:**
- Image processing (resize, convert, optimize)
- WebP encoding
- JPEG/PNG decoding
- Fast (uses libvips, not ImageMagick)

**Why we chose it:**
1. **Fast** — Processes images in seconds, not minutes
2. **Well-maintained** — Used by Next.js, Gatsby, etc.
3. **WebP support** — Critical for performance
4. **Good API** — Simple, chainable methods

**Alternatives considered:**
- **ImageMagick (via CLI)** — Slower, harder to use
- **Canvas API (browser-side)** — Can't process server-side
- **Cloudinary** — Outsources processing, but adds cost and latency

**Verdict:** Sharp is the industry standard for server-side image processing.

---

### Authentication

**Options:**
1. **NextAuth.js** — Full-featured auth library for Next.js
2. **Simple password auth** — Just check email/password against env vars

**Why we're keeping it simple:**
- Only one user (Ren)
- No OAuth needed (no "Sign in with Google")
- No role-based access control

**Likely choice:** Simple password auth (email + password in env vars, session in cookie)

**If we grow:** Switch to NextAuth later (easy migration)

---

## Development Tools

| Tool | Purpose | Why This? |
|------|---------|-----------|
| **npm** | Package manager | Standard, comes with Node, no learning curve |
| **ESLint** | Linting | Catch code errors, enforce style |
| **Prettier** | Formatting | Auto-format code, no style debates |
| **Git** | Version control | Industry standard |
| **VS Code** | Editor | Free, great TypeScript support, most popular |

---

### Package Manager: npm

**Why npm, not pnpm or yarn?**
- **User requested it** — Doesn't know pnpm, wants familiar tools
- **No monorepo** — We're not using a monorepo anymore, so pnpm's workspace benefits don't apply
- **Standard** — Comes with Node, no extra install

**Verdict:** npm is fine for a single Next.js app.

---

## Deployment

| Service | Purpose | Cost | Why This? |
|---------|---------|------|-----------|
| **Vercel** | Host Next.js app | Free (hobby tier) | Zero-config Next.js deployment, generous free tier |
| **Railway** | Host database | Free tier | Simple PostgreSQL hosting, 500MB free then $5/month |
| **Cloudflare** | Host images (R2) | Free tier (10GB) | Zero egress fees, built-in CDN |
| **Namecheap** | Domain registrar | ~$10/year | User already owns domain |

---

### Vercel

**Why Vercel for hosting?**
1. **Zero-config Next.js deployment** — Push to Git, auto-deploys
2. **Free tier is generous** — Unlimited bandwidth, 100GB storage
3. **Preview deployments** — Every PR gets a preview URL
4. **Edge network** — Fast globally
5. **Railway** — Simple PostgreSQL hosting

**Alternatives:**
- **Netlify** — Similar to Vercel, but less Next.js-specific
- **Railway** — Good for full-stack apps, but Vercel is simpler for Next.js
- **Self-hosted (VPS)** — More work, no auto-deploys

**Verdict:** Vercel is the obvious choice for Next.js.

---

### Database Hosting

**Choice:** Railway — Free tier (500MB), then $5/month

---

## What We're NOT Using

| Technology | Why Not? |
|------------|----------|
| **Payload CMS** | Too complex, config hell, overkill for single-author webcomic |
| **WordPress** | PHP, bloated, not built for this use case |
| **Sanity/Contentful** | Hosted CMS = vendor lock-in, learning curve, not needed |
| **GraphQL** | Overkill for simple queries, REST is fine |
| **Prisma ORM** | Nice, but not required (raw SQL is fine for this scale) |
| **Redux/Zustand** | No client-side state management needed (Server Components!) |
| **Monorepo (Turborepo)** | Only one app now, no need for monorepo complexity |
| **pnpm** | User doesn't know it, npm is fine |

---

## Decision Summary

| Decision | Choice | Why? |
|----------|--------|------|
| **Framework** | Next.js 15 | ISR perfect for webcomic, Vercel deployment |
| **Language** | TypeScript strict | Type safety, better DX |
| **Database** | PostgreSQL | Reliable, free tiers, structured data |
| **Image Storage** | Cloudflare R2 | Zero egress fees, S3-compatible |
| **Styling** | Tailwind CSS | Fast, mobile-first, utility-first |
| **Image Processing** | Sharp | Fast, well-maintained, WebP support |
| **Auth** | Simple password | One user, no OAuth needed |
| **Package Manager** | npm | Standard, user knows it |
| **Hosting** | Vercel | Zero-config Next.js, free tier |

---

## Related Docs

- **[ARCHITECTURE.md](ARCHITECTURE.md)** — How these technologies fit together
- **[DECISIONS.md](DECISIONS.md)** — More detailed reasoning for controversial choices
