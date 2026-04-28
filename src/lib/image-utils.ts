import { imageUrl } from '@/components/image-upload';

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
