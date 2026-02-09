# Running Red

A webcomic platform by Ren.

## Structure

| Directory | App | Description |
|-----------|-----|-------------|
| `apps/web` | Reader site | Next.js 15, Tailwind CSS — deployed on Vercel |
| `apps/cms` | Admin panel | Payload CMS 3.x — deployed on Railway |
| `packages/shared` | Shared types | TypeScript types used by both apps |

## Getting Started

```bash
# Install dependencies
pnpm install

# Copy environment files
cp apps/web/.env.example apps/web/.env.local
cp apps/cms/.env.example apps/cms/.env.local

# Run both apps in dev mode
pnpm dev

# Or run individually
pnpm --filter web dev    # http://localhost:3000
pnpm --filter cms dev    # http://localhost:3001
```

The CMS requires a PostgreSQL database. Set `DATABASE_URL` in `apps/cms/.env.local`.

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in development mode |
| `pnpm build` | Build all apps |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm lint` | Run ESLint |
| `pnpm test` | Run tests |

## Branching

- `main` — production (`running.red`)
- `develop` — staging / integration
- Feature branches → PR into `develop`
- `develop` → `main` for production releases

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Product Spec](docs/PRODUCT_SPEC.md)
- [Conventions](docs/CONVENTIONS.md)
- [Tasks](docs/TASKS.md)
