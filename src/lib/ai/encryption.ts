import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  createHash,
} from "crypto";

const ALGORITHM = "aes-256-gcm";

/**
 * Derives a 32-byte key from the ENCRYPTION_KEY env var.
 * Uses SHA-256 so any length string works as the source secret.
 */
function getKey(): Buffer {
  const secret = process.env.ENCRYPTION_KEY;
  if (!secret) {
    throw new Error(
      "ENCRYPTION_KEY is not set in environment variables. Add it to .env",
    );
  }
  // SHA-256 always gives us exactly 32 bytes regardless of input length
  return createHash("sha256").update(secret).digest();
}

interface EncryptedPayload {
  encryptedKey: string; // hex
  iv: string;           // hex (16 bytes)
  authTag: string;      // hex (16 bytes)
}

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * Returns hex-encoded ciphertext, IV, and authentication tag.
 */
export function encryptKey(plaintext: string): EncryptedPayload {
  const key = getKey();
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");

  return {
    encryptedKey: encrypted,
    iv: iv.toString("hex"),
    authTag,
  };
}

/**
 * Decrypts an AES-256-GCM encrypted payload back to plaintext.
 */
export function decryptKey(
  encryptedKey: string,
  iv: string,
  authTag: string,
): string {
  const key = getKey();
  const decipher = createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(iv, "hex"),
  );
  decipher.setAuthTag(Buffer.from(authTag, "hex"));

  let decrypted = decipher.update(encryptedKey, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

/**
 * Returns a masked version of the key for display purposes.
 * e.g. "sk-abc...xyz" → "sk-a••••xyz"
 */
export function maskKey(plaintext: string): string {
  if (plaintext.length <= 8) return "••••••••";
  return `${plaintext.slice(0, 6)}${"•".repeat(6)}${plaintext.slice(-4)}`;
}
