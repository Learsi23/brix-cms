import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/db', () => ({
  prisma: {
    page: {
      findMany:  vi.fn(),
      findUnique: vi.fn(),
      create:    vi.fn(),
      update:    vi.fn(),
      delete:    vi.fn(),
      aggregate: vi.fn(),
    },
  },
}));

import { GET as listPages, POST as createPage }                         from '@/app/api/pages/route';
import { GET as getPage, PATCH as updatePage, DELETE as deletePage }   from '@/app/api/pages/[id]/route';
import { prisma } from '@/lib/db';
import { makeRequest } from '../helpers';

const mockPage = {
  id: 'page-1',
  title: 'Home',
  slug: 'home',
  isPublished: true,
  publishedAt: new Date(),
  sortOrder: 0,
  pageType: 'standard',
  createdAt: new Date(),
};

// ── GET /api/pages ────────────────────────────────────────────────────────────
describe('GET /api/pages', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns an array of pages', async () => {
    vi.mocked(prisma.page.findMany).mockResolvedValue([mockPage] as never);
    const res = await listPages();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body[0].slug).toBe('home');
  });
});

// ── POST /api/pages ───────────────────────────────────────────────────────────
describe('POST /api/pages', () => {
  beforeEach(() => vi.clearAllMocks());

  it('201 + returns new page with title and slug', async () => {
    vi.mocked(prisma.page.aggregate).mockResolvedValue({ _max: { sortOrder: 0 } } as never);
    vi.mocked(prisma.page.create).mockResolvedValue({ ...mockPage, id: 'page-new', slug: 'new-page' } as never);
    const req = makeRequest('http://localhost/api/pages', {
      method: 'POST',
      body: { title: 'New Page', slug: 'new-page' },
    });
    const res = await createPage(req);
    expect(res.status).toBe(201);
    expect((await res.json()).id).toBe('page-new');
  });

  it('400 when title is missing', async () => {
    const req = makeRequest('http://localhost/api/pages', {
      method: 'POST',
      body: { slug: 'no-title' },
    });
    expect((await createPage(req)).status).toBe(400);
  });

  it('400 when slug is missing', async () => {
    const req = makeRequest('http://localhost/api/pages', {
      method: 'POST',
      body: { title: 'No Slug' },
    });
    expect((await createPage(req)).status).toBe(400);
  });
});

// ── GET /api/pages/:id ────────────────────────────────────────────────────────
describe('GET /api/pages/:id', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns page with blocks array', async () => {
    vi.mocked(prisma.page.findUnique).mockResolvedValue({ ...mockPage, blocks: [] } as never);
    const req = makeRequest('http://localhost/api/pages/page-1');
    const res = await getPage(req, { params: Promise.resolve({ id: 'page-1' }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id).toBe('page-1');
    expect(Array.isArray(body.blocks)).toBe(true);
  });

  it('404 when page does not exist', async () => {
    vi.mocked(prisma.page.findUnique).mockResolvedValue(null);
    const req = makeRequest('http://localhost/api/pages/missing');
    expect((await getPage(req, { params: Promise.resolve({ id: 'missing' }) })).status).toBe(404);
  });
});

// ── PATCH /api/pages/:id ──────────────────────────────────────────────────────
describe('PATCH /api/pages/:id', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns the updated page', async () => {
    vi.mocked(prisma.page.update).mockResolvedValue({ ...mockPage, title: 'Updated Title' } as never);
    const req = makeRequest('http://localhost/api/pages/page-1', {
      method: 'PATCH',
      body: { title: 'Updated Title' },
    });
    const res = await updatePage(req, { params: Promise.resolve({ id: 'page-1' }) });
    expect(res.status).toBe(200);
    expect((await res.json()).title).toBe('Updated Title');
  });
});

// ── DELETE /api/pages/:id ─────────────────────────────────────────────────────
describe('DELETE /api/pages/:id', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns success:true', async () => {
    vi.mocked(prisma.page.delete).mockResolvedValue(mockPage as never);
    const req = makeRequest('http://localhost/api/pages/page-1', { method: 'DELETE' });
    const res = await deletePage(req, { params: Promise.resolve({ id: 'page-1' }) });
    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);
  });
});
