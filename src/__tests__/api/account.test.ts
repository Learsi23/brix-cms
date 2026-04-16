import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update:     vi.fn(),
    },
  },
}));

import { GET, PATCH } from '@/app/api/account/route';
import { prisma } from '@/lib/db';
import { makeRequest } from '../helpers';

const mockUser = {
  id: 'user-1',
  email: 'admin@example.com',
  password: 'currentpass',
  name: 'Admin',
  role: 'admin',
  twoFactorEnabled: false,
};

// ── GET /api/account ──────────────────────────────────────────────────────────
describe('GET /api/account', () => {
  beforeEach(() => vi.clearAllMocks());

  it('401 when no auth cookie', async () => {
    expect((await GET(makeRequest('http://localhost/api/account'))).status).toBe(401);
  });

  it('returns user info when authenticated', async () => {
    // Mock simulates Prisma select: { id, email, name, role, twoFactorEnabled }
    // — password is excluded at the query level, not in application code
    const safeUser = { id: 'user-1', email: 'admin@example.com', name: 'Admin', role: 'admin', twoFactorEnabled: false };
    vi.mocked(prisma.user.findUnique).mockResolvedValue(safeUser as never);
    const req = makeRequest('http://localhost/api/account', { cookies: { brix_auth: 'user-1' } });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.email).toBe('admin@example.com');
    expect(body).not.toHaveProperty('password');
  });
});

// ── PATCH /api/account — change-email ────────────────────────────────────────
describe('PATCH /api/account — change-email', () => {
  beforeEach(() => vi.clearAllMocks());

  it('200 + updates email when not taken', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null); // new email not in use
    vi.mocked(prisma.user.update).mockResolvedValue({ ...mockUser, email: 'new@example.com' } as never);
    const req = makeRequest('http://localhost/api/account', {
      method: 'PATCH',
      body: { action: 'change-email', newEmail: 'new@example.com' },
      cookies: { brix_auth: 'user-1' },
    });
    const res = await PATCH(req);
    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);
  });

  it('409 when email is already taken by another user', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'user-2', email: 'taken@example.com' } as never);
    const req = makeRequest('http://localhost/api/account', {
      method: 'PATCH',
      body: { action: 'change-email', newEmail: 'taken@example.com' },
      cookies: { brix_auth: 'user-1' },
    });
    expect((await PATCH(req)).status).toBe(409);
  });

  it('400 when newEmail is missing', async () => {
    const req = makeRequest('http://localhost/api/account', {
      method: 'PATCH',
      body: { action: 'change-email' },
      cookies: { brix_auth: 'user-1' },
    });
    expect((await PATCH(req)).status).toBe(400);
  });
});

// ── PATCH /api/account — change-password ─────────────────────────────────────
describe('PATCH /api/account — change-password', () => {
  beforeEach(() => vi.clearAllMocks());

  it('200 + changes password successfully', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
    vi.mocked(prisma.user.update).mockResolvedValue({ ...mockUser, password: 'newpassword1' } as never);
    const req = makeRequest('http://localhost/api/account', {
      method: 'PATCH',
      body: {
        action: 'change-password',
        currentPassword: 'currentpass',
        newPassword: 'newpassword1',
        confirmPassword: 'newpassword1',
      },
      cookies: { brix_auth: 'user-1' },
    });
    const res = await PATCH(req);
    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);
  });

  it('400 when passwords do not match', async () => {
    const req = makeRequest('http://localhost/api/account', {
      method: 'PATCH',
      body: { action: 'change-password', currentPassword: 'currentpass', newPassword: 'abc12345', confirmPassword: 'abc67890' },
      cookies: { brix_auth: 'user-1' },
    });
    expect((await PATCH(req)).status).toBe(400);
  });

  it('400 when new password is too short (< 8 chars)', async () => {
    const req = makeRequest('http://localhost/api/account', {
      method: 'PATCH',
      body: { action: 'change-password', currentPassword: 'currentpass', newPassword: 'short', confirmPassword: 'short' },
      cookies: { brix_auth: 'user-1' },
    });
    expect((await PATCH(req)).status).toBe(400);
  });

  it('401 when current password is wrong', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
    const req = makeRequest('http://localhost/api/account', {
      method: 'PATCH',
      body: { action: 'change-password', currentPassword: 'wrongpass', newPassword: 'newpassword1', confirmPassword: 'newpassword1' },
      cookies: { brix_auth: 'user-1' },
    });
    expect((await PATCH(req)).status).toBe(401);
  });
});

// ── PATCH /api/account — unknown action ───────────────────────────────────────
describe('PATCH /api/account — unknown action', () => {
  it('400 for unrecognized action', async () => {
    const req = makeRequest('http://localhost/api/account', {
      method: 'PATCH',
      body: { action: 'delete-account' },
      cookies: { brix_auth: 'user-1' },
    });
    expect((await PATCH(req)).status).toBe(400);
  });
});
