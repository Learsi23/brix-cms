import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateBase32Secret, generateTOTP } from '@/lib/totp';

vi.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update:     vi.fn(),
    },
  },
}));

import { POST } from '@/app/api/account/2fa/route';
import { prisma } from '@/lib/db';
import { makeRequest } from '../helpers';

const baseUser = {
  id: 'user-1',
  email: 'admin@example.com',
  password: 'correctpass',
  twoFactorEnabled: false,
  twoFactorSecret: null as string | null,
};

describe('POST /api/account/2fa', () => {
  beforeEach(() => vi.clearAllMocks());

  // ── Unauthenticated ─────────────────────────────────────────────────────────
  it('401 when no auth cookie', async () => {
    const req = makeRequest('http://localhost/api/account/2fa', {
      method: 'POST',
      body: { action: 'setup' },
    });
    expect((await POST(req)).status).toBe(401);
  });

  // ── Setup ───────────────────────────────────────────────────────────────────
  it('setup — returns 20-char secret and QR URL', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(baseUser as never);
    vi.mocked(prisma.user.update).mockResolvedValue(baseUser as never);
    const req = makeRequest('http://localhost/api/account/2fa', {
      method: 'POST',
      body: { action: 'setup' },
      cookies: { eden_auth: 'user-1' },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.secret).toHaveLength(20);
    expect(body.qrUrl).toContain('qrserver.com');
    expect(body.qrUrl).toContain('otpauth');
  });

  // ── Enable ──────────────────────────────────────────────────────────────────
  it('enable — 400 on invalid TOTP code', async () => {
    const secret = generateBase32Secret();
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ ...baseUser, twoFactorSecret: secret } as never);
    const realCode = generateTOTP(secret);
    const wrongCode = realCode === '999999' ? '000000' : '999999';
    const req = makeRequest('http://localhost/api/account/2fa', {
      method: 'POST',
      body: { action: 'enable', totpCode: wrongCode },
      cookies: { eden_auth: 'user-1' },
    });
    expect((await POST(req)).status).toBe(400);
  });

  it('enable — 200 on correct TOTP code', async () => {
    const secret = generateBase32Secret();
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ ...baseUser, twoFactorSecret: secret } as never);
    vi.mocked(prisma.user.update).mockResolvedValue({ ...baseUser, twoFactorEnabled: true } as never);
    const validCode = generateTOTP(secret); // uses lib directly to get real code
    const req = makeRequest('http://localhost/api/account/2fa', {
      method: 'POST',
      body: { action: 'enable', totpCode: validCode },
      cookies: { eden_auth: 'user-1' },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);
  });

  // ── Disable ─────────────────────────────────────────────────────────────────
  it('disable — 401 on wrong password', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ ...baseUser, twoFactorEnabled: true } as never);
    const req = makeRequest('http://localhost/api/account/2fa', {
      method: 'POST',
      body: { action: 'disable', password: 'wrongpass' },
      cookies: { eden_auth: 'user-1' },
    });
    expect((await POST(req)).status).toBe(401);
  });

  it('disable — 200 on correct password', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ ...baseUser, twoFactorEnabled: true } as never);
    vi.mocked(prisma.user.update).mockResolvedValue({ ...baseUser, twoFactorEnabled: false, twoFactorSecret: null } as never);
    const req = makeRequest('http://localhost/api/account/2fa', {
      method: 'POST',
      body: { action: 'disable', password: 'correctpass' },
      cookies: { eden_auth: 'user-1' },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);
  });
});
