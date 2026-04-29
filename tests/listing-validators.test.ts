import { describe, it, expect } from 'vitest';
import {
  createClassifiedSchema,
  createJobSchema,
  createEventSchema,
  createLostFoundSchema,
  createCommentSchema,
} from '@/lib/validators/listings';

describe('createClassifiedSchema', () => {
  const valid = { title: 'Selling laptop', category: 'Electronics' };

  it('accepts minimal valid data', () => {
    expect(createClassifiedSchema.safeParse(valid).success).toBe(true);
  });

  it('accepts full valid data', () => {
    const full = {
      ...valid, description: 'Good condition', price: 'Rs. 50,000',
      location: 'Kathmandu', contactPhone: '+977-9841234567',
      contactWhatsapp: '+977-9841234567', imageUrls: ['user/img1.jpg', 'user/img2.jpg'],
    };
    expect(createClassifiedSchema.safeParse(full).success).toBe(true);
  });

  it('rejects title under 3 chars', () => {
    expect(createClassifiedSchema.safeParse({ ...valid, title: 'ab' }).success).toBe(false);
  });

  it('rejects title over 200 chars', () => {
    expect(createClassifiedSchema.safeParse({ ...valid, title: 'x'.repeat(201) }).success).toBe(false);
  });

  it('rejects missing category', () => {
    expect(createClassifiedSchema.safeParse({ title: 'Selling laptop' }).success).toBe(false);
  });

  it('rejects more than 5 images', () => {
    const data = { ...valid, imageUrls: Array.from({ length: 6 }, (_, i) => `user/img${i}.jpg`) };
    expect(createClassifiedSchema.safeParse(data).success).toBe(false);
  });

  it('accepts null for optional fields', () => {
    const data = { ...valid, description: null, price: null, location: null };
    expect(createClassifiedSchema.safeParse(data).success).toBe(true);
  });
});

describe('createJobSchema', () => {
  const valid = { title: 'Software Engineer', company: 'TechCo', category: 'IT', type: 'full-time' as const };

  it('accepts minimal valid data', () => {
    expect(createJobSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects missing company', () => {
    const { company, ...noCompany } = valid;
    expect(createJobSchema.safeParse(noCompany).success).toBe(false);
  });

  it('rejects invalid job type', () => {
    expect(createJobSchema.safeParse({ ...valid, type: 'volunteer' }).success).toBe(false);
  });

  it('accepts all valid job types', () => {
    for (const type of ['full-time', 'part-time', 'contract', 'freelance', 'internship']) {
      expect(createJobSchema.safeParse({ ...valid, type }).success).toBe(true);
    }
  });

  it('rejects more than 3 images', () => {
    const data = { ...valid, imageUrls: ['a.jpg', 'b.jpg', 'c.jpg', 'd.jpg'] };
    expect(createJobSchema.safeParse(data).success).toBe(false);
  });

  it('accepts description up to 5000 chars', () => {
    expect(createJobSchema.safeParse({ ...valid, description: 'a'.repeat(5000) }).success).toBe(true);
    expect(createJobSchema.safeParse({ ...valid, description: 'a'.repeat(5001) }).success).toBe(false);
  });
});

describe('createEventSchema', () => {
  const valid = { title: 'Nepal Music Fest', category: 'Music', startDate: '2026-06-15' };

  it('accepts minimal valid data', () => {
    expect(createEventSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects missing startDate', () => {
    const { startDate, ...noDate } = valid;
    expect(createEventSchema.safeParse(noDate).success).toBe(false);
  });

  it('accepts full event data', () => {
    const full = {
      ...valid, description: 'Great event', endDate: '2026-06-16',
      startTime: '10:00', endTime: '18:00', venue: 'TU Ground',
      location: 'Kathmandu', ticketPrice: 'Rs. 500',
      ticketUrl: 'https://tickets.example.com', contactPhone: '+977-9841234567',
    };
    expect(createEventSchema.safeParse(full).success).toBe(true);
  });

  it('rejects title under 3 chars', () => {
    expect(createEventSchema.safeParse({ ...valid, title: 'ab' }).success).toBe(false);
  });
});

describe('createLostFoundSchema', () => {
  const valid = { type: 'lost' as const, title: 'Lost wallet', category: 'Wallet & Purse' };

  it('accepts minimal valid data', () => {
    expect(createLostFoundSchema.safeParse(valid).success).toBe(true);
  });

  it('accepts found type', () => {
    expect(createLostFoundSchema.safeParse({ ...valid, type: 'found' }).success).toBe(true);
  });

  it('rejects invalid type', () => {
    expect(createLostFoundSchema.safeParse({ ...valid, type: 'stolen' }).success).toBe(false);
  });

  it('accepts reward field', () => {
    expect(createLostFoundSchema.safeParse({ ...valid, reward: 'Rs. 5,000' }).success).toBe(true);
  });

  it('rejects reward over 100 chars', () => {
    expect(createLostFoundSchema.safeParse({ ...valid, reward: 'x'.repeat(101) }).success).toBe(false);
  });
});

describe('createCommentSchema', () => {
  it('accepts valid comment', () => {
    const data = { targetType: 'classified' as const, targetId: 'abc123', content: 'Nice item!' };
    expect(createCommentSchema.safeParse(data).success).toBe(true);
  });

  it('rejects invalid targetType', () => {
    const data = { targetType: 'review', targetId: 'abc123', content: 'Hello' };
    expect(createCommentSchema.safeParse(data).success).toBe(false);
  });

  it('accepts all valid target types', () => {
    for (const targetType of ['classified', 'job', 'event', 'lost-found']) {
      expect(createCommentSchema.safeParse({ targetType, targetId: 'x', content: 'hi' }).success).toBe(true);
    }
  });

  it('rejects empty content', () => {
    const data = { targetType: 'job' as const, targetId: 'abc', content: '' };
    expect(createCommentSchema.safeParse(data).success).toBe(false);
  });

  it('rejects content over 1000 chars', () => {
    const data = { targetType: 'job' as const, targetId: 'abc', content: 'a'.repeat(1001) };
    expect(createCommentSchema.safeParse(data).success).toBe(false);
  });
});
