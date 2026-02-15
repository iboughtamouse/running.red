# Overview

**Last updated:** 2026-02-15

---

## What Is Running Red?

Running Red is a webcomic platform for an artist named **Ren** (he/him). It's a passion project telling the story of **Alexandrus**, a character Ren created at age 13 and has developed for over a decade. This is Ren's first webcomic.

The platform has two parts:

1. **A public website** where readers browse and read the comic
2. **An admin interface** where Ren manages content (uploads pages, edits text, etc.)

Ren is an artist, not a developer. He should never need to touch code, Git, or infrastructure. Everything he needs to do should be possible through the admin interface.

---

## Goals

### Primary Goal
**Make it easy for Ren to publish a webcomic.**

This means:
- Uploading a new comic page should be simple (upload image, add commentary, set publish date, done)
- Updating static content (About page, links) should be straightforward
- Replacing an image for an older page (if he redraws it) should be possible without breaking anything
- The website should be fast, clean, and mobile-friendly for readers

### Secondary Goals
- **Minimal infrastructure complexity** — Ren doesn't manage servers; the site owner does. Keep it simple.
- **Low cost** — This is a passion project, not a business. Use free tiers where possible.
- **Fast for readers** — Comic pages should load quickly on mobile. Aim for <2s on 4G.
- **SEO-friendly** — Readers should be able to find the comic via search engines.

### Non-Goals (Explicitly Out of Scope)
- Multi-author support (it's just Ren)
- Complex workflows (draft → review → publish — Ren decides when to publish)
- Comments system (maybe later, but not now)
- User accounts for readers (no login, no profiles)
- Multilingual support
- Print/download functionality
- Merchandising/store

---

## Users

| User | Role | Interface |
|------|------|-----------|
| **Readers** | Browse and read the comic | Public website (running.red) |
| **Ren (author)** | Upload pages, edit content | Admin interface (/admin or similar) |
| **Site owner** | Deploy, maintain infrastructure | Git, Vercel/Railway dashboards |

**Key constraint:** Ren does NOT have access to the code repository. He interacts entirely through the admin UI.

---

## Context

### The Comic
- Updates **Mondays**
- Subject matter: Alexandrus's story (themes: trauma, identity, growth)
- **Content warnings** are a first-class feature — some pages contain sensitive content (violence, mental health themes, etc.)

### Technical Context
- This is a **rebuild from scratch** after an initial Payload CMS implementation proved too complex
- The first version attempted a full-featured headless CMS (Payload) with a separate backend, PostgreSQL, and monorepo setup
- We learned: **simplicity matters more than "best practices"** — this is a webcomic site, not a SaaS platform
- New approach: **single Next.js app** with admin routes, simpler infrastructure, full control

---

## Success Criteria

The project is successful if:

1. ✅ Ren can upload a new comic page in under 2 minutes (including image, commentary, publish date)
2. ✅ Ren can edit the About page, Links page, or site settings without touching code
3. ✅ Ren can replace an image for an existing page without breaking navigation or page order
4. ✅ Readers can view comic pages on mobile with <2s load time on 4G
5. ✅ The site is deployed and Ren can update content without the site owner's help
6. ✅ The monthly hosting cost is <$10 (ideally $0 on free tiers)

---

## Constraints

### Technical Constraints
- Must work on Vercel (or similar JAMstack host) for the frontend
- Must support responsive images (desktop + mobile sizes)
- Must generate WebP images for performance
- Must handle content warnings (blur overlay for flagged pages)

### User Constraints
- Ren is not technical — admin UI must be intuitive
- Ren works on iPad sometimes — admin must be mobile-friendly
- Ren doesn't want to learn Git — all edits happen via UI

### Business Constraints
- Low/no cost hosting (free tiers preferred)
- No ongoing maintenance burden (no server updates, no database migrations if avoidable)

---

## What Makes This Different From Other Webcomics?

Most webcomic platforms (e.g., Tapas, Webtoon) are:
- Controlled by the platform (you don't own your content/domain)
- Ad-supported or subscription-based
- Limited customization

Running Red is:
- **Self-hosted** — Ren owns the domain and content
- **Custom-built** — Designed specifically for Ren's needs
- **Simple** — No features we don't need
- **Content-warning-first** — Treating sensitive content properly is built-in, not an afterthought

---

## Project Philosophy

From our discussions:

> "Arguments, disagreements, debates, different points of view backed up by emotion, conviction, and stubborn perseverance... these are all bits of grit that make the polish, that make the product." — Jason Fried

We prioritize:
- **Friction over convenience** — If something feels wrong, discuss it
- **Clarity over speed** — Documentation first, code second
- **Simplicity over "best practices"** — Use the right tool, not the trendy one
- **Control over convenience** — Own the stack, don't outsource what matters

---

## Related Docs

- **[PRODUCT.md](PRODUCT.md)** — Detailed product requirements, pages, features
- **[ARCHITECTURE.md](ARCHITECTURE.md)** — How the system works technically
- **[DECISIONS.md](DECISIONS.md)** — Why we made specific architectural choices
