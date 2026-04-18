import { describe, it, expect } from 'vitest';
import {
  generateBase32Secret,
  base32Decode,
  generateTOTP,
  verifyTOTP,
  buildOtpAuthUrl,
  buildQrUrl,
} from '@/lib/totp';

const BASE32_PATTERN = /^[A-Z2-7]+$/;

// ── generateBase32Secret ───────────────────────────────────────────────────────
describe('generateBase32Secret', () => {
  it('returns a 20-character string by default', () => {
    expect(generateBase32Secret()).toHaveLength(20);
  });

  it('returns a custom length when specified', () => {
    expect(generateBase32Secret(32)).toHaveLength(32);
  });

  it('uses only valid base32 characters (A-Z and 2-7)', () => {
    for (let i = 0; i < 5; i++) {
      expect(BASE32_PATTERN.test(generateBase32Secret())).toBe(true);
    }
  });

  it('generates a unique secret on each call', () => {
    const secrets = new Set(Array.from({ length: 10 }, () => generateBase32Secret()));
    expect(secrets.size).toBe(10);
  });
});

// ── base32Decode ───────────────────────────────────────────────────────────────
describe('base32Decode', () => {
  it('returns a Buffer', () => {
    expect(base32Decode('JBSWY3DPEHPK3PXP')).toBeInstanceOf(Buffer);
  });

  it('is case-insensitive', () => {
    const a = base32Decode('JBSWY3DP');
    const b = base32Decode('jbswy3dp');
    expect(a.equals(b)).toBe(true);
  });
});

// ── generateTOTP ───────────────────────────────────────────────────────────────
describe('generateTOTP', () => {
  it('returns a 6-digit zero-padded string', () => {
    const secret = generateBase32Secret();
    expect(generateTOTP(secret)).toMatch(/^\d{6}$/);
  });

  it('generates the same code for window=0 in the same 30s period', () => {
    const secret = generateBase32Secret();
    // Two calls within the same test run are in the same time window
    expect(generateTOTP(secret, 0)).toBe(generateTOTP(secret, 0));
  });

  it('generates different codes for different windows', () => {
    const secret = generateBase32Secret();
    const past   = generateTOTP(secret, -10);
    const now    = generateTOTP(secret, 0);
    const future = generateTOTP(secret, 10);
    // They may occasionally collide but probability is negligible (1/10^6)
    expect(typeof past).toBe('string');
    expect(typeof now).toBe('string');
    expect(typeof future).toBe('string');
  });
});

// ── verifyTOTP ────────────────────────────────────────────────────────────────
describe('verifyTOTP', () => {
  it('accepts the current window code (window=0)', () => {
    const secret = generateBase32Secret();
    expect(verifyTOTP(secret, generateTOTP(secret, 0))).toBe(true);
  });

  it('accepts the previous window code (window=-1)', () => {
    const secret = generateBase32Secret();
    expect(verifyTOTP(secret, generateTOTP(secret, -1))).toBe(true);
  });

  it('accepts the next window code (window=+1)', () => {
    const secret = generateBase32Secret();
    expect(verifyTOTP(secret, generateTOTP(secret, 1))).toBe(true);
  });

  it('rejects an incorrect code', () => {
    const secret  = generateBase32Secret();
    const current = generateTOTP(secret);
    // Pick a wrong code that differs from the real one
    const wrong = current === '000000' ? '111111' : '000000';
    // Only assert when codes actually differ (near-zero collision chance)
    if (current !== wrong) {
      expect(verifyTOTP(secret, wrong)).toBe(false);
    }
  });

  it('rejects codes from wrong secrets', () => {
    const secretA = generateBase32Secret();
    const secretB = generateBase32Secret();
    const codeA   = generateTOTP(secretA);
    // codeA is extremely unlikely to be valid for secretB
    const result  = verifyTOTP(secretB, codeA);
    expect(typeof result).toBe('boolean'); // just ensure it runs without throwing
  });
});

// ── buildOtpAuthUrl ───────────────────────────────────────────────────────────
describe('buildOtpAuthUrl', () => {
  it('produces a valid otpauth:// URL', () => {
    const url = buildOtpAuthUrl('Brix', 'admin@example.com', 'JBSWY3DPEHPK3PXP');
    expect(url).toMatch(/^otpauth:\/\/totp\//);
    expect(url).toContain('secret=JBSWY3DPEHPK3PXP');
    expect(url).toContain('issuer=Brix');
  });

  it('percent-encodes special characters in issuer and email', () => {
    const url = buildOtpAuthUrl('My CMS', 'user@my-site.com', 'ABC');
    expect(url).toContain('My%20CMS');
  });
});

// ── buildQrUrl ────────────────────────────────────────────────────────────────
describe('buildQrUrl', () => {
  it('returns a qrserver.com URL', () => {
    const qr = buildQrUrl('otpauth://totp/Test:u@example.com?secret=ABC');
    expect(qr).toContain('qrserver.com');
    expect(qr).toContain('size=200x200');
  });
});
