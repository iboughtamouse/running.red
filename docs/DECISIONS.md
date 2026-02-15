# Architecture Decision Records

**Last updated:** 2026-02-15

---

## Overview

This document records significant architectural decisions made for Running Red. Each decision follows this format:

- **Decision:** What we chose
- **Context:** Why we had to decide
- **Alternatives:** What else we considered
- **Rationale:** Why we chose this
- **Consequences:** Trade-offs and implications

---

## ADR-001: Nuke the Payload CMS Implementation

**Date:** 2026-02-15

**Status:** ✅ Accepted

### Decision

Remove the entire Payload CMS implementation (apps/cms, monorepo structure, pnpm) and rebuild from scratch with a simpler architecture.

### Context

The initial implementation used Payload CMS 3.x with a separate backend app, PostgreSQL, Cloudflare R2, and a Turborepo monorepo. After several scaffold attempts and configuration issues:
- Payload was proving too complex for a single-author webcomic
- Configuration churn (importMap.js regeneration, type generation)
- Monorepo overhead not justified for 2 apps
- pnpm unfamiliar to the user
- User frustrated with tech complexity vs actual product needs

### Alternatives

1. **Keep Payload, debug the config issues** — Sunk cost, but might work
2. **Switch to Sanity or Contentful** — Different CMS, similar complexity
3. **DIY admin in Next.js** — Build our own simple admin interface
4. **Git-based CMS (Tina, Decap)** — Ren's edits = git commits (weird UX)

### Rationale

The project goals emphasize **simplicity over "best practices."** Payload is designed for complex, multi-user content workflows. Running Red is:
- Single author (Ren)
- Weekly updates (not high velocity)
- Simple content model (pages, about, links)

A custom admin interface in the Next.js app gives us:
- Full control (no framework abstraction)
- Simpler deployment (one app, not two)
- No CMS-specific learning curve
- Exactly what we need, nothing more

The user explicitly said: *"I feel more comfortable relying on technologies and tools that we have control over."*

### Consequences

**Positive:**
- One Next.js app (simpler deployment)
- No monorepo complexity
- No Payload config issues
- We control the admin UX completely

**Negative:**
- We have to build the admin interface ourselves (more initial work)
- No polished CMS admin UI (Ren gets a simpler, custom-built one)
- We lose Payload's rich text editor (but can use Tiptap or markdown instead)

**Mitigation:**
- Build admin incrementally (Phase 3)
- Use existing libraries (Sharp for images, Tiptap for rich text if needed)

---

## ADR-002: Single Next.js App (Not Separate Apps)

**Date:** 2026-02-15

**Status:** ✅ Accepted

### Decision

Build Running Red as a **single Next.js application** with public routes (`/`, `/comic/[slug]`) and admin routes (`/admin/*`), instead of separate apps for web and admin.

### Context

We could split the architecture into:
- `apps/web` — Public website
- `apps/admin` — Admin interface

Or combine them into one app with route-based separation.

### Alternatives

1. **Separate apps** — Clean separation, but more complex deployment
2. **Single app with route groups** — Public and admin in same app, separated by routes

### Rationale

For this project, separate apps don't provide enough value to justify the complexity:
- **One deployment** — Simpler than two
- **Shared code** — Database client, types, utilities used by both
- **No CORS issues** — Admin API routes can be in the same app
- **Simpler auth** — Middleware protects `/admin/*` routes directly

The scale doesn't justify separation:
- One user (Ren) using the admin
- Low traffic (not a scaling concern)
- Shared database/R2 anyway

### Consequences

**Positive:**
- One `package.json`, one deployment
- Shared types, utilities, database client
- Simpler CI/CD (one build)

**Negative:**
- Public and admin code in same repo (but organized into route groups)
- If admin needs different Node version or deps, harder to separate later

**Mitigation:**
- Use Next.js route groups `(public)` and `admin/` to organize clearly
- Admin routes are protected by middleware (no accidental public access)

---

## ADR-003: PostgreSQL Over SQLite or Git-Based Storage

**Date:** 2026-02-15

**Status:** ✅ Accepted

### Decision

Use **PostgreSQL** (Vercel Postgres, Railway, or Supabase) for content metadata storage.

### Context

We need to store metadata for comic pages, about page, links, site settings. Options:
1. **PostgreSQL** — Relational database, generous free tiers
2. **SQLite** — File-based, simple, but Vercel doesn't support persistent volumes
3. **Git-based (JSON/Markdown files)** — Content in repo, version controlled

### Alternatives

| Option | Pros | Cons |
|--------|------|------|
| **PostgreSQL** | Reliable, queryable, free tiers, ACID | Requires server/service |
| **SQLite** | Simple, file-based | No persistent storage on Vercel |
| **Git-based** | Version controlled, no DB server | Ren's edits = Git commits (weird), slower writes |

### Rationale

**PostgreSQL wins because:**
1. **Free tiers are generous** — Vercel Postgres (256MB free), Railway (500MB free), Supabase (500MB free)
2. **Reliable and well-understood** — Battle-tested, won't break
3. **Good for structured data** — Comic pages have a clear schema
4. **JSONB support** — Flexible for fields like links array (don't need separate table)

**Why not SQLite:**
- Vercel doesn't support persistent file storage (no place to store the .db file)
- Could use Railway + SQLite, but Postgres is more standard for hosted apps

**Why not Git-based:**
- Ren's edits would create Git commits (confusing UX)
- Slower writes (commit, push)
- Harder to query (no SQL)

### Consequences

**Positive:**
- Reliable storage
- SQL queries (easy to fetch published pages, etc.)
- Free for our scale

**Negative:**
- Requires a database service (but free tier covers us)
- One more thing to manage (but Vercel Postgres integrates seamlessly)

---

## ADR-004: Cloudflare R2 for Image Storage

**Date:** 2026-02-15

**Status:** ✅ Accepted

### Decision

Use **Cloudflare R2** for storing comic page images (originals and processed WebP variants).

### Context

Images need to be stored somewhere. Options:
1. **Cloudflare R2** — S3-compatible, zero egress fees
2. **AWS S3** — Standard, but egress fees add up
3. **Vercel Blob Storage** — Integrated with Vercel
4. **Database** — Bad idea (databases aren't for large binaries)

### Alternatives

| Option | Pros | Cons |
|--------|------|------|
| **Cloudflare R2** | Zero egress fees, S3-compatible, CDN built-in | Cloudflare-specific |
| **AWS S3** | Standard, reliable | Egress fees (readers download images constantly) |
| **Vercel Blob** | Vercel integration | Costs more than R2 for high-traffic images |

### Rationale

**R2 wins because of zero egress fees.**

For a webcomic:
- Readers download images constantly (every page view)
- With S3, egress fees = $0.09/GB (adds up fast)
- With R2, egress is free (only storage cost)

**Other benefits:**
- S3-compatible API (easy to use, AWS SDK works)
- Cloudflare CDN built-in (fast delivery)
- Free tier: 10GB storage, 1M reads/month (enough for years)

### Consequences

**Positive:**
- Zero egress fees (major cost savings)
- Fast delivery via Cloudflare CDN

**Negative:**
- Cloudflare-specific (not as portable as S3)
- If we outgrow free tier, costs are similar to S3 for storage (but still zero egress)

**Mitigation:**
- S3-compatible API means we can migrate to S3 later if needed (just change endpoint)

---

## ADR-005: Tailwind CSS for Styling

**Date:** 2026-02-15

**Status:** ✅ Accepted

### Decision

Use **Tailwind CSS** for styling the entire app (public site and admin).

### Context

We need to style the app. Options:
1. **Tailwind CSS** — Utility-first CSS framework
2. **Plain CSS** — Manual CSS files
3. **CSS Modules** — Scoped CSS files
4. **Styled Components** — CSS-in-JS

### Alternatives

| Option | Pros | Cons |
|--------|------|------|
| **Tailwind** | Fast, mobile-first, no CSS bloat | Verbose HTML, learning curve |
| **Plain CSS** | Full control, simple | Manual responsive design, naming conflicts |
| **CSS Modules** | Scoped styles | More files, manual responsive |
| **Styled Components** | Dynamic styles, scoped | Runtime cost, not ideal for SSR |

### Rationale

**Tailwind wins for speed and consistency:**
1. **Mobile-first responsive design** — Built-in breakpoints (`sm:`, `md:`, `lg:`)
2. **No CSS bloat** — Purges unused classes (small bundle)
3. **Fast to write** — No naming classes, no switching between files
4. **Consistent spacing/colors** — Predefined scale prevents inconsistency

For a small project like this, Tailwind's utility-first approach is faster than writing custom CSS.

### Consequences

**Positive:**
- Fast development
- Mobile-friendly by default
- Small CSS bundle

**Negative:**
- Verbose HTML (lots of classes)
- Learning curve (but Tailwind is well-documented)

---

## ADR-006: npm Over pnpm

**Date:** 2026-02-15

**Status:** ✅ Accepted

### Decision

Use **npm** as the package manager, not pnpm or Yarn.

### Context

The original implementation used pnpm for monorepo workspaces. Now that we're building a single Next.js app (no monorepo), we can choose any package manager.

### Alternatives

1. **npm** — Standard, comes with Node
2. **pnpm** — Faster, disk-efficient, strict dependencies
3. **Yarn** — Fast, similar to npm

### Rationale

**User explicitly requested npm:**
- User is unfamiliar with pnpm
- No monorepo = no need for pnpm's workspace benefits
- npm is standard, widely documented

**For a single app, the benefits of pnpm (disk savings, speed) are marginal.**

### Consequences

**Positive:**
- User knows npm
- Standard tool, no learning curve

**Negative:**
- Slightly slower than pnpm (but imperceptible for small projects)

---

## ADR-007: ISR (Incremental Static Regeneration) for Comic Pages

**Date:** 2026-02-15

**Status:** ✅ Accepted

### Decision

Use **Next.js ISR (Incremental Static Regeneration)** for comic pages, not full SSR or pure SSG.

### Context

Comic pages can be rendered:
1. **SSG (Static Site Generation)** — Pre-rendered at build time, never updates
2. **SSR (Server-Side Rendering)** — Rendered on every request
3. **ISR (Incremental Static Regeneration)** — Pre-rendered, revalidates periodically

### Alternatives

| Option | Pros | Cons |
|--------|------|------|
| **SSG** | Fastest, no server rendering | Can't update without rebuilding entire site |
| **SSR** | Always fresh | Slower, every request hits server |
| **ISR** | Fast (pre-rendered) + fresh (revalidates) | Slight complexity |

### Rationale

**ISR is perfect for a webcomic:**
- Pages are static (fast load, SEO-friendly)
- But content updates weekly (new pages publish)
- ISR revalidates in the background (e.g., every hour)
- Or use on-demand revalidation (trigger when Ren publishes)

**Why not SSG:**
- Would require rebuilding the entire site when Ren publishes a new page
- Slow for large archives (100+ pages)

**Why not SSR:**
- Unnecessarily slow (comic pages don't change per-request)
- Adds server load

### Consequences

**Positive:**
- Comic pages are fast (pre-rendered)
- New pages appear within revalidation window (or immediately with on-demand revalidation)

**Negative:**
- Slight complexity (need to configure `revalidate` or call `revalidatePath`)

---

## ADR-008: Documentation-First Approach

**Date:** 2026-02-15

**Status:** ✅ Accepted

### Decision

Write comprehensive documentation **before writing any code** for the new implementation.

### Context

The user has experience with AI-driven development and emphasized:
> "Keeping a clear set of documents that is easily navigated and doesn't skip things is crucial. If the documentation is clear, we're able to iterate very rapidly."

### Rationale

**Clear documentation enables:**
1. **Alignment** — User and AI agent agree on what's being built
2. **Fast iteration** — Agent has "ingredients, tools, experience, goals" (user's analogy)
3. **Reduced rework** — Fewer misunderstandings, fewer redos
4. **Onboarding** — Future AI agents (or humans) can read docs and understand instantly

### Consequences

**Positive:**
- Clear direction before coding
- Less rework
- Easier to review (user reads docs, not code)

**Negative:**
- Upfront time investment (but saves time later)

**Process:**
- Phase 0: Write all docs
- User reviews docs
- Then: Implement code according to docs
- Update docs if implementation deviates

---

## Related Docs

- **[TECH_STACK.md](TECH_STACK.md)** — Technologies chosen and why
- **[ARCHITECTURE.md](ARCHITECTURE.md)** — System design
- **[OVERVIEW.md](OVERVIEW.md)** — Project goals and philosophy
