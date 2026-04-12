# Brix CMS

**The open-source, AI-powered headless CMS.**  
Build pages with blocks. Generate content with AI. Ship faster.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-6-teal)](https://prisma.io)

---

## What is Brix?

Brix is a self-hosted headless CMS that combines a visual **block-based page builder** with **AI-powered content generation**. Think Payload CMS meets Notion — but you can describe a page in plain English and the AI builds it for you.

> "Describe your landing page. Brix builds it."

---

## Quick Start

```bash
git clone https://github.com/your-org/brix-cms
cd brix-cms
cp .env.example .env
npm install
npm run setup     # runs prisma db push + seed
npm run dev
```

Open [http://localhost:3000/admin](http://localhost:3000/admin) — default login: `admin@example.com` / `admin123`

---

## Features

### Block-Based Page Builder
- **44 pre-built blocks** — Hero, Pricing, Testimonials, Teams, Accordion, Tabs, Gallery, Map, Countdown, and more
- **Drag-and-drop reordering** via @dnd-kit
- **Nested layouts** — columns, grids, cards with child blocks
- **Live preview** — see your page as you build it

### AI Page Generation (BYOK)
Bring your own API key. Zero lock-in.

- **Describe → Generate** — type what you want, get a fully-structured page
- **Multi-provider** — Gemini, DeepSeek, Mistral, or local Ollama
- **Vision mode** — import a Figma design or PDF, AI converts it to blocks
- **Smart clarification** — AI asks follow-up questions before generating
- **Cost tracking** — see token usage and estimated cost per provider

```
"Create a SaaS landing page for a project management tool.
 Include pricing, testimonials, and a FAQ section."
```
→ Full page built in seconds.

### Headless REST API
Every page and block is accessible via REST. Use Brix as a backend for any frontend.

```http
GET  /api/pages          → list all published pages
GET  /api/pages/:id      → page with all blocks
POST /api/pages          → create a page
PUT  /api/blocks/:id     → update a block
```

Pair with Next.js, Astro, SvelteKit, React Native, or any HTTP client.

### E-Commerce Built In
- Product catalog with variants, images, and stock tracking
- Shopping cart (session-based, no login required)
- **Stripe Checkout** out of the box
- Multi-vendor support via Stripe Connect (agencies, marketplaces)
- Order management

### Media Library
- Folder-based file organization
- Upload images, documents, videos
- Browse and pick media directly in the block editor

### Security
- Email/password authentication with **2FA (TOTP)**
- Encrypted API key storage (AES-256-GCM)
- Session-based auth with 7-day expiry
- Role-based admin access

---

## 44 Block Types

| Category | Blocks |
|----------|--------|
| **Content** | Hero, Text, Image, Video, Markdown, Spacer, Divider |
| **Layout** | Column, Grid, Card, FlexibleImageText |
| **Interactive** | Accordion, Tabs, Dropdown, Countdown, ContactForm |
| **E-Commerce** | ProductCard, ProductsGallery, PricingTable, PricingCard, Cart |
| **Media** | Gallery, Banner, LogoStrip, Map |
| **Social Proof** | Stats, Testimonials, Team, Timeline |
| **CTAs** | CTABanner, TextWithButton, ButtonLink, EmailButton |
| **AI** | ChatWidget |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Database | SQLite → PostgreSQL → MySQL (via Prisma) |
| ORM | Prisma 6 |
| Styling | Tailwind CSS (no UI library — full control) |
| Drag-Drop | @dnd-kit |
| Payments | Stripe |
| AI | Gemini / DeepSeek / Mistral / Ollama |
| Validation | Zod |

---

## Architecture

Brix is a standard Next.js app with a clean separation:

```
/src
  /app/(admin)       → Protected admin UI
  /app/(public)      → Public-facing pages (SSR)
  /app/api           → 33 REST API endpoints
  /components/blocks → 39 block renderers
  /lib/blocks        → Block registry + 44 definitions
  /lib/ai            → AI prompts, encryption, hooks
```

**Block registry pattern** — blocks are self-describing. Each block definition declares its type, fields, and defaults. Adding a new block type = add one definition file + one renderer component.

---

## Deployment

### Vercel (recommended)
```bash
vercel deploy
```
Set env vars in Vercel dashboard. Use PostgreSQL (Neon, Supabase, PlanetScale) instead of SQLite.

### Any Node.js host
```bash
npm run build
npm start
```

---

## Environment Variables

```env
# Required
DATABASE_URL="file:./dev.db"          # SQLite or postgres://...
NEXTAUTH_SECRET="your-secret-here"

# Optional — AI (bring your own key, or add via admin UI)
# Supported: Gemini, DeepSeek, Mistral, Ollama

# Optional — Payments
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
```

---

## Roadmap

- [ ] GraphQL API layer
- [ ] Webhook support (on page publish, on order)
- [ ] Plugin/extension system
- [ ] Official Docker image
- [ ] More AI providers (Claude, GPT-4o)
- [ ] i18n / multi-language content
- [ ] Role-based team access
- [ ] Scheduled publishing

---

## Why Brix?

| Feature | Brix | Payload | Strapi | Sanity |
|---------|------|---------|--------|--------|
| Visual block editor | ✅ | ❌ | ❌ | ✅ |
| AI page generation | ✅ | ❌ | ❌ | ❌ |
| E-commerce built-in | ✅ | ❌ | Plugin | ❌ |
| Figma → CMS import | ✅ | ❌ | ❌ | ❌ |
| Self-hosted | ✅ | ✅ | ✅ | ❌ |
| Free forever | ✅ | ✅ | ✅ | Limited |
| TypeScript | ✅ | ✅ | ✅ | ✅ |

---

## Contributing

PRs welcome. Open an issue first for major changes.

1. Fork the repo
2. Create your feature branch (`git checkout -b feat/my-feature`)
3. Commit and open a PR

---

## License

MIT — free forever for personal and commercial use.

---

<p align="center">
  Built with love — Star us on GitHub to support the project
</p>
