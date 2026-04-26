export interface JobCategory {
  name: string;
  slug: string;
}

export const JOB_CATEGORIES: JobCategory[] = [
  { name: 'IT & Software', slug: 'it-software' },
  { name: 'Marketing & Sales', slug: 'marketing-sales' },
  { name: 'Finance & Accounting', slug: 'finance-accounting' },
  { name: 'Education & Teaching', slug: 'education-teaching' },
  { name: 'Healthcare', slug: 'healthcare' },
  { name: 'Engineering', slug: 'engineering' },
  { name: 'Hospitality & Tourism', slug: 'hospitality-tourism' },
  { name: 'Retail & Customer Service', slug: 'retail-customer-service' },
  { name: 'Construction & Trades', slug: 'construction-trades' },
  { name: 'Media & Design', slug: 'media-design' },
  { name: 'Admin & Office', slug: 'admin-office' },
  { name: 'Driving & Delivery', slug: 'driving-delivery' },
  { name: 'Other', slug: 'other' },
];

export const JOB_TYPES = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'internship', label: 'Internship' },
] as const;
