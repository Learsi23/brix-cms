// lib/totp.ts — Pure TOTP implementation (RFC 6238, no external deps)
// Used by /api/account/2fa for Two-Factor Authentication setup and verification.
import { createHmac, randomBytes } from 'crypto';

const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/** Generates a cryptographically random Base32 secret */
export function generateBase32Secret(length = 20): string {
  const bytes = randomBytes(length);
  let result = '';
  for (let i = 0; i < bytes.length; i++) {
    result += BASE32_CHARS[bytes[i] & 0x1f];
  }
  return result;
}

/** Decodes a Base32 string to a Buffer */
export function base32Decode(s: string): Buffer {
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

/** Generates a 6-digit TOTP code for the given secret and time window offset */
export function generateTOTP(secret: string, window = 0): string {
  const time = Math.floor(Date.now() / 1000 / 30) + window;
  const buf = Buffer.alloc(8);
  buf.writeUInt32BE(Math.floor(time / 0x100000000), 0);
  buf.writeUInt32BE(time >>> 0, 4);
  const key = base32Decode(secret);
  const hmac = createHmac('sha1', key).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    (hmac[offset + 1] << 16) |
    (hmac[offset + 2] << 8) |
    hmac[offset + 3];
  return String(code % 1_000_000).padStart(6, '0');
}

/** Verifies a TOTP token, accepting ±1 time window (30s tolerance) */
export function verifyTOTP(secret: string, token: string): boolean {
  for (const w of [-1, 0, 1]) {
    if (generateTOTP(secret, w) === token) return true;
  }
  return false;
}

/** Builds an otpauth:// URL compatible with Google Authenticator, Authy, etc. */
export function buildOtpAuthUrl(issuer: string, email: string, secret: string): string {
  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(email)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`;
}

/** Returns a QR code image URL (via api.qrserver.com) for the given otpauth URL */
export function buildQrUrl(otpUrl: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpUrl)}`;
}
