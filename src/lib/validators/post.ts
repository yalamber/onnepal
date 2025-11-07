import { z } from 'zod';

export const createPostSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters').max(200, 'Title too long'),
  content: z.string().min(100, 'Content must be at least 100 characters'),
  excerpt: z.string().max(300, 'Excerpt too long').optional(),
  coverImageUrl: z.string().url('Invalid image URL').optional(),
  tagIds: z.array(z.string()).max(5, 'Maximum 5 tags').optional(),
});

export const updatePostSchema = z.object({
  title: z.string().min(10).max(200).optional(),
  content: z.string().min(100).optional(),
  excerpt: z.string().max(300).optional(),
  coverImageUrl: z.string().url().optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
