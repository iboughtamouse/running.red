# Architecture

> Last updated: 2026-02-09

## System Overview

Running Red is a webcomic platform consisting of two applications:

1. **Web** (`apps/web`) — A Next.js frontend where readers browse the comic
2. **CMS** (`apps/cms`) — A Payload CMS instance where the author manages content

Both apps share types and utilities via a `packages/shared` workspace package.

```
┌─────────────┐       ┌──────────────┐       ┌──────────────┐
│             │       │              │       │              │
│  Reader     │◄──────│  Next.js     │◄──────│  Payload CMS │
│  (Browser)  │       │  (Vercel)    │       │  (Railway)   │
│             │       │              │       │              │
└─────────────┘       └──────┬───────┘       └──────┬───────┘
                             │                      │
                             │                      │
                      ┌──────▼───────┐       ┌──────▼───────┐
                      │              │       │              │
                      │  Cloudflare  │       │  PostgreSQL  │
                      │  R2 (Images) │       │  (Railway)   │
                      │              │       │              │
                      └──────────────┘       └──────────────┘
```

## Tech Stack

| Component        | Technology          | Hosting      | Purpose                          |
|------------------|---------------------|--------------|----------------------------------|
| Frontend         | Next.js 15 (App Router) | Vercel   | Comic reader, public pages       |
| CMS              | Payload CMS 3.x    | Railway      | Content management, admin UI     |
| Database         | PostgreSQL          | Railway      | Content storage                  |
| Image Storage    | Cloudflare R2       | Cloudflare   | Comic page images, media         |
| Image Processing | Sharp (via Payload) | Railway      | Resize, convert, optimize images |
| Monorepo         | Turborepo + pnpm    | —            | Build orchestration              |
| Language         | TypeScript (strict) | —            | Everything                       |

## Monorepo Structure

```
running.red/
├── apps/
│   ├── web/                 # Next.js frontend
│   │   ├── app/             # App Router pages
│   │   ├── components/      # React components
│   │   ├── lib/             # Utilities, API clients
│   │   └── public/          # Static assets (favicon, etc.)
│   └── cms/                 # Payload CMS
│       ├── collections/     # Content model definitions
│       ├── globals/         # Singleton content (site settings)
│       └── payload.config.ts
├── packages/
│   └── shared/              # Shared TypeScript types, utilities
│       ├── types/           # Content type definitions
│       └── utils/           # Shared helper functions
├── docs/                    # Project documentation
├── CLAUDE.md                # AI agent context file
├── turbo.json               # Turborepo config
├── pnpm-workspace.yaml      # pnpm workspace config
└── package.json             # Root package.json
```

## Deployment

### Environments

| Environment | Branch     | Web URL                        | CMS URL                        |
|-------------|------------|--------------------------------|--------------------------------|
| Production  | `main`     | `running.red`                  | `admin.running.red`            |
| Staging     | `develop`  | Vercel preview for `develop`   | Single CMS instance (shared)   |
| Preview     | PR branches | `*.vercel.app` (auto)         | —                              |

- **Vercel** auto-deploys the `web` app. PRs and `develop` get preview URLs. `main` deploys to production.
- **Railway** hosts the CMS and PostgreSQL. Deploys from `main`.
- The `develop` branch serves as the integration/staging branch. All PRs target `develop`. Once tested, `develop` is merged into `main` for production release.

### DNS (Namecheap)

- `running.red` — A/CNAME to Vercel
- `admin.running.red` — CNAME to Railway

### Environment Variables

Managed per-platform (Vercel dashboard, Railway dashboard). Never committed to the repo.

Required secrets:
- `DATABASE_URL` — PostgreSQL connection string (CMS)
- `PAYLOAD_SECRET` — Payload encryption key (CMS)
- `R2_ACCESS_KEY_ID` — Cloudflare R2 credentials (CMS)
- `R2_SECRET_ACCESS_KEY` — Cloudflare R2 credentials (CMS)
- `R2_BUCKET` — R2 bucket name (CMS)
- `R2_ENDPOINT` — R2 endpoint URL (CMS)
- `NEXT_PUBLIC_CMS_URL` — Payload API URL (Web)

## Image Pipeline

1. Author uploads original image (PNG/PSD) via Payload admin UI
2. Payload processes via Sharp, generating:
   - Original stored in R2 (archival)
   - Full-resolution WebP (desktop display)
   - Reduced-width WebP (mobile display)
   - Low-quality blur placeholder (LQIP for loading states)
3. Frontend uses `<picture>` elements with responsive `srcset`
4. R2 serves images via Cloudflare CDN (zero egress cost)

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| CMS | Payload (self-hosted) | Full control, no per-seat cost, TypeScript-native, admin UI out of the box |
| Image storage | Cloudflare R2 | S3-compatible, zero egress fees, built-in CDN |
| Image format | WebP (primary) | ~30% smaller than JPEG at equivalent quality, universal browser support |
| Monorepo tool | Turborepo | Simple config, good caching, works well with Vercel |
| Package manager | pnpm | Fast, disk-efficient, good workspace support |
| Frontend framework | Next.js 15 App Router | SSG/ISR for comic pages, good Vercel integration |
| Database | PostgreSQL | Reliable, Payload's recommended DB for production |
