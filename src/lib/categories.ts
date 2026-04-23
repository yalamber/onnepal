export interface SubCategory {
  name: string;
  slug: string;
}

export interface Category {
  name: string;
  slug: string;
  subcategories: SubCategory[];
}

export const CATEGORIES: Category[] = [
  {
    name: 'Food & Dining',
    slug: 'food-dining',
    subcategories: [
      { name: 'Restaurant', slug: 'restaurant' },
      { name: 'Cafe & Bakery', slug: 'cafe-bakery' },
      { name: 'Fast Food', slug: 'fast-food' },
      { name: 'Catering', slug: 'catering' },
      { name: 'Bar & Lounge', slug: 'bar-lounge' },
    ],
  },
  {
    name: 'Shopping & Retail',
    slug: 'shopping-retail',
    subcategories: [
      { name: 'Grocery', slug: 'grocery' },
      { name: 'Clothing & Fashion', slug: 'clothing-fashion' },
      { name: 'Electronics Store', slug: 'electronics-store' },
      { name: 'Hardware & Tools', slug: 'hardware-tools' },
      { name: 'Stationery & Books', slug: 'stationery-books' },
      { name: 'General Store', slug: 'general-store' },
    ],
  },
  {
    name: 'Beauty & Wellness',
    slug: 'beauty-wellness',
    subcategories: [
      { name: 'Salon & Spa', slug: 'salon-spa' },
      { name: 'Gym & Fitness', slug: 'gym-fitness' },
      { name: 'Yoga & Meditation', slug: 'yoga-meditation' },
      { name: 'Ayurveda & Wellness', slug: 'ayurveda-wellness' },
    ],
  },
  {
    name: 'Hotel & Travel',
    slug: 'hotel-travel',
    subcategories: [
      { name: 'Hotel & Resort', slug: 'hotel-resort' },
      { name: 'Homestay & Lodge', slug: 'homestay-lodge' },
      { name: 'Travel Agency', slug: 'travel-agency' },
      { name: 'Trekking & Tours', slug: 'trekking-tours' },
    ],
  },
  {
    name: 'Education',
    slug: 'education',
    subcategories: [
      { name: 'School', slug: 'school' },
      { name: 'College & University', slug: 'college-university' },
      { name: 'Training Institute', slug: 'training-institute' },
      { name: 'Tuition & Coaching', slug: 'tuition-coaching' },
      { name: 'Language School', slug: 'language-school' },
    ],
  },
  {
    name: 'Health & Medical',
    slug: 'health-medical',
    subcategories: [
      { name: 'Hospital & Clinic', slug: 'hospital-clinic' },
      { name: 'Pharmacy', slug: 'pharmacy' },
      { name: 'Dental', slug: 'dental' },
      { name: 'Eye Care', slug: 'eye-care' },
      { name: 'Veterinary', slug: 'veterinary' },
    ],
  },
  {
    name: 'Technology',
    slug: 'technology',
    subcategories: [
      { name: 'IT & Software', slug: 'it-software' },
      { name: 'Computer Repair', slug: 'computer-repair' },
      { name: 'Mobile Repair', slug: 'mobile-repair' },
      { name: 'Web & Design', slug: 'web-design' },
      { name: 'ISP & Telecom', slug: 'isp-telecom' },
    ],
  },
  {
    name: 'Construction & Home',
    slug: 'construction-home',
    subcategories: [
      { name: 'Construction', slug: 'construction' },
      { name: 'Interior Design', slug: 'interior-design' },
      { name: 'Plumbing', slug: 'plumbing' },
      { name: 'Electrical', slug: 'electrical' },
      { name: 'Architecture', slug: 'architecture' },
      { name: 'Real Estate Agency', slug: 'real-estate-agency' },
    ],
  },
  {
    name: 'Professional Services',
    slug: 'professional-services',
    subcategories: [
      { name: 'Legal & Law', slug: 'legal-law' },
      { name: 'Accounting & Tax', slug: 'accounting-tax' },
      { name: 'Consulting', slug: 'consulting' },
      { name: 'Insurance', slug: 'insurance' },
      { name: 'Banking & Finance', slug: 'banking-finance' },
    ],
  },
  {
    name: 'Automobile',
    slug: 'automobile',
    subcategories: [
      { name: 'Car Dealer', slug: 'car-dealer' },
      { name: 'Motorcycle Dealer', slug: 'motorcycle-dealer' },
      { name: 'Auto Repair', slug: 'auto-repair' },
      { name: 'Car Wash', slug: 'car-wash' },
      { name: 'Spare Parts', slug: 'spare-parts' },
    ],
  },
  {
    name: 'Agriculture',
    slug: 'agriculture',
    subcategories: [
      { name: 'Farm & Nursery', slug: 'farm-nursery' },
      { name: 'Seeds & Fertilizer', slug: 'seeds-fertilizer' },
      { name: 'Dairy & Poultry', slug: 'dairy-poultry' },
      { name: 'Agricultural Equipment', slug: 'agricultural-equipment' },
    ],
  },
  {
    name: 'Media & Events',
    slug: 'media-events',
    subcategories: [
      { name: 'Photography', slug: 'photography' },
      { name: 'Videography', slug: 'videography' },
      { name: 'Event Planning', slug: 'event-planning' },
      { name: 'Printing & Graphics', slug: 'printing-graphics' },
      { name: 'Advertising', slug: 'advertising' },
    ],
  },
  {
    name: 'Other',
    slug: 'other',
    subcategories: [
      { name: 'NGO & Non-Profit', slug: 'ngo-non-profit' },
      { name: 'Religious & Spiritual', slug: 'religious-spiritual' },
      { name: 'Government Office', slug: 'government-office' },
      { name: 'Other', slug: 'other' },
    ],
  },
];

export function getAllSubcategories(): SubCategory[] {
  return CATEGORIES.flatMap((c) => c.subcategories);
}

export function getCategoryBySlug(slug: string): Category | null {
  return CATEGORIES.find((c) => c.slug === slug) || null;
}

export function getSubcategoryBySlug(slug: string): { parent: Category; sub: SubCategory } | null {
  for (const cat of CATEGORIES) {
    const sub = cat.subcategories.find((s) => s.slug === slug);
    if (sub) return { parent: cat, sub };
  }
  return null;
}

export function getCategoryForName(name: string): { parent: Category; sub: SubCategory } | null {
  for (const cat of CATEGORIES) {
    const sub = cat.subcategories.find((s) => s.name === name);
    if (sub) return { parent: cat, sub };
  }
  return null;
}

export function getSlugFromName(name: string): string {
  const result = getCategoryForName(name);
  if (result) return result.sub.slug;
  const parent = CATEGORIES.find((c) => c.name === name);
  if (parent) return parent.slug;
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
