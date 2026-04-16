# Contributing to Brix CMS

Thank you for your interest in contributing! This document explains how to get started.

## Code of Conduct

This project follows the [Contributor Covenant](CODE_OF_CONDUCT.md). By participating you agree to uphold it.

## How to report a bug

Open an issue at [https://github.com/Learsi23/brix-cms/issues](https://github.com/Learsi23/brix-cms/issues) with:
- Steps to reproduce
- Expected vs actual behaviour
- Node version, OS, and database (SQLite / PostgreSQL)

## How to submit a PR

1. Fork the repo and create a branch: `git checkout -b feat/my-block`
2. Install dependencies: `npm install`
3. Make your changes and add tests where possible
4. Run the test suite: `npm test`
5. Open a PR against `main` with a clear description

## Development setup

```bash
git clone https://github.com/Learsi23/brix-cms
cd brix-cms
npm install
cp .env.example .env        # set DATABASE_URL
npm run setup               # prisma db push + seed
npm run dev                 # http://localhost:3000
```

Admin panel: `http://localhost:3000/admin` — `admin@example.com` / `admin123`

## Running tests

```bash
npm test               # run all tests once
npm run test:watch     # watch mode
npm run test:coverage  # coverage report
```

## Creating a new block

Each block is a self-contained definition file + a React renderer. No registration code needed — just create the two files.

### 1 — Define the block (`src/lib/blocks/definitions/my-block.ts`)

```ts
import { registerBlock } from '../registry';

registerBlock({
  type:     'MyBlock',
  name:     'My Block',
  category: 'Content',
  icon:     '✨',
  description: 'One-line description shown in the editor.',
  fields: {
    Title:           { type: 'string', title: 'Title' },
    TitleColor:      { type: 'color',  title: 'Title Color', defaultValue: '#111827' },
    BackgroundColor: { type: 'color',  title: 'Background',  defaultValue: '#ffffff' },
  },
});
```

### 2 — Import it in the registry (`src/lib/blocks/index.ts`)

```ts
import './definitions/my-block';
```

### 3 — Create the renderer (`src/components/blocks/MyBlock.tsx`)

```tsx
import type { BlockData } from '@/lib/blocks';
import { getFieldValue } from '@/lib/blocks';

export default function MyBlock({ data }: { data: BlockData }) {
  const title = getFieldValue(data, 'Title', 'Default title');
  const color = getFieldValue(data, 'BackgroundColor', '#ffffff');
  return (
    <section style={{ backgroundColor: color }}>
      <h2>{title}</h2>
    </section>
  );
}
```

### 4 — Register the renderer (`src/components/blocks/BlockRenderer.tsx`)

Add a case to the `switch` statement:
```tsx
case 'MyBlock': return <MyBlock data={data} />;
```

That's it. The block appears automatically in the admin editor.

## Field types reference

| Type | Description |
|------|-------------|
| `string` | Single-line text input |
| `textarea` | Multi-line text |
| `color` | Colour picker |
| `image` | Media library picker |
| `markdown` | Markdown editor |
| `select` | Dropdown (requires `options`) |
| `bool` | Toggle switch |
| `number` | Numeric input |
| `url` | URL input |

## Commit message style

```
feat: add CountdownBlock
fix: resolve image path on Windows
docs: update block fields reference
chore: bump next to 16.2
```

## Questions

Open a [GitHub Discussion](https://github.com/Learsi23/brix-cms/discussions) or reach out via the Issues tab.
