# Running Red

A webcomic platform by Ren.

**Status:** 🚧 In development (Phase 0: Documentation complete)

---

## 📚 Documentation

All project documentation lives in the [`docs/`](docs/) directory.

**Start here:**
- **[docs/README.md](docs/README.md)** — Documentation index and navigation guide
- **[docs/OVERVIEW.md](docs/OVERVIEW.md)** — What is Running Red? High-level goals and context.

**Quick Links:**
- [Architecture](docs/ARCHITECTURE.md) — Technical design
- [Product Requirements](docs/PRODUCT.md) — Features and user needs
- [Content Model](docs/CONTENT_MODEL.md) — Database schema
- [Implementation Plan](docs/IMPLEMENTATION.md) — Roadmap and phases

---

## 🛠️ Development

*(Will be updated when Phase 1 begins)*

### Prerequisites

- Node.js 22+ (see `.nvmrc` when added)
- npm (package manager)
- PostgreSQL database (Vercel Postgres, Railway, or Supabase)
- Cloudflare R2 bucket (for image storage)

### Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev
```

### Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |

---

## 🌐 Deployment

*(Will be updated when deployment is configured)*

- **Production:** `running.red` (Vercel)
- **Preview:** Automatic preview URLs for PRs

---

## 📂 Project Structure

```
running-red/
  docs/                 # Documentation (start here!)
  src/                  # Source code (Phase 1+)
    app/                # Next.js App Router
    components/         # React components
    lib/                # Utilities, database, R2 client
  public/               # Static assets
  README.md             # This file
  package.json          # Dependencies and scripts
```

---

## 🤝 Contributing

This is a personal project for Ren's webcomic. Not open for external contributions at this time.

---

## 📄 License

All rights reserved. The code and content of this project are not open source.

---

## 🔗 Links

- **Live Site:** (Coming soon)
- **Admin Panel:** (Coming soon)
- **Documentation:** [docs/README.md](docs/README.md)
