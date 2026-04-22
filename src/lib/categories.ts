export const CATEGORIES = [
  { name: 'Restaurant & Cafe', slug: 'restaurant-cafe', icon: '🍽️' },
  { name: 'Retail Shop', slug: 'retail-shop', icon: '🛍️' },
  { name: 'Beauty & Salon', slug: 'beauty-salon', icon: '💇' },
  { name: 'Hotel & Travel', slug: 'hotel-travel', icon: '🏨' },
  { name: 'Education', slug: 'education', icon: '📚' },
  { name: 'Health & Fitness', slug: 'health-fitness', icon: '💪' },
  { name: 'Technology', slug: 'technology', icon: '💻' },
  { name: 'Construction', slug: 'construction', icon: '🏗️' },
  { name: 'Agriculture', slug: 'agriculture', icon: '🌾' },
  { name: 'Fashion', slug: 'fashion', icon: '👗' },
  { name: 'Photography', slug: 'photography', icon: '📷' },
  { name: 'Other', slug: 'other', icon: '📌' },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]['slug'];

export function getCategoryBySlug(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug) || null;
}

export function getCategoryByName(name: string) {
  return CATEGORIES.find((c) => c.name === name) || null;
}

export function getSlugFromName(name: string): string {
  const cat = getCategoryByName(name);
  return cat ? cat.slug : name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
