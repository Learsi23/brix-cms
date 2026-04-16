import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/db', () => ({
  prisma: {
    user: { findUnique: vi.fn() },
  },
}));

import { POST, DELETE, GET } from '@/app/api/auth/route';
import { prisma } from '@/lib/db';
import { makeRequest } from '../helpers';

const mockUser = {
  id: 'user-1',
  email: 'admin@example.com',
  password: 'secret123',
  name: 'Admin',
  role: 'admin',
};

// ── POST /api/auth — login ────────────────────────────────────────────────────
describe('POST /api/auth', () => {
  beforeEach(() => vi.clearAllMocks());

  it('200 + sets brix_auth cookie on valid credentials', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
    const req = makeRequest('http://localhost/api/auth', {
      method: 'POST',
      body: { email: 'admin@example.com', password: 'secret123' },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.user.email).toBe('admin@example.com');
    expect(res.headers.get('set-cookie')).toContain('brix_auth=user-1');
  });

  it('401 on wrong password', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
    const req = makeRequest('http://localhost/api/auth', {
      method: 'POST',
      body: { email: 'admin@example.com', password: 'badpassword' },
    });
    expect((await POST(req)).status).toBe(401);
  });

  it('401 when user not found', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    const req = makeRequest('http://localhost/api/auth', {
      method: 'POST',
      body: { email: 'nobody@example.com', password: 'secret123' },
    });
    expect((await POST(req)).status).toBe(401);
  });

  it('400 when email is missing', async () => {
    const req = makeRequest('http://localhost/api/auth', {
      method: 'POST',
      body: { password: 'secret123' },
    });
    expect((await POST(req)).status).toBe(400);
  });

  it('400 when password is missing', async () => {
    const req = makeRequest('http://localhost/api/auth', {
      method: 'POST',
      body: { email: 'admin@example.com' },
    });
    expect((await POST(req)).status).toBe(400);
  });
});

// ── DELETE /api/auth — logout ─────────────────────────────────────────────────
describe('DELETE /api/auth', () => {
  it('200 + clears brix_auth cookie (Max-Age=0)', async () => {
    const res = await DELETE();
    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);
    const setCookie = res.headers.get('set-cookie');
    expect(setCookie).toContain('brix_auth=');
    expect(setCookie).toContain('Max-Age=0');
  });
});

// ── GET /api/auth — session check ─────────────────────────────────────────────
describe('GET /api/auth', () => {
  beforeEach(() => vi.clearAllMocks());

  it('401 + authenticated:false when no cookie', async () => {
    const res = await GET(makeRequest('http://localhost/api/auth'));
    expect(res.status).toBe(401);
    expect((await res.json()).authenticated).toBe(false);
  });

  it('200 + authenticated:true for valid session', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
    const req = makeRequest('http://localhost/api/auth', { cookies: { brix_auth: 'user-1' } });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.authenticated).toBe(true);
    expect(body.user.email).toBe('admin@example.com');
  });

  it('401 when cookie exists but user was deleted', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    const req = makeRequest('http://localhost/api/auth', { cookies: { brix_auth: 'stale-id' } });
    expect((await GET(req)).status).toBe(401);
  });
});
