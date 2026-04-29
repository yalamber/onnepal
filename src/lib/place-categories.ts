export interface PlaceCategory {
  name: string;
  slug: string;
}

export const PLACE_CATEGORIES: PlaceCategory[] = [
  { name: 'Temples & Shrines', slug: 'temples-shrines' },
  { name: 'Trekking Trails', slug: 'trekking-trails' },
  { name: 'Lakes & Rivers', slug: 'lakes-rivers' },
  { name: 'Viewpoints', slug: 'viewpoints' },
  { name: 'Historical Sites', slug: 'historical-sites' },
  { name: 'National Parks', slug: 'national-parks' },
  { name: 'Caves', slug: 'caves' },
  { name: 'Waterfalls', slug: 'waterfalls' },
  { name: 'Hot Springs', slug: 'hot-springs' },
  { name: 'Cultural Sites', slug: 'cultural-sites' },
  { name: 'Markets & Bazaars', slug: 'markets-bazaars' },
  { name: 'Adventure Sports', slug: 'adventure-sports' },
];
