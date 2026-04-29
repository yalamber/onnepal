import { z } from 'zod';

export const createClassifiedSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().max(2000).nullish(),
  price: z.string().max(50).nullish(),
  category: z.string().min(1, 'Category is required'),
  location: z.string().max(200).nullish(),
  city: z.string().max(100).nullish(),
  contactPhone: z.string().max(20).nullish(),
  contactWhatsapp: z.string().max(20).nullish(),
  imageUrls: z.array(z.string().max(500)).max(5).optional(),
});

export const createJobSchema = z.object({
  title: z.string().min(3).max(200),
  company: z.string().min(1).max(200),
  description: z.string().max(5000).nullish(),
  category: z.string().min(1),
  type: z.enum(['full-time', 'part-time', 'contract', 'freelance', 'internship']),
  location: z.string().max(200).nullish(),
  city: z.string().max(100).nullish(),
  isRemote: z.boolean().optional(),
  salary: z.string().max(100).nullish(),
  experience: z.string().max(100).nullish(),
  applyUrl: z.string().max(500).nullish(),
  contactEmail: z.string().max(200).nullish(),
  contactPhone: z.string().max(20).nullish(),
  imageUrls: z.array(z.string().max(500)).max(3).optional(),
});

export const createEventSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(2000).nullish(),
  category: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().nullish(),
  startTime: z.string().nullish(),
  endTime: z.string().nullish(),
  venue: z.string().max(200).nullish(),
  location: z.string().max(200).nullish(),
  city: z.string().max(100).nullish(),
  ticketPrice: z.string().max(100).nullish(),
  ticketUrl: z.string().max(500).nullish(),
  contactPhone: z.string().max(20).nullish(),
  contactWhatsapp: z.string().max(20).nullish(),
  imageUrls: z.array(z.string().max(500)).max(5).optional(),
});

export const createLostFoundSchema = z.object({
  type: z.enum(['lost', 'found']),
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().max(2000).nullish(),
  category: z.string().min(1, 'Category is required'),
  location: z.string().max(200).nullish(),
  city: z.string().max(100).nullish(),
  itemDate: z.string().max(20).nullish(),
  reward: z.string().max(100).nullish(),
  contactPhone: z.string().max(20).nullish(),
  contactWhatsapp: z.string().max(20).nullish(),
  imageUrls: z.array(z.string().max(500)).max(5).optional(),
});

export const createPlaceSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(2000).nullish(),
  category: z.string().min(1),
  location: z.string().max(200).nullish(),
  city: z.string().max(100).nullish(),
  address: z.string().max(500).nullish(),
  contactPhone: z.string().max(20).nullish(),
  contactWhatsapp: z.string().max(20).nullish(),
  website: z.string().max(500).nullish(),
  imageUrls: z.array(z.string().max(500)).max(5).optional(),
});

export const createCommentSchema = z.object({
  targetType: z.enum(['classified', 'job', 'event', 'lost-found', 'place']),
  targetId: z.string().min(1),
  content: z.string().min(1).max(1000),
});
