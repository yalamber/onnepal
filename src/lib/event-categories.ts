export interface EventCategory {
  name: string;
  slug: string;
}

export const EVENT_CATEGORIES: EventCategory[] = [
  { name: 'Cultural & Festival', slug: 'cultural-festival' },
  { name: 'Music & Concert', slug: 'music-concert' },
  { name: 'Sports', slug: 'sports' },
  { name: 'Business & Networking', slug: 'business-networking' },
  { name: 'Workshop & Training', slug: 'workshop-training' },
  { name: 'Food & Drink', slug: 'food-drink' },
  { name: 'Community', slug: 'community' },
  { name: 'Religious', slug: 'religious' },
  { name: 'Art & Exhibition', slug: 'art-exhibition' },
  { name: 'Charity', slug: 'charity' },
  { name: 'Other', slug: 'other' },
];
