// Pure helpers (no React, no client-only APIs) — safe to import from server
// components and edge runtime. The `imageUrl` helper used to live in the
// client-only `image-upload.tsx`, which made it a client reference and broke
// SSR rendering for any server component that called it (Featured, voice
// detail, etc.). Moving it here keeps it a plain function.

export function imageUrl(key: string | null | undefined): string | null {
  if (!key) return null;
  if (key.startsWith('http')) return key;
  return `https://images.onnepal.com/${key}`;
}

export function parseImageUrls(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.filter((s): s is string => typeof s === 'string');
    return [];
  } catch {
    return [];
  }
}

export function firstImageUrl(raw: string | null | undefined): string | null {
  const urls = parseImageUrls(raw);
  if (urls.length === 0) return null;
  return imageUrl(urls[0]);
}
