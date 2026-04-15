import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/db', () => ({
  prisma: {
    block: {
      update:     vi.fn(),
      delete:     vi.fn(),
      deleteMany: vi.fn(),
      findMany:   vi.fn(),
    },
  },
}));

import { PATCH, DELETE } from '@/app/api/blocks/[id]/route';
import { prisma } from '@/lib/db';
import { makeRequest } from '../helpers';

const mockBlock = {
  id: 'block-1',
  type: 'HeroBlock',
  sortOrder: 0,
  jsonData: '{"Title":{"Value":"Hello"}}',
  pageId: 'page-1',
  parentId: null,
};

// ── PATCH /api/blocks/:id ─────────────────────────────────────────────────────
describe('PATCH /api/blocks/:id', () => {
  beforeEach(() => vi.clearAllMocks());

  it('updates jsonData string and returns the block', async () => {
    vi.mocked(prisma.block.update).mockResolvedValue({ ...mockBlock, jsonData: '{"Title":{"Value":"World"}}' } as never);
    const req = makeRequest('http://localhost/api/blocks/block-1', {
      method: 'PATCH',
      body: { jsonData: '{"Title":{"Value":"World"}}' },
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: 'block-1' }) });
    expect(res.status).toBe(200);
    expect((await res.json()).id).toBe('block-1');
  });

  it('serializes object jsonData to string automatically', async () => {
    const objectData = { Title: { Value: 'From object' } };
    vi.mocked(prisma.block.update).mockResolvedValue({ ...mockBlock, jsonData: JSON.stringify(objectData) } as never);
    const req = makeRequest('http://localhost/api/blocks/block-1', {
      method: 'PATCH',
      body: { jsonData: objectData },
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: 'block-1' }) });
    expect(res.status).toBe(200);
    // update was called with a string, not an object
    const updateArg = vi.mocked(prisma.block.update).mock.calls[0][0];
    expect(typeof updateArg.data.jsonData).toBe('string');
  });

  it('404 when block does not exist', async () => {
    vi.mocked(prisma.block.update).mockRejectedValue(new Error('Record not found'));
    const req = makeRequest('http://localhost/api/blocks/bad-id', {
      method: 'PATCH',
      body: { jsonData: '{}' },
    });
    expect((await PATCH(req, { params: Promise.resolve({ id: 'bad-id' }) })).status).toBe(404);
  });
});

// ── DELETE /api/blocks/:id ────────────────────────────────────────────────────
describe('DELETE /api/blocks/:id', () => {
  beforeEach(() => vi.clearAllMocks());

  it('deletes block + children + grandchildren, returns success', async () => {
    const child = { id: 'child-1', parentId: 'block-1' };
    vi.mocked(prisma.block.findMany).mockResolvedValue([child] as never);
    vi.mocked(prisma.block.deleteMany).mockResolvedValue({ count: 1 } as never);
    vi.mocked(prisma.block.delete).mockResolvedValue(mockBlock as never);
    const req = makeRequest('http://localhost/api/blocks/block-1', { method: 'DELETE' });
    const res = await DELETE(req, { params: Promise.resolve({ id: 'block-1' }) });
    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);
    // deleteMany called twice: once for grandchildren, once for children
    expect(prisma.block.deleteMany).toHaveBeenCalledTimes(2);
  });

  it('404 when block does not exist', async () => {
    vi.mocked(prisma.block.findMany).mockResolvedValue([] as never);
    vi.mocked(prisma.block.deleteMany).mockResolvedValue({ count: 0 } as never);
    vi.mocked(prisma.block.delete).mockRejectedValue(new Error('Not found'));
    const req = makeRequest('http://localhost/api/blocks/bad-id', { method: 'DELETE' });
    expect((await DELETE(req, { params: Promise.resolve({ id: 'bad-id' }) })).status).toBe(404);
  });
});
