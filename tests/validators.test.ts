import { describe, it, expect } from 'vitest';
import { signupSchema, productSchema, reorderSchema, updateProfileSchema, socialLinkSchema } from '@/lib/validators/business';

describe('signupSchema', () => {
  it('accepts valid signup data', () => {
    const result = signupSchema.safeParse({ email: 'test@example.com', password: 'password123', displayName: 'Test User' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = signupSchema.safeParse({ email: 'not-email', password: 'password123', displayName: 'Test' });
    expect(result.success).toBe(false);
  });

  it('rejects short password', () => {
    const result = signupSchema.safeParse({ email: 'test@example.com', password: 'short', displayName: 'Test' });
    expect(result.success).toBe(false);
  });

  it('rejects password over 128 chars', () => {
    const result = signupSchema.safeParse({ email: 'test@example.com', password: 'a'.repeat(129), displayName: 'Test' });
    expect(result.success).toBe(false);
  });

  it('rejects short display name', () => {
    const result = signupSchema.safeParse({ email: 'test@example.com', password: 'password123', displayName: 'X' });
    expect(result.success).toBe(false);
  });
});

describe('productSchema', () => {
  it('accepts valid product data', () => {
    const result = productSchema.safeParse({ name: 'Widget', price: 'Rs. 500', description: 'A widget' });
    expect(result.success).toBe(true);
  });

  it('requires name', () => {
    const result = productSchema.safeParse({ price: 'Rs. 500' });
    expect(result.success).toBe(false);
  });

  it('accepts R2 key for imageUrl (not full URL)', () => {
    const result = productSchema.safeParse({ name: 'Widget', imageUrl: 'user123/abc-def.jpg' });
    expect(result.success).toBe(true);
  });

  it('accepts null imageUrl', () => {
    const result = productSchema.safeParse({ name: 'Widget', imageUrl: null });
    expect(result.success).toBe(true);
  });

  it('rejects imageUrl over 500 chars', () => {
    const result = productSchema.safeParse({ name: 'Widget', imageUrl: 'x'.repeat(501) });
    expect(result.success).toBe(false);
  });
});

describe('reorderSchema', () => {
  it('accepts valid ids array', () => {
    const result = reorderSchema.safeParse({ ids: ['id1', 'id2', 'id3'] });
    expect(result.success).toBe(true);
  });

  it('rejects empty ids array', () => {
    const result = reorderSchema.safeParse({ ids: [] });
    expect(result.success).toBe(false);
  });

  it('rejects ids array over 200 items', () => {
    const result = reorderSchema.safeParse({ ids: Array.from({ length: 201 }, (_, i) => `id-${i}`) });
    expect(result.success).toBe(false);
  });
});

describe('updateProfileSchema', () => {
  it('accepts valid profile update', () => {
    const result = updateProfileSchema.safeParse({ businessName: 'My Shop', phone: '+977-9841234567' });
    expect(result.success).toBe(true);
  });

  it('accepts null values for nullable fields', () => {
    const result = updateProfileSchema.safeParse({ description: null, phone: null, logoUrl: null });
    expect(result.success).toBe(true);
  });

  it('validates hex color format', () => {
    expect(updateProfileSchema.safeParse({ primaryColor: '#ff0000' }).success).toBe(true);
    expect(updateProfileSchema.safeParse({ primaryColor: 'red' }).success).toBe(false);
    expect(updateProfileSchema.safeParse({ primaryColor: '#xyz' }).success).toBe(false);
  });

  it('rejects business name under 2 chars', () => {
    const result = updateProfileSchema.safeParse({ businessName: 'X' });
    expect(result.success).toBe(false);
  });
});

describe('socialLinkSchema', () => {
  it('accepts valid social link', () => {
    const result = socialLinkSchema.safeParse({ platform: 'facebook', url: 'https://facebook.com/test' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid platform', () => {
    const result = socialLinkSchema.safeParse({ platform: 'myspace', url: 'https://example.com' });
    expect(result.success).toBe(false);
  });

  it('rejects empty url', () => {
    const result = socialLinkSchema.safeParse({ platform: 'facebook', url: '' });
    expect(result.success).toBe(false);
  });
});
