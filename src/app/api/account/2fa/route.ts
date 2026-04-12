// /api/account/2fa — TOTP Two-Factor Authentication
// Equivalent to ConfiguracionController GenerateTotpSetup / EnableTwoFactor / DisableTwoFactor
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createHmac, randomBytes } from 'crypto';

const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function generateBase32Secret(length = 20): string {
  const bytes = randomBytes(length);
  let result = '';
  for (let i = 0; i < bytes.length; i++) {
    result += BASE32_CHARS[bytes[i] & 0x1f];
  }
  return result;
}

function base32Decode(s: string): Buffer {
  s = s.toUpperCase().replace(/=+$/, '');
  let bits = 0, value = 0;
  const output: number[] = [];
  for (const char of s) {
    const idx = BASE32_CHARS.indexOf(char);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) { bits -= 8; output.push((value >> bits) & 0xff); }
  }
  return Buffer.from(output);
}

function generateTOTP(secret: string, window = 0): string {
  const time = Math.floor(Date.now() / 1000 / 30) + window;
  const buf = Buffer.alloc(8);
  buf.writeUInt32BE(Math.floor(time / 0x100000000), 0);
  buf.writeUInt32BE(time >>> 0, 4);
  const key = base32Decode(secret);
  const hmac = createHmac('sha1', key).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code = ((hmac[offset] & 0x7f) << 24) | (hmac[offset + 1] << 16) | (hmac[offset + 2] << 8) | hmac[offset + 3];
  return String(code % 1000000).padStart(6, '0');
}

function verifyTOTP(secret: string, token: string): boolean {
  for (const w of [-1, 0, 1]) {
    if (generateTOTP(secret, w) === token) return true;
  }
  return false;
}

function getUserIdFromCookie(req: NextRequest): string | null {
  return req.cookies.get('eden_auth')?.value ?? null;
}

export async function POST(req: NextRequest) {
  const userId = getUserIdFromCookie(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { action } = body;

  if (action === 'setup') {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    const secret = generateBase32Secret();
    // Store temporarily (will be confirmed on enable)
    await prisma.user.update({ where: { id: userId }, data: { twoFactorSecret: secret } });
    const issuer = 'Brix';
    const otpUrl = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(user.email)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpUrl)}`;
    return NextResponse.json({ secret, qrUrl });
  }

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
