import { createHash } from "crypto";
import { compare, hash } from "bcryptjs";

const BCRYPT_ROUNDS = 12;

export function isBcryptHash(value: string): boolean {
  return /^\$2[aby]\$\d{2}\$/.test(value);
}

export function hashPasswordSha256(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

export async function hashPassword(password: string): Promise<string> {
  return hash(password, BCRYPT_ROUNDS);
}

/**
 * Backward compatible verifier:
 * - new accounts use bcrypt
 * - old accounts can still use sha256 hash until migrated
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  if (!storedHash) return false;
  if (isBcryptHash(storedHash)) {
    return compare(password, storedHash);
  }
  return hashPasswordSha256(password) === storedHash;
}
