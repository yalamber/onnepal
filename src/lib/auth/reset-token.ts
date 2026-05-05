/**
 * Password-reset token primitives.
 *
 * - Generate: 32 cryptographically random bytes, hex-encoded → 64 char string.
 * - Storage: SHA-256 hash of the raw token. Raw token is never persisted.
 * - Lookup: hash the incoming token, compare to stored hash (constant-time
 *   comparison is provided by the unique-index lookup itself).
 */

const TOKEN_BYTES = 32;

export function generateRawToken(): string {
  const buf = new Uint8Array(TOKEN_BYTES);
  crypto.getRandomValues(buf);
  return Array.from(buf, (b) => b.toString(16).padStart(2, '0')).join('');
}

export async function hashToken(raw: string): Promise<string> {
  const data = new TextEncoder().encode(raw);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Hex sanity check: 64 lowercase hex chars. Reject obviously wrong tokens
 * before hitting the DB.
 */
export function looksLikeToken(s: string): boolean {
  return /^[0-9a-f]{64}$/.test(s);
}
