# Running Red — AI Agent Context

**Last updated:** 2026-02-15

---

## What Is This Project?

Running Red is a webcomic platform for an artist named Ren (he/him). It's a single Next.js application with:
1. **Public routes** (`/`, `/comic/[slug]`, `/about`, etc.) where readers browse the comic
2. **Admin routes** (`/admin`) where Ren manages content — he never touches code

**No separate CMS app. No monorepo. One simple Next.js app.**

---

## Documentation

**📖 Start here: [`docs/README.md`](docs/README.md)**

The `docs/` directory contains comprehensive documentation. Read these in order:

1. **[OVERVIEW.md](docs/OVERVIEW.md)** — What we're building and why
2. **[PRODUCT.md](docs/PRODUCT.md)** — Product requirements, pages, features
3. **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** — Technical architecture, data flow
4. **[CONTENT_MODEL.md](docs/CONTENT_MODEL.md)** — Database schema, types
5. **[TECH_STACK.md](docs/TECH_STACK.md)** — Technology choices and rationale
6. **[CONVENTIONS.md](docs/CONVENTIONS.md)** — Code style, git workflow
7. **[IMPLEMENTATION.md](docs/IMPLEMENTATION.md)** — Phased roadmap (we're on Phase 0)

**Reference:**
- **[DECISIONS.md](docs/DECISIONS.md)** — Architecture Decision Records (ADRs)
- **[GLOSSARY.md](docs/GLOSSARY.md)** — Terms and definitions

---

## Current Status

**Phase 0: Documentation** ✅ Complete

**Phase 1: Foundation** 🔲 Not started (next up)

See [`docs/IMPLEMENTATION.md`](docs/IMPLEMENTATION.md) for the full roadmap.

---

## Key Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 15** | Single app (public + admin routes) |
| **TypeScript** | Strict mode, no `any` types |
| **PostgreSQL** | Content metadata (Vercel Postgres, Railway, or Supabase) |
| **Cloudflare R2** | Image storage (zero egress fees) |
| **Tailwind CSS** | Styling (mobile-first) |
| **npm** | Package manager (not pnpm) |

---

## Conventions

- **Documentation-first approach** — Docs drive implementation, not reverse-engineering
- **Simplicity over cleverness** — This is a webcomic, not a SaaS platform
- **TypeScript strict mode** — No `any`, no `enum`, explicit return types
- **Server Components by default** — `"use client"` only when needed
- **Conventional commits** — `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`
- **PRs target `develop`** — Never push directly to `main` or `develop`

See [`docs/CONVENTIONS.md`](docs/CONVENTIONS.md) for full details.

---

## Things to Know

- **Ren does NOT have access to this repo** — He uses only the admin UI
- **The comic updates Mondays** — Weekly schedule
- **Content warnings are first-class** — Some pages are blurred until reader confirms
- **Image pipeline:** Upload PNG → Sharp generates WebP (desktop + mobile) + blur placeholder → R2 storage
- **Git workflow:** `develop` branch is integration/staging, `main` is production
- **No monorepo, no Payload CMS** — We nuked that. Single Next.js app now.

---

## Important Reminders

1. **Read the docs in `docs/` before making changes** — Everything is documented
2. **Update docs when you change things** — No phase is complete until docs are current
3. **Ask questions if unclear** — Better to clarify than to guess and redo work
4. **Follow the implementation plan** — See `docs/IMPLEMENTATION.md` for phases

---

## Project Philosophy

From our discussions:

> "Arguments, disagreements, debates, different points of view backed up by emotion, conviction, and stubborn perseverance... these are all bits of grit that make the polish, that make the product." — Jason Fried

We prioritize:
- **Friction over convenience** — If something feels wrong, discuss it
- **Clarity over speed** — Clear documentation enables rapid iteration
- **Simplicity over "best practices"** — Use the right tool, not the trendy one
- **Control over convenience** — Own the stack, don't outsource what matters

---

## Questions?

Check:
- **[docs/GLOSSARY.md](docs/GLOSSARY.md)** — If you don't know a term
- **[docs/DECISIONS.md](docs/DECISIONS.md)** — If you wonder why we chose something
- **[docs/README.md](docs/README.md)** — For navigation help

If still unclear, ask the user.
