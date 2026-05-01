export interface ClassifiedSubCategory {
  name: string;
  slug: string;
}

export interface ClassifiedCategory {
  name: string;
  slug: string;
  subcategories: ClassifiedSubCategory[];
}

export const CLASSIFIED_CATEGORIES: ClassifiedCategory[] = [
  {
    name: 'Vehicles',
    slug: 'vehicles',
    subcategories: [
      { name: 'Cars', slug: 'cars' },
      { name: 'Motorcycles', slug: 'motorcycles' },
      { name: 'Scooters', slug: 'scooters' },
      { name: 'Trucks & Buses', slug: 'trucks-buses' },
      { name: 'Auto Parts', slug: 'auto-parts' },
      { name: 'Bicycles', slug: 'bicycles' },
    ],
  },
  {
    name: 'Electronics',
    slug: 'electronics',
    subcategories: [
      { name: 'Mobile Phones', slug: 'mobile-phones' },
      { name: 'Laptops & Computers', slug: 'laptops-computers' },
      { name: 'TVs & Audio', slug: 'tvs-audio' },
      { name: 'Cameras', slug: 'cameras' },
      { name: 'Gaming', slug: 'gaming' },
      { name: 'Accessories', slug: 'accessories' },
    ],
  },
  {
    name: 'Real Estate',
    slug: 'real-estate',
    subcategories: [
      { name: 'Houses for Sale', slug: 'houses-sale' },
      { name: 'Houses for Rent', slug: 'houses-rent' },
      { name: 'Apartments', slug: 'apartments' },
      { name: 'Land & Plots', slug: 'land-plots' },
      { name: 'Commercial Space', slug: 'commercial-space' },
      { name: 'Rooms & Flatmates', slug: 'rooms-flatmates' },
    ],
  },
  {
    name: 'Jobs',
    slug: 'jobs',
    subcategories: [
      { name: 'Full-time', slug: 'full-time' },
      { name: 'Part-time', slug: 'part-time' },
      { name: 'Freelance', slug: 'freelance' },
      { name: 'Internship', slug: 'internship' },
      { name: 'Work from Home', slug: 'work-from-home' },
    ],
  },
  {
    name: 'Furniture & Home',
    slug: 'furniture-home',
    subcategories: [
      { name: 'Furniture', slug: 'furniture' },
      { name: 'Home Appliances', slug: 'home-appliances' },
      { name: 'Kitchen & Dining', slug: 'kitchen-dining' },
      { name: 'Garden & Outdoor', slug: 'garden-outdoor' },
    ],
  },
  {
    name: 'Fashion & Beauty',
    slug: 'fashion-beauty',
    subcategories: [
      { name: 'Clothing', slug: 'clothing' },
      { name: 'Shoes & Bags', slug: 'shoes-bags' },
      { name: 'Jewellery & Watches', slug: 'jewellery-watches' },
      { name: 'Beauty Products', slug: 'beauty-products' },
    ],
  },
  {
    name: 'Education',
    slug: 'education',
    subcategories: [
      { name: 'Books & Stationery', slug: 'books-stationery' },
      { name: 'Courses & Classes', slug: 'courses-classes' },
      { name: 'Musical Instruments', slug: 'musical-instruments' },
    ],
  },
  {
    name: 'Sports & Hobbies',
    slug: 'sports-hobbies',
    subcategories: [
      { name: 'Sports Equipment', slug: 'sports-equipment' },
      { name: 'Fitness Equipment', slug: 'fitness-equipment' },
      { name: 'Camping & Outdoor', slug: 'camping-outdoor' },
      { name: 'Collectibles', slug: 'collectibles' },
    ],
  },
  {
    name: 'Pets & Animals',
    slug: 'pets-animals',
    subcategories: [
      { name: 'Dogs', slug: 'dogs' },
      { name: 'Cats', slug: 'cats' },
      { name: 'Birds', slug: 'birds' },
      { name: 'Fish & Aquarium', slug: 'fish-aquarium' },
      { name: 'Pet Supplies', slug: 'pet-supplies' },
    ],
  },
  {
    name: 'Food & Agriculture',
    slug: 'food-agriculture',
    subcategories: [
      { name: 'Fresh Produce', slug: 'fresh-produce' },
      { name: 'Livestock', slug: 'livestock' },
      { name: 'Seeds & Plants', slug: 'seeds-plants' },
      { name: 'Farm Equipment', slug: 'farm-equipment' },
    ],
  },
  {
    name: 'Other',
    slug: 'other',
    subcategories: [
      { name: 'Free Stuff', slug: 'free-stuff' },
      { name: 'Wanted', slug: 'wanted' },
      { name: 'Lost & Found', slug: 'lost-found' },
      { name: 'Other', slug: 'other' },
    ],
  },
];

export function getAllClassifiedSubcategories(): ClassifiedSubCategory[] {
  return CLASSIFIED_CATEGORIES.flatMap((c) => c.subcategories);
}

export function getClassifiedCategoryBySlug(slug: string): ClassifiedCategory | null {
  return CLASSIFIED_CATEGORIES.find((c) => c.slug === slug) || null;
}

export function getClassifiedSubcategoryBySlug(slug: string): { parent: ClassifiedCategory; sub: ClassifiedSubCategory } | null {
  for (const cat of CLASSIFIED_CATEGORIES) {
    const sub = cat.subcategories.find((s) => s.slug === slug);
    if (sub) return { parent: cat, sub };
  }
  return null;
}

export function getClassifiedCategoryForName(name: string): { parent: ClassifiedCategory; sub: ClassifiedSubCategory } | null {
  for (const cat of CLASSIFIED_CATEGORIES) {
    const sub = cat.subcategories.find((s) => s.name === name);
    if (sub) return { parent: cat, sub };
  }
  return null;
}

export function getClassifiedSlugFromName(name: string): string {
  const result = getClassifiedCategoryForName(name);
  if (result) return result.sub.slug;
  const parent = CLASSIFIED_CATEGORIES.find((c) => c.name === name);
  if (parent) return parent.slug;
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
