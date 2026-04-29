import { describe, it, expect } from 'vitest';
import { timeAgo } from '@/lib/time-ago';

describe('timeAgo', () => {
  it('returns "just now" for dates less than 60 seconds ago', () => {
    expect(timeAgo(new Date())).toBe('just now');
    expect(timeAgo(new Date(Date.now() - 30000).toISOString())).toBe('just now');
  });

  it('returns minutes for dates less than 1 hour ago', () => {
    expect(timeAgo(new Date(Date.now() - 5 * 60000).toISOString())).toBe('5 minutes ago');
    expect(timeAgo(new Date(Date.now() - 60000).toISOString())).toBe('1 minute ago');
  });

  it('returns hours for dates less than 1 day ago', () => {
    expect(timeAgo(new Date(Date.now() - 3 * 3600000).toISOString())).toBe('3 hours ago');
    expect(timeAgo(new Date(Date.now() - 3600000).toISOString())).toBe('1 hour ago');
  });

  it('returns days for dates less than 7 days ago', () => {
    expect(timeAgo(new Date(Date.now() - 2 * 86400000).toISOString())).toBe('2 days ago');
    expect(timeAgo(new Date(Date.now() - 86400000).toISOString())).toBe('1 day ago');
  });

  it('returns weeks for dates less than 4 weeks ago', () => {
    expect(timeAgo(new Date(Date.now() - 14 * 86400000).toISOString())).toBe('2 weeks ago');
    expect(timeAgo(new Date(Date.now() - 7 * 86400000).toISOString())).toBe('1 week ago');
  });

  it('returns months for dates more than 4 weeks ago', () => {
    expect(timeAgo(new Date(Date.now() - 62 * 86400000).toISOString())).toBe('2 months ago');
    expect(timeAgo(new Date(Date.now() - 31 * 86400000).toISOString())).toBe('1 month ago');
  });

  it('accepts both string and Date inputs', () => {
    const date = new Date(Date.now() - 120000);
    expect(timeAgo(date)).toBe('2 minutes ago');
    expect(timeAgo(date.toISOString())).toBe('2 minutes ago');
  });
});
