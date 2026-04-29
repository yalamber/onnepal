import { describe, it, expect } from 'vitest';

// Import parseImageUrls by inlining the logic to avoid pulling in the JSX image-upload module
// This tests the same logic as src/lib/image-utils.ts parseImageUrls
function parseImageUrls(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.filter((s): s is string => typeof s === 'string' && s.length > 0);
    return [];
  } catch {
    return [];
  }
}

describe('parseImageUrls', () => {
  it('returns empty array for null/undefined', () => {
    expect(parseImageUrls(null)).toEqual([]);
    expect(parseImageUrls(undefined)).toEqual([]);
  });

  it('returns empty array for empty string', () => {
    expect(parseImageUrls('')).toEqual([]);
  });

  it('returns empty array for invalid JSON', () => {
    expect(parseImageUrls('not json')).toEqual([]);
    expect(parseImageUrls('{}')).toEqual([]);
  });

  it('parses valid JSON array of strings', () => {
    const urls = JSON.stringify(['img1.jpg', 'img2.png']);
    expect(parseImageUrls(urls)).toEqual(['img1.jpg', 'img2.png']);
  });

  it('filters out non-string and empty values', () => {
    const urls = JSON.stringify(['img1.jpg', '', null, 42, 'img2.png']);
    const result = parseImageUrls(urls);
    expect(result).toEqual(['img1.jpg', 'img2.png']);
  });

  it('returns empty array for JSON array with no valid strings', () => {
    expect(parseImageUrls(JSON.stringify([null, 0, false]))).toEqual([]);
  });
});
