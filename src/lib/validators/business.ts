import { z } from 'zod';
import { subdomainSchema } from './subdomain';

export const signupSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  displayName: z.string().min(2, 'Display name must be at least 2 characters').max(100),
});

export const createBusinessSchema = z.object({
  subdomain: subdomainSchema,
  businessName: z.string().min(2, 'Business name must be at least 2 characters').max(100),
  businessCategory: z.string().max(50).optional(),
});

export const updateProfileSchema = z.object({
  businessName: z.string().min(2).max(100).optional(),
  businessCategory: z.string().max(50).nullish(),
  description: z.string().max(500).nullish(),
  logoUrl: z.string().max(500).nullish(),
  coverImageUrl: z.string().max(500).nullish(),
  coverPosition: z.string().max(20).nullish(),
  phone: z.string().max(20).nullish(),
  address: z.string().max(200).nullish(),
  businessHours: z.string().max(500).nullish(),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).nullish(),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).nullish(),
  whatsappNumber: z.string().max(20).nullish(),
  mapAddress: z.string().max(500).nullish(),
  bookingEnabled: z.boolean().nullish(),
  enabledModules: z.string().max(500).nullish(),
});

export const socialLinkSchema = z.object({
  platform: z.enum([
    'facebook', 'instagram', 'tiktok', 'youtube', 'whatsapp', 'viber',
    'twitter', 'linkedin', 'website', 'email', 'phone', 'custom'
  ]),
  url: z.string().min(1, 'URL is required').max(500),
  label: z.string().max(50).optional(),
});

export const announcementSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  content: z.string().max(1000).optional(),
  isPinned: z.boolean().optional(),
  expiresAt: z.string().datetime().optional(), // ISO string
});

export const productSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().max(500).optional(),
  price: z.string().max(50).optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  category: z.string().max(50).optional(),
  isAvailable: z.boolean().optional(),
});

export const ctaButtonSchema = z.object({
  label: z.string().min(1, 'Label is required').max(50),
  url: z.string().min(1, 'URL is required').max(500),
  style: z.enum(['primary', 'secondary', 'outline']).optional(),
});

export const reorderSchema = z.object({
  ids: z.array(z.string()).min(1),
});
