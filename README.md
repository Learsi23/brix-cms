# Brix CMS

**The open-source, self-hosted block-based CMS.**  
Build pages visually with blocks. Headless REST API. Zero lock-in. Deploy anywhere.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-6-teal)](https://prisma.io)

---

## What is Brix?

Brix is a self-hosted CMS with a **visual block-based page builder** and a clean **headless REST API**. Think of it as a lightweight Payload CMS focused on page building — every page is a stack of typed blocks that you drag, drop, and configure.

No vendor lock-in. Your data, your server, your rules.

---

## Quick Start

```bash
git clone https://github.com/Learsi23/brix-cms
cd brix-cms
cp .env.example .env
npm install
npm run setup     # prisma db push + seed
npm run dev
```

Open [http://localhost:3000/admin](http://localhost:3000/admin)  
Default login: `admin@brix.com` / `admin123`

---

## Features

### Visual Block Editor
- **38 pre-built blocks** — Hero, Pricing, Testimonials, Team, Accordion, Tabs, Gallery, Map, Countdown, and more
- **Drag-and-drop reordering** via [@dnd-kit](https://dndkit.com)
- **Nested layouts** — columns and grids hold child blocks
- **Live preview** — see the page as you build it

### Headless REST API
Every page and block is accessible via REST. Use Brix as a backend for any frontend.

```http
GET  /api/pages          → list published pages
GET  /api/pages/:id      → page with all blocks
POST /api/pages          → create page
PUT  /api/blocks/:id     → update block
```

Works with Next.js, Astro, SvelteKit, React Native, or any HTTP client.

### Pages & Publishing
- Create, edit and publish pages with a slug-based URL system
- SEO fields: meta description, OG image
- Page types support (`standard`, `product`, custom)
- Auto-generated `sitemap.xml`

### Media Library
- Upload images, documents and files
- Folder-based organization
- Browse and pick media directly inside the block editor

### Authentication & Security
- Email/password login with HttpOnly session cookie `brix_auth` (7-day expiry)
- 2FA (TOTP) — schema ready, UI in progress
- Role-based access (admin)

### Backup & Restore
- Export full JSON database backup from the admin panel
- Restore from a backup file

---

## 38 Block Types

| Category | Blocks |
|----------|--------|
| **Heroes** | HeroBlock |
| **Content** | TextBlock, ImageBlock, VideoBlock, MarkdownBlock, FlexibleImageTextBlock |
| **Layout** | ColumnBlock, GridColumnBlock, IconColumnBlock, CardBlock, BannerBlock, SpacerBlock, DividerBlock |
| **Interactive** | AccordionBlock, AccordionItemBlock, TabsBlock, TabItemBlock, DropdownBlock, CountdownBlock, ContactFormBlock |
| **Media** | GalleryBlock, MapBlock, LogoStripBlock |
| **Social Proof** | StatsBlock, TestimonialsBlock, TestimonialItemBlock, TeamBlock, TeamMemberBlock, SocialProofBlock, TimelineBlock, TimelineItemBlock |
| **Pricing** | PricingBlock, PricingCardBlock |
| **CTAs** | CTABannerBlock, TextWithButtonBlock, ButtonLinkBlock, EmailButtonBlock |

> Need a new block? See [BLOCKS-MANUAL.md](BLOCKS-MANUAL.md) — adding a block = 1 definition file + 1 renderer component.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Database | SQLite (dev) → PostgreSQL / MySQL (prod) via Prisma |
| ORM | Prisma 6 |
| Styling | Tailwind CSS (no UI library — full control) |
| Drag-Drop | @dnd-kit |
| Validation | Zod |

---

## Architecture

```
src/
  app/(admin)/           → Protected admin UI
  app/(public)/          → Public-facing SSR pages
  app/api/               → REST API (pages, blocks, media, auth, backup, config, upload)
  components/blocks/     → 38 block renderers (.tsx)
  lib/blocks/            → Block registry + 38 type definitions
  lib/db.ts              → Prisma client singleton
prisma/
  schema.prisma          → Page, Block, SiteConfig, User, Media models
  seed.ts                → Default admin user + demo page
```

**Block registry pattern** — each block is self-describing. A block definition declares its type, label, fields, and defaults. The editor and renderer both use the same definition — no duplication.

---

## Deployment

### Vercel (recommended for Next.js)
```bash
vercel deploy
```
Use PostgreSQL (Neon, Supabase) instead of SQLite in production. Set `DATABASE_URL` in the Vercel dashboard.

### Any Node.js host (Railway, Render, VPS)
```bash
npm run build
npm start
```

---

## Environment Variables

```env
# Required
DATABASE_URL="file:./dev.db"
SESSION_SECRET="your-random-secret-here"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

---

## Roadmap

Features planned or in active development:

- [ ] **E-Commerce** — product catalog, shopping cart, Stripe Checkout
- [ ] **PDF → Products** — upload a catalogue PDF, extract products
- [ ] **2FA (TOTP)** — schema done, completing UI + verification flow
- [ ] **Webhook support** (on publish, on form submit)
- [ ] **Plugin system** — installable block packs
- [ ] **i18n / multi-language content**
- [ ] **Role-based team access** (multiple editors)
- [ ] **Scheduled publishing**
- [ ] **GraphQL API**
- [ ] **Official Docker image**

---

## Why Brix?

| Feature | Brix | Payload | Strapi | Sanity |
|---------|------|---------|--------|--------|
| Visual block editor | ✅ | ❌ | ❌ | ✅ |
| Drag-and-drop | ✅ | ❌ | ❌ | ✅ |
| Self-hosted | ✅ | ✅ | ✅ | ❌ |
| SQLite support | ✅ | ❌ | ❌ | ❌ |
| Zero config setup | ✅ | ❌ | ❌ | ❌ |
| Free forever | ✅ | ✅ | ✅ | Limited |
| TypeScript | ✅ | ✅ | ✅ | ✅ |
| REST API | ✅ | ✅ | ✅ | ✅ |
| AI generation | ❌ | ❌ | ❌ | ❌ |
| E-Commerce *(roadmap)* | 🔜 | ❌ | Plugin | ❌ |

---

## Contributing

PRs welcome. Open an issue first for major features.

1. Fork the repo
2. `git checkout -b feat/my-feature`
3. Commit and open a PR

To add a block:
1. Create `src/lib/blocks/definitions/my-block.ts`
2. Create `src/components/blocks/MyBlock.tsx`
3. Register it in `src/lib/blocks/registry.ts`

See [BLOCKS-MANUAL.md](BLOCKS-MANUAL.md) for the full block development guide.

---

## License

MIT — free forever for personal and commercial use.

---

<p align="center">
  Built with ♥ — Star us on GitHub if you find it useful
</p>
