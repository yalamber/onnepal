export interface ServiceCategory {
  name: string;
  slug: string;
}

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  { name: 'Home Services', slug: 'home-services' },
  { name: 'Tutoring & Education', slug: 'tutoring-education' },
  { name: 'Repair & Maintenance', slug: 'repair-maintenance' },
  { name: 'Moving & Transport', slug: 'moving-transport' },
  { name: 'Event & Catering', slug: 'event-catering' },
  { name: 'Photography & Video', slug: 'photography-video' },
  { name: 'Health & Wellness', slug: 'health-wellness' },
  { name: 'IT & Tech Support', slug: 'it-tech-support' },
  { name: 'Beauty & Personal Care', slug: 'beauty-personal-care' },
  { name: 'Legal & Finance', slug: 'legal-finance' },
  { name: 'Construction & Renovation', slug: 'construction-renovation' },
  { name: 'Other Services', slug: 'other-services' },
];
