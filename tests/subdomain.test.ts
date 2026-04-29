import { describe, it, expect } from 'vitest';
import { subdomainSchema } from '@/lib/validators/subdomain';

describe('subdomainSchema', () => {
  it('accepts valid subdomains', () => {
    expect(subdomainSchema.safeParse('myshop').success).toBe(true);
    expect(subdomainSchema.safeParse('my-shop-123').success).toBe(true);
    expect(subdomainSchema.safeParse('abc').success).toBe(true);
  });

  it('rejects subdomains under 3 chars', () => {
    expect(subdomainSchema.safeParse('ab').success).toBe(false);
  });

  it('rejects subdomains over 30 chars', () => {
    expect(subdomainSchema.safeParse('a'.repeat(31)).success).toBe(false);
  });

  it('rejects uppercase characters', () => {
    expect(subdomainSchema.safeParse('MyShop').success).toBe(false);
  });

  it('rejects starting with hyphen', () => {
    expect(subdomainSchema.safeParse('-myshop').success).toBe(false);
  });

  it('rejects ending with hyphen', () => {
    expect(subdomainSchema.safeParse('myshop-').success).toBe(false);
  });

  it('rejects special characters', () => {
    expect(subdomainSchema.safeParse('my_shop').success).toBe(false);
    expect(subdomainSchema.safeParse('my.shop').success).toBe(false);
    expect(subdomainSchema.safeParse('my shop').success).toBe(false);
  });

  it('rejects reserved subdomains', () => {
    expect(subdomainSchema.safeParse('www').success).toBe(false);
    expect(subdomainSchema.safeParse('api').success).toBe(false);
    expect(subdomainSchema.safeParse('admin').success).toBe(false);
    expect(subdomainSchema.safeParse('onnepal').success).toBe(false);
    expect(subdomainSchema.safeParse('localhost').success).toBe(false);
  });

  it('accepts subdomains similar to but not matching reserved names', () => {
    expect(subdomainSchema.safeParse('www2').success).toBe(true);
    expect(subdomainSchema.safeParse('my-api').success).toBe(true);
    expect(subdomainSchema.safeParse('admin-panel').success).toBe(true);
  });
});
