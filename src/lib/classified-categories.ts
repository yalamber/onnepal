export const CLASSIFIED_CATEGORIES = [
  { name: 'Vehicles', slug: 'vehicles', icon: '🚗' },
  { name: 'Electronics', slug: 'electronics', icon: '📱' },
  { name: 'Real Estate', slug: 'real-estate', icon: '🏠' },
  { name: 'Jobs', slug: 'jobs', icon: '💼' },
  { name: 'Services', slug: 'services', icon: '🔧' },
  { name: 'Furniture', slug: 'furniture', icon: '🪑' },
  { name: 'Fashion & Beauty', slug: 'fashion-beauty', icon: '👗' },
  { name: 'Education', slug: 'education', icon: '📚' },
  { name: 'Sports & Hobbies', slug: 'sports-hobbies', icon: '⚽' },
  { name: 'Pets', slug: 'pets', icon: '🐕' },
  { name: 'Food & Agriculture', slug: 'food-agriculture', icon: '🌾' },
  { name: 'Other', slug: 'other', icon: '📦' },
] as const;

export type ClassifiedCategorySlug = (typeof CLASSIFIED_CATEGORIES)[number]['slug'];

export function getClassifiedCategoryBySlug(slug: string) {
  return CLASSIFIED_CATEGORIES.find((c) => c.slug === slug) || null;
}

export function getClassifiedCategoryByName(name: string) {
  return CLASSIFIED_CATEGORIES.find((c) => c.name === name) || null;
}

export function getClassifiedSlugFromName(name: string): string {
  const cat = getClassifiedCategoryByName(name);
  return cat ? cat.slug : name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
