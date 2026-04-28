export interface LostFoundCategory {
  name: string;
  slug: string;
}

export const LOST_FOUND_CATEGORIES: LostFoundCategory[] = [
  { name: 'Pets', slug: 'pets' },
  { name: 'Documents & ID', slug: 'documents-id' },
  { name: 'Electronics', slug: 'electronics' },
  { name: 'Wallet & Purse', slug: 'wallet-purse' },
  { name: 'Keys', slug: 'keys' },
  { name: 'Jewelry', slug: 'jewelry' },
  { name: 'Bags & Luggage', slug: 'bags-luggage' },
  { name: 'Clothing', slug: 'clothing' },
  { name: 'Vehicles', slug: 'vehicles' },
  { name: 'Other', slug: 'other' },
];

export function getLostFoundCategoryBySlug(slug: string) {
  return LOST_FOUND_CATEGORIES.find(c => c.slug === slug);
}

export function getLostFoundSlugFromName(name: string) {
  return LOST_FOUND_CATEGORIES.find(c => c.name === name)?.slug || 'other';
}
