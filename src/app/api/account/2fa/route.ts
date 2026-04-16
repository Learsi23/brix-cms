// /api/account/2fa — TOTP Two-Factor Authentication
// Equivalent to ConfiguracionController GenerateTotpSetup / EnableTwoFactor / DisableTwoFactor
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import {
  generateBase32Secret,
  verifyTOTP,
  buildOtpAuthUrl,
  buildQrUrl,
} from '@/lib/totp';

function getUserIdFromCookie(req: NextRequest): string | null {
  return req.cookies.get('brix_auth')?.value ?? null;
}

export async function POST(req: NextRequest) {
  const userId = getUserIdFromCookie(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { action } = body;

  // ── Setup: generate secret, store temporarily, return QR URL ──────────────
  if (action === 'setup') {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    const secret = generateBase32Secret();
    await prisma.user.update({ where: { id: userId }, data: { twoFactorSecret: secret } });
    const otpUrl = buildOtpAuthUrl('Brix', user.email, secret);
    const qrUrl  = buildQrUrl(otpUrl);
    return NextResponse.json({ secret, qrUrl });
  }

  // ── Enable: verify TOTP code, mark 2FA active ─────────────────────────────
  if (action === 'enable') {
    const { totpCode } = body;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.twoFactorSecret) return NextResponse.json({ error: '2FA not set up' }, { status: 400 });
    if (!verifyTOTP(user.twoFactorSecret, String(totpCode))) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
    }
    await prisma.user.update({ where: { id: userId }, data: { twoFactorEnabled: true } });
    return NextResponse.json({ success: true, message: '2FA enabled successfully' });
  }

  // ── Disable: confirm password, clear 2FA data ─────────────────────────────
  if (action === 'disable') {
    const { password } = body;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.password !== password) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
    }
    await prisma.user.update({ where: { id: userId }, data: { twoFactorEnabled: false, twoFactorSecret: null } });
    return NextResponse.json({ success: true, message: '2FA disabled' });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
