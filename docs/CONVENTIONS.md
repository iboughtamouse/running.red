# Conventions

**Last updated:** 2026-02-15

---

## Overview

This document defines code style, file organization, naming conventions, and development workflow for the Running Red project.

**Guiding Principle:** Consistency beats personal preference. Follow these conventions even if you disagree with specific choices.

---

## What's Enforced by Tooling

These conventions are automatically enforced — violations will fail the build, lint, or commit hooks.

| Convention | Enforced by | Config file |
|---|---|---|
| TypeScript strict mode (no `any`, strict null checks) | TypeScript | `tsconfig.json` |
| Extra strictness (`noUncheckedIndexedAccess`, `noImplicitReturns`, `noFallthroughCasesInSwitch`) | TypeScript | `tsconfig.json` |
| `interface` for object shapes (not `type`) | ESLint | `eslint.config.mjs` |
| No `console.log` (use `console.warn`/`console.error` if needed) | ESLint | `eslint.config.mjs` |
| No deep relative imports (`../../*`) — use `@/` alias | ESLint | `eslint.config.mjs` |
| Next.js best practices + Core Web Vitals | ESLint | `eslint-config-next` |
| TypeScript-specific lint rules | ESLint | `eslint-config-next/typescript` |
| Code formatting (semicolons, double quotes, trailing commas) | Prettier | `.prettierrc.json` |
| Tailwind class order | Prettier | `prettier-plugin-tailwindcss` |
| Conventional commit messages (`feat:`, `fix:`, `docs:`, etc.) | commitlint | `commitlint.config.mjs` |
| Pre-commit lint + typecheck | Husky | `.husky/pre-commit` |

**You don't need to memorize these.** If you violate a rule, the tooling will tell you.

---

## General Principles

These are judgment calls that can't be automated:

1. **Simplicity over cleverness** — This is a webcomic site, not a SaaS platform. Prefer straightforward solutions.
2. **Don't over-abstract** — Three similar lines of code is better than a premature abstraction.
3. **Documentation stays current** — No phase is complete until docs in `docs/` reflect the changes.
4. **Be explicit** — Implicit behavior is hard to debug. Prefer explicit, verbose code over clever shortcuts.

---

## TypeScript

### `interface` vs `type`

**`interface` for object shapes** (enforced by ESLint), **`type` for unions and intersections** (by convention):

```typescript
// Object shape → interface
interface ComicPage {
  id: number;
  title: string | null;
  status: Status;
}

// Union → type
type Status = "draft" | "published";
```

### Null vs Undefined

- **`null`** for database values that can be absent (maps to SQL NULL)
- **`undefined`** for optional function parameters or missing object properties

```typescript
interface ComicPage {
  title: string | null; // Database field, can be NULL
}

function renderPage(options?: { showTitle: boolean }) {
  const showTitle = options?.showTitle ?? true; // undefined if not provided
}
```

---

## File Naming

| Type | Casing | Example |
|---|---|---|
| React components | kebab-case | `edit-comic-form.tsx`, `about-form.tsx` |
| Utilities, hooks, libs | camelCase | `formatDate.ts`, `useKeyboardNav.ts`, `db.ts` |
| Next.js App Router files | lowercase (required by Next.js) | `page.tsx`, `layout.tsx`, `error.tsx` |
| Config files | standard names | `tsconfig.json`, `package.json`, `.env.local` |

---

## Directory Structure

```
running-red/
  docs/                         # Documentation (you are here)
  public/                       # Static assets
    favicon.ico
    robots.txt
  src/                          # Source code
    proxy.ts                    # Auth proxy (protects /admin/* routes)
    app/                        # Next.js App Router
      layout.tsx                # Root layout
      page.tsx                  # Home page (will move to (public)/ in Phase 3)
      globals.css               # Global styles + Tailwind
      admin/                    # Admin routes (protected by proxy.ts)
        layout.tsx              # Admin layout (nav, header, logout)
        page.tsx                # Admin dashboard
        loading.tsx             # Loading indicator for admin navigation
        login/
          page.tsx              # Login form
        comics/
          page.tsx              # List comics
          new/
            page.tsx            # Add new comic
          [slug]/
            page.tsx            # Edit comic (server component → EditComicForm)
        about/
          page.tsx              # Edit About page (server component → AboutForm)
        links/
          page.tsx              # Edit Links page (server component → LinksForm)
        settings/
          page.tsx              # Edit Site Settings (server component → SettingsForm)
      api/                      # API routes
        admin/
          auth/
            route.ts            # Login/logout endpoints
          comics/
            route.ts            # POST create comic (with FormData image)
            [id]/
              route.ts          # PUT update / DELETE comic
          about/
            route.ts            # GET/PUT about page
          links/
            route.ts            # GET/PUT links page
          settings/
            route.ts            # GET/PUT site settings
        comics/
          route.ts              # GET public comics (published only)
        images/
          [...key]/
            route.ts            # R2 image proxy (streams images to browser)
    components/                 # React components
      admin/                    # Admin-specific client components
        about-form.tsx          # About page form
        edit-comic-form.tsx     # Comic edit form
        links-form.tsx          # Links page form
        settings-form.tsx       # Settings page form
      public/                   # Public-facing components (Phase 3)
      ui/                       # Generic UI components (Phase 4)
    db/                         # Database files
      schema.sql                # Full schema migration
      seed.sql                  # Default data seed
    lib/                        # Utilities, helpers, clients
      auth.ts                   # HMAC session auth utilities
      db.ts                     # PostgreSQL client (pg Pool)
      image.ts                  # Sharp image processing
      r2.ts                     # R2 upload/download utilities
      types.ts                  # TypeScript types
  .env.local                    # Environment variables (not committed)
  .env.example                  # Example env file (committed)
  .gitignore
  next.config.ts
  tsconfig.json
  package.json
  README.md
```

---

## Imports

Use `@/` path alias for imports from `src/` (configured in `tsconfig.json`, enforced by ESLint).

```typescript
// Good
import { ComicPage } from "@/components/ComicPage";
import { db } from "@/lib/db";

// Will fail lint (deep relative path)
import { ComicPage } from "../../../components/ComicPage";
```

---

## React

### Props Interfaces

Name props interfaces `{ComponentName}Props` and destructure props in the function signature.

```typescript
interface ComicPageProps {
  page: ComicPage;
  showTitle?: boolean;
}

export function ComicPage({ page, showTitle = true }: ComicPageProps) {
  return <div>{page.title}</div>;
}
```

### Server vs Client Components

- **Prefer Server Components** (Next.js App Router default)
- **Use `"use client"` only when needed:**
  - Component uses `useState`, `useEffect`, or other React hooks
  - Component uses browser APIs (localStorage, window, etc.)
  - Component has event handlers (`onClick`, `onSubmit`, etc.)

---

## CSS / Styling

### Mobile-First Approach

Base styles are for mobile, then add breakpoints (`sm:`, `md:`, `lg:`).

```tsx
<div className="w-full px-4 sm:px-6 md:w-3/4 md:px-8 lg:w-1/2">
  {/* Mobile: full width → Tablet: 75% → Desktop: 50% */}
</div>
```

### Extract Repeated Patterns

If the same Tailwind classes appear 3+ times, extract into a reusable component.

---

## Database

### Naming Conventions

- **Tables:** `snake_case` (e.g., `comic_pages`, `site_settings`)
- **Columns:** `snake_case` (e.g., `page_number`, `created_at`)
- **Indexes:** `idx_{table}_{column}` (e.g., `idx_comic_pages_status`)

### Always Use Parameterized Queries

```typescript
// Good
const page = await db.query(
  "SELECT * FROM comic_pages WHERE slug = $1",
  [slug],
);

// NEVER do this (SQL injection risk)
const page = await db.query(
  `SELECT * FROM comic_pages WHERE slug = '${slug}'`,
);
```

---

## Git

### Branches

- `main` — Production (deployed to running.red)
- `develop` — Staging/integration (all PRs target this)
- Feature branches — `feature/{name}` or `fix/{name}` or descriptive names

### Workflow

1. Create feature branch from `develop`
2. Make changes, commit (conventional commits enforced by commitlint)
3. Open PR to `develop`
4. Review, merge
5. `develop` → `main` for production release (after testing)

### Commit Messages

Enforced by commitlint. Format: `type: description`

| Type | Use for |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `chore` | Maintenance (deps, config, etc.) |
| `refactor` | Code changes that don't add features or fix bugs |
| `style` | Formatting, whitespace (not CSS) |
| `test` | Adding or updating tests |

### Merge Rules

- **Never push directly to `main` or `develop`**
- All changes go through PRs
- PRs must pass CI (typecheck, lint, build) before merging

---

## Error Handling

### Let Errors Bubble

Don't catch-and-swallow errors. Let them propagate to error boundaries.

```typescript
// Good — let error bubble to error.tsx boundary
export async function getComicPage(slug: string) {
  const result = await db.query(
    "SELECT * FROM comic_pages WHERE slug = $1",
    [slug],
  );
  if (!result.rows[0]) {
    throw new Error("Page not found");
  }
  return result.rows[0];
}
```

### Error Boundaries

Use Next.js `error.tsx` files at route level.

---

## Comments

- **Do comment:** Complex logic, workarounds, TODOs
- **Don't comment:** Obvious code — use TypeScript types as documentation instead

---

## Documentation

Update `docs/` when:
- Adding a feature → `PRODUCT.md`, `CONTENT_MODEL.md`, `IMPLEMENTATION.md`
- Changing architecture → `ARCHITECTURE.md`, `DECISIONS.md`
- Changing tech → `TECH_STACK.md`, `DECISIONS.md`
- Establishing patterns → `CONVENTIONS.md`
- Completing tasks → `IMPLEMENTATION.md`

---

## Testing

*(Testing conventions will be added when tests are written)*

Planned:
- **Vitest** for unit tests
- **Playwright** for E2E tests (if needed)
- Test files co-located with source: `ComicPage.test.tsx` next to `ComicPage.tsx`

---

## Related Docs

- **[TECH_STACK.md](TECH_STACK.md)** — Technologies used
- **[ARCHITECTURE.md](ARCHITECTURE.md)** — System design
- **[IMPLEMENTATION.md](IMPLEMENTATION.md)** — Development roadmap
