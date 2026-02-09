# Running Red — AI Agent Context

## What Is This Project?

Running Red is a webcomic platform for an artist named Ren (he/him). It has two parts:
1. A **Next.js frontend** (Vercel) where readers browse the comic
2. A **Payload CMS** (Railway) where Ren manages content — he never touches code

## Documentation

**Read these docs before making any changes:**

- `docs/ARCHITECTURE.md` — System design, tech stack, deployment topology
- `docs/PRODUCT_SPEC.md` — Pages, features, content model, user flows
- `docs/CONVENTIONS.md` — Code style, naming, file structure, git workflow
- `docs/TASKS.md` — Implementation plan with task status

## Key Commands

```bash
# Install dependencies
pnpm install

# Run all apps in dev mode
pnpm dev

# Run only the web app
pnpm --filter web dev

# Run only the CMS
pnpm --filter cms dev

# Build all
pnpm build

# Type check
pnpm typecheck

# Lint
pnpm lint

# Run tests
pnpm test
```

## Tech Stack

- **Monorepo:** Turborepo + pnpm
- **Frontend:** Next.js 15 (App Router), Tailwind CSS, TypeScript
- **CMS:** Payload CMS 3.x, PostgreSQL, Cloudflare R2
- **Shared:** `packages/shared` for types and utilities

## Conventions

- TypeScript strict mode everywhere
- React server components by default; `"use client"` only when needed
- Tailwind for styling, mobile-first responsive design
- No `any` types, no `enum` (use `as const` or union types)
- Conventional commits: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`
- **Every phase of work must end with docs updated**

## Architecture Basics

```
Reader → Next.js (Vercel) → Payload API (Railway) → PostgreSQL (Railway)
                                    ↓
                            Cloudflare R2 (images)
```

- Comic pages are fetched from Payload's REST API
- Images stored in R2, served via Cloudflare CDN
- Next.js uses ISR for comic pages (static generation with revalidation)

## Things to Know

- Ren does NOT have access to this repo. He uses only the CMS admin UI.
- The comic updates on Mondays.
- Content warnings are a first-class feature — some pages are blurred until the reader confirms.
- Image pipeline: upload PNG → Sharp generates WebP variants + blur placeholder → stored in R2.
- No formal staging environment. Vercel preview deployments serve that purpose.
