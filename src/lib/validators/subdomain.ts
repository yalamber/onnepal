import { z } from 'zod';

const RESERVED_SUBDOMAINS = [
  'www', 'api', 'admin', 'mail', 'blog', 'help', 'support', 'status',
  'app', 'dashboard', 'cdn', 'static', 'images', 'dev', 'staging', 'test',
  'onnepal', 'localhost',
];

export const subdomainSchema = z
  .string()
  .min(3, 'Must be at least 3 characters')
  .max(30, 'Must be 30 characters or less')
  .regex(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/, 'Only lowercase letters, numbers, and hyphens (cannot start or end with hyphen)')
  .refine((val) => !RESERVED_SUBDOMAINS.includes(val), 'This name is reserved');

export const checkSubdomainSchema = z.object({
  name: subdomainSchema,
});
