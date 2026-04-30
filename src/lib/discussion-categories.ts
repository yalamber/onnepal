export interface DiscussionCategory {
  name: string;
  slug: string;
}

export const DISCUSSION_CATEGORIES: DiscussionCategory[] = [
  { name: 'General', slug: 'general' },
  { name: 'Ask Nepal', slug: 'ask-nepal' },
  { name: 'Recommendations', slug: 'recommendations' },
  { name: 'News & Updates', slug: 'news-updates' },
  { name: 'Tech & Startups', slug: 'tech-startups' },
  { name: 'Food & Restaurants', slug: 'food-restaurants' },
  { name: 'Travel & Tourism', slug: 'travel-tourism' },
  { name: 'Sports', slug: 'sports' },
  { name: 'Entertainment', slug: 'entertainment' },
  { name: 'Tips & Advice', slug: 'tips-advice' },
];
