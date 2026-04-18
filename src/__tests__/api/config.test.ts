import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/db', () => ({
  prisma: {
    siteConfig: {
      findUnique: vi.fn(),
      upsert:     vi.fn(),
    },
  },
}));

import { GET, POST } from '@/app/api/config/route';
import { prisma } from '@/lib/db';
import { makeRequest } from '../helpers';

const sampleConfig = { navbar: { backgroundColor: '#fff' }, footer: { backgroundColor: '#000' } };

describe('GET /api/config', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns parsed JSON config for the requested key', async () => {
    vi.mocked(prisma.siteConfig.findUnique).mockResolvedValue({
      id: '1', key: 'site', value: JSON.stringify(sampleConfig),
    } as never);
    const req = makeRequest('http://localhost/api/config?key=site');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.key).toBe('site');
    expect(body.value.navbar.backgroundColor).toBe('#fff');
  });

  it('returns null value when key is not found', async () => {
    vi.mocked(prisma.siteConfig.findUnique).mockResolvedValue(null);
    const req = makeRequest('http://localhost/api/config?key=missing');
    const body = await (await GET(req)).json();
    expect(body.value).toBeNull();
  });

  it('defaults to key=site when no query param provided', async () => {
    vi.mocked(prisma.siteConfig.findUnique).mockResolvedValue(null);
    const req = makeRequest('http://localhost/api/config');
    await GET(req);
    expect(prisma.siteConfig.findUnique).toHaveBeenCalledWith({ where: { key: 'site' } });
  });
});

describe('POST /api/config', () => {
  beforeEach(() => vi.clearAllMocks());

  it('upserts config and returns success', async () => {
    vi.mocked(prisma.siteConfig.upsert).mockResolvedValue({
      id: '1', key: 'site', value: JSON.stringify(sampleConfig),
    } as never);
    const req = makeRequest('http://localhost/api/config', {
      method: 'POST',
      body: { key: 'site', value: sampleConfig },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);
  });
});
