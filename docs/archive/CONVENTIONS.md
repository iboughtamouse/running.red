# Conventions

> Last updated: 2026-02-09

## General Principles

1. **Simplicity over cleverness.** This is a webcomic site, not a SaaS platform. Prefer straightforward solutions.
2. **Don't over-abstract.** Three similar lines of code is better than a premature abstraction.
3. **TypeScript strict mode everywhere.** No `any` types unless truly unavoidable (and then with a comment explaining why).
4. **Documentation stays current.** No phase is complete until docs in `docs/` reflect the changes.

## Project Structure

### File Naming

- **React components:** PascalCase — `ComicPage.tsx`, `NavButton.tsx`
- **Utilities, hooks, libs:** camelCase — `getComicPage.ts`, `useKeyboardNav.ts`
- **Route files (Next.js App Router):** lowercase as required — `page.tsx`, `layout.tsx`, `loading.tsx`
- **CMS collections:** PascalCase files, camelCase slugs — `ComicPages.ts` defines `comic-pages`
- **Config files:** standard names — `turbo.json`, `tsconfig.json`, `.env.example`

### Directory Conventions

```
apps/web/
├── app/                    # Next.js App Router (routes only)
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home (latest comic page)
│   ├── comic/[slug]/
│   │   └── page.tsx        # Individual comic page
│   ├── about/
│   │   └── page.tsx
│   ├── archive/
│   │   └── page.tsx
│   ├── links/
│   │   └── page.tsx
│   └── rss.xml/
│       └── route.ts        # RSS route handler
├── components/             # React components
│   ├── comic/              # Comic-specific components
│   ├── layout/             # Header, footer, nav
│   └── ui/                 # Generic UI primitives
├── lib/                    # Utilities, API clients, helpers
│   ├── api.ts              # CMS API client
│   └── utils.ts            # Generic utilities
└── styles/                 # Global styles
```

### Imports

- Use path aliases: `@/components/...`, `@/lib/...`
- Group imports: external packages, then internal modules, then relative imports
- No barrel exports (`index.ts` re-exports) unless a directory has 5+ exports

## Code Style

### TypeScript

- Strict mode enabled (`"strict": true` in tsconfig)
- Prefer `interface` for object shapes, `type` for unions/intersections
- Use `const` by default, `let` only when reassignment is needed
- No `enum` — use `as const` objects or union types instead
- Explicit return types on exported functions; inferred return types on internal functions

### React

- Function components only (no class components)
- Prefer server components (Next.js App Router default); use `"use client"` only when needed
- Props interfaces named `{ComponentName}Props`
- Destructure props in function signature
- Co-locate component-specific types with the component file

### CSS / Styling

- **Tailwind CSS** for styling
- Use semantic class grouping: layout, then typography, then visual (colors, borders)
- Extract repeated patterns into components, not utility classes
- Responsive design: mobile-first (`sm:`, `md:`, `lg:` breakpoints)

### Error Handling

- Let errors bubble naturally; don't catch-and-swallow
- Use Next.js `error.tsx` boundaries at route level
- Log errors server-side; show friendly messages client-side
- Validate at system boundaries only (API responses, CMS data)

## Git

### Branches

- `main` — production, always deployable
- `develop` — integration/staging branch, all PRs target this
- `claude/*` — AI-driven development branches
- Feature branches merge into `develop` via PR
- `develop` merges into `main` only after staging validation

### Merge Rules

- **Never push directly to `main` or `develop`.** All changes go through PRs.
- PRs always target `develop` unless explicitly told otherwise.
- `develop` → `main` merges require explicit owner approval.

### Commits

- Conventional commit style: `type: description`
- Types: `feat`, `fix`, `docs`, `chore`, `refactor`, `style`, `test`
- Keep commits focused — one logical change per commit
- Write messages in imperative mood: "add archive page" not "added archive page"

### Pull Requests

- Describe what changed and why
- Reference relevant docs if a decision was made
- PRs should be reviewable in under 15 minutes (keep them small)

## CMS (Payload)

### Collections

- One file per collection in `apps/cms/collections/`
- Collection slugs use kebab-case: `comic-pages`, not `comicPages`
- Field names use camelCase: `pageNumber`, `publishDate`
- Always define TypeScript types that mirror collection schemas in `packages/shared`

### Globals

- One file per global in `apps/cms/globals/`
- Globals for singleton content: site settings, about page, links page

## Testing

- **Vitest** for unit tests
- **Playwright** for E2E tests (if/when needed)
- Test files co-located with source: `ComicNav.test.tsx` next to `ComicNav.tsx`
- Test behavior, not implementation
- No minimum coverage target — test what matters (navigation logic, content warnings, API parsing)

## Documentation Maintenance

Every phase must end with these docs reviewed and updated:

| Doc | Update when... |
|-----|---------------|
| `ARCHITECTURE.md` | Tech stack, infra, or system design changes |
| `PRODUCT_SPEC.md` | Features added, modified, or descoped |
| `CONVENTIONS.md` | New patterns established or old ones revised |
| `TASKS.md` | Tasks completed, added, or reprioritized |
| `CLAUDE.md` | Anything an AI agent needs to know on startup changes |
