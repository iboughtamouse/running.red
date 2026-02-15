# Conventions

**Last updated:** 2026-02-15

---

## Overview

This document defines code style, file organization, naming conventions, and development workflow for the Running Red project.

**Guiding Principle:** Consistency beats personal preference. Follow these conventions even if you disagree with specific choices.

**Tooling Enforcement:** Many code style rules (import order, TypeScript strict mode, no `any` types, etc.) are enforced by ESLint, Prettier, and TypeScript configs. This document focuses on patterns and decisions that can't be automated.

---

## General Principles

1. **Simplicity over cleverness** — This is a webcomic site, not a SaaS platform. Prefer straightforward solutions.
2. **Don't over-abstract** — Three similar lines of code is better than a premature abstraction.
3. **Documentation stays current** — No phase is complete until docs in `docs/` reflect the changes.
4. **Be explicit** — Implicit behavior is hard to debug. Prefer explicit, verbose code over clever shortcuts.

---

## TypeScript

### Interfaces vs Types

- **Use `interface`** for object shapes
- **Use `type`** for unions, intersections, and primitives

```typescript
// Interface for object shape
interface ComicPage {
  id: number;
  title: string | null;
  status: Status;
}

// Type for union
type Status = 'draft' | 'published';

// Type for intersection
type ComicPageWithAuthor = ComicPage & { authorName: string };
```

---

### Null vs Undefined

- **Use `null`** for database values that can be absent (maps to SQL NULL)
- **Use `undefined`** for optional function parameters or missing object properties

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

### React Components

**PascalCase** for component files.

```
components/
  ComicPage.tsx
  NavButton.tsx
  ContentWarning.tsx
```

---

### Utilities, Hooks, Libs

**camelCase** for non-component files.

```
lib/
  getComicPage.ts
  formatDate.ts
  useKeyboardNav.ts  # Hooks start with "use"
  db.ts              # Database client
```

---

### Next.js App Router

**Lowercase** as required by Next.js.

```
app/
  page.tsx           # Home page
  layout.tsx         # Root layout
  loading.tsx        # Loading state
  error.tsx          # Error boundary
  comic/
    [slug]/
      page.tsx       # Dynamic route
```

---

### Database & Config Files

**Standard names** for config files.

```
tsconfig.json
package.json
.env.local
.gitignore
```

---

## Directory Structure

```
running-red/
  docs/                         # Documentation (you are here)
  public/                       # Static assets
    favicon.ico
    robots.txt
  src/                          # Source code
    app/                        # Next.js App Router
      (public)/                 # Public routes (grouped for organization)
        page.tsx                # Home page
        comic/
          [slug]/
            page.tsx            # Comic page
        about/
          page.tsx              # About page
        archive/
          page.tsx              # Archive page
        links/
          page.tsx              # Links page
        rss.xml/
          route.ts              # RSS feed
      admin/                    # Admin routes (protected)
        layout.tsx              # Admin layout with auth wrapper
        page.tsx                # Admin dashboard
        comics/
          page.tsx              # List comics
          new/
            page.tsx            # Add new comic
          [id]/
            page.tsx            # Edit comic
        about/
          page.tsx              # Edit About page
        links/
          page.tsx              # Edit Links page
        settings/
          page.tsx              # Edit site settings
      api/                      # API routes
        admin/
          upload-image/
            route.ts            # Image upload endpoint
        revalidate/
          route.ts              # Trigger ISR revalidation
      layout.tsx                # Root layout
      globals.css               # Global styles
    components/                 # React components
      admin/                    # Admin-specific components
        ComicForm.tsx
        ImageUpload.tsx
      public/                   # Public-facing components
        ComicImage.tsx
        NavBar.tsx
        ContentWarning.tsx
      ui/                       # Generic UI components
        Button.tsx
        Input.tsx
    lib/                        # Utilities, helpers, clients
      db.ts                     # Database client
      r2.ts                     # R2 upload utilities
      image.ts                  # Sharp image processing
      auth.ts                   # Auth utilities
      types.ts                  # TypeScript types
      utils.ts                  # Generic utilities
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

Use `@/` path alias for imports from `src/` (configured in `tsconfig.json`).

```typescript
// Good
import { ComicPage } from '@/components/ComicPage';
import { db } from '@/lib/db';

// Avoid deep relative paths
import { ComicPage } from '../../../components/ComicPage';
```

**Note:** Import order (external → internal → relative → types) is enforced by ESLint.

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

---

### Server vs Client Components

- **Prefer Server Components** (Next.js App Router default)
- **Use `"use client"`** only when needed

**When to use `"use client"`:**
- Component uses `useState`, `useEffect`, or other React hooks
- Component uses browser APIs (localStorage, window, etc.)
- Component has event handlers (`onClick`, `onSubmit`, etc.)

```typescript
// Server Component (default, no directive)
export function ComicPage({ page }: ComicPageProps) {
  return <div>{page.title}</div>;
}

// Client Component (needs interactivity)
"use client";
export function LikeButton() {
  const [likes, setLikes] = useState(0);
  return <button onClick={() => setLikes(likes + 1)}>{likes} likes</button>;
}
```

---

## CSS / Styling

### Mobile-First Approach

Use mobile-first responsive design. Base styles are for mobile, then add breakpoints (`sm:`, `md:`, `lg:`).

```tsx
<div className="w-full px-4 sm:px-6 md:w-3/4 md:px-8 lg:w-1/2">
  {/* Mobile: full width, 1rem padding */}
  {/* Tablet: 75% width, 1.5rem padding */}
  {/* Desktop: 50% width, 2rem padding */}
</div>
```

---

### Extract Repeated Patterns

If the same Tailwind classes appear multiple times, extract them into a reusable component.

```tsx
// components/ui/Button.tsx
export function Button({ children, ...props }: ButtonProps) {
  return (
    <button className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600" {...props}>
      {children}
    </button>
  );
}

// Usage
<Button>Save</Button>
<Button>Cancel</Button>
```

**Note:** Tailwind class order is enforced by Prettier with the Tailwind plugin.

---

## Database

### Naming Conventions

- **Tables:** `snake_case` (e.g., `comic_pages`, `site_settings`)
- **Columns:** `snake_case` (e.g., `page_number`, `created_at`)
- **Indexes:** `idx_{table}_{column}` (e.g., `idx_comic_pages_status`)

**Why snake_case?** PostgreSQL convention, avoids quoting issues.

---

### Always Use Parameterized Queries

Never use string concatenation in SQL queries (SQL injection risk).

```typescript
// Good
const page = await db.query(
  'SELECT * FROM comic_pages WHERE slug = $1',
  [slug]
);

// NEVER do this
const page = await db.query(`SELECT * FROM comic_pages WHERE slug = '${slug}'`);
```

---

## Git

### Branches

- `main` — Production (deployed to running.red)
- `develop` — Staging/integration (all PRs target this)
- Feature branches — `feature/{name}` or `fix/{name}` or just descriptive names

**Workflow:**
1. Create feature branch from `develop`
2. Make changes, commit
3. Open PR to `develop`
4. Review, merge
5. `develop` → `main` for production release (after testing)

---

### Commit Messages

Use **Conventional Commits** style.

**Format:** `type: description`

**Types:**
- `feat` — New feature
- `fix` — Bug fix
- `docs` — Documentation changes
- `chore` — Maintenance (deps, config, etc.)
- `refactor` — Code changes that don't add features or fix bugs
- `style` — Formatting, whitespace (not CSS)
- `test` — Adding or updating tests

**Good:**
```
feat: add content warning overlay to comic pages
fix: prevent navigation to unpublished pages
docs: update ARCHITECTURE.md with ISR details
chore: update Next.js to 15.2
refactor: extract image processing to lib/image.ts
```

**Bad:**
```
updated stuff
fixed a bug
WIP
more changes
```

---

### Merge Rules

- **Never push directly to `main` or `develop`**
- All changes go through PRs
- PRs must pass CI (typecheck, lint, build) before merging
- `develop` → `main` merges require explicit approval

---

## Error Handling

### Let Errors Bubble

Don't catch-and-swallow errors. Let them propagate to error boundaries.

**Good:**
```typescript
// Let error bubble to error.tsx boundary
export async function getComicPage(slug: string) {
  const result = await db.query('SELECT * FROM comic_pages WHERE slug = $1', [slug]);
  if (!result.rows[0]) {
    throw new Error('Page not found');
  }
  return result.rows[0];
}
```

**Bad:**
```typescript
// Don't swallow errors
export async function getComicPage(slug: string) {
  try {
    const result = await db.query('SELECT * FROM comic_pages WHERE slug = $1', [slug]);
    return result.rows[0];
  } catch (err) {
    console.error(err); // User sees nothing!
    return null;
  }
}
```

---

### Error Boundaries

Use Next.js `error.tsx` files at route level.

```
app/
  comic/
    [slug]/
      page.tsx
      error.tsx  # Catches errors in page.tsx
```

**error.tsx:**
```tsx
'use client'; // Error boundaries must be client components

export default function Error({ error }: { error: Error }) {
  return (
    <div>
      <h1>Something went wrong</h1>
      <p>{error.message}</p>
    </div>
  );
}
```

---

## Comments

### When to Comment

- **Complex logic** — If it's not obvious, explain why
- **Workarounds** — Explain why the workaround is necessary
- **TODOs** — Mark incomplete work with `// TODO: description`
- **Type overrides** — If you use `any`, explain why

**Don't comment:**
- Obvious code (the code itself is documentation)
- Every function (use TypeScript types instead)

**Good:**
```typescript
// Sharp requires the original image to generate blur hash
// We can't delete the original from R2 until processing is done
const blurHash = await generateBlurHash(originalBuffer);
```

**Bad:**
```typescript
// Get the comic page
const page = await getComicPage(slug); // Don't comment obvious code
```

---

## Documentation

### When to Update Docs

Update `docs/` when:
- Adding a feature → Update `PRODUCT.md`, `CONTENT_MODEL.md` (if data changes), `IMPLEMENTATION.md`
- Changing architecture → Update `ARCHITECTURE.md`, `DECISIONS.md`
- Changing tech → Update `TECH_STACK.md`, `DECISIONS.md`
- Establishing patterns → Update `CONVENTIONS.md`
- Completing tasks → Update `IMPLEMENTATION.md`

**Every significant change should result in updated documentation.**

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
