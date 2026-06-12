export interface City {
  name: string;
  slug: string;
}

export const NEPAL_CITIES: City[] = [
  { name: 'Kathmandu', slug: 'kathmandu' },
  { name: 'Pokhara', slug: 'pokhara' },
  { name: 'Lalitpur', slug: 'lalitpur' },
  { name: 'Bhaktapur', slug: 'bhaktapur' },
  { name: 'Biratnagar', slug: 'biratnagar' },
  { name: 'Birgunj', slug: 'birgunj' },
  { name: 'Bharatpur', slug: 'bharatpur' },
  { name: 'Butwal', slug: 'butwal' },
  { name: 'Dharan', slug: 'dharan' },
  { name: 'Hetauda', slug: 'hetauda' },
  { name: 'Janakpur', slug: 'janakpur' },
  { name: 'Nepalgunj', slug: 'nepalgunj' },
  { name: 'Dhangadhi', slug: 'dhangadhi' },
  { name: 'Itahari', slug: 'itahari' },
  { name: 'Damak', slug: 'damak' },
  { name: 'Tulsipur', slug: 'tulsipur' },
  { name: 'Ghorahi', slug: 'ghorahi' },
  { name: 'Siddharthanagar', slug: 'siddharthanagar' },
  { name: 'Kirtipur', slug: 'kirtipur' },
  { name: 'Lumbini', slug: 'lumbini' },
  { name: 'Tansen', slug: 'tansen' },
  { name: 'Gorkha', slug: 'gorkha' },
  { name: 'Damauli', slug: 'damauli' },
  { name: 'Baglung', slug: 'baglung' },
  { name: 'Ilam', slug: 'ilam' },
  { name: 'Dhankuta', slug: 'dhankuta' },
  { name: 'Rajbiraj', slug: 'rajbiraj' },
  { name: 'Lahan', slug: 'lahan' },
  { name: 'Gaur', slug: 'gaur' },
  { name: 'Kalaiya', slug: 'kalaiya' },
  { name: 'Mechinagar', slug: 'mechinagar' },
  { name: 'Banepa', slug: 'banepa' },
  { name: 'Dhulikhel', slug: 'dhulikhel' },
  { name: 'Thamel', slug: 'thamel' },
  { name: 'Patan', slug: 'patan' },
  { name: 'Namche Bazaar', slug: 'namche-bazaar' },
  { name: 'Lukla', slug: 'lukla' },
  { name: 'Chitwan', slug: 'chitwan' },
  { name: 'Manang', slug: 'manang' },
  { name: 'Mustang', slug: 'mustang' },
  { name: 'Jomsom', slug: 'jomsom' },
  { name: 'Nagarkot', slug: 'nagarkot' },
  { name: 'Bandipur', slug: 'bandipur' },
  { name: 'Daman', slug: 'daman' },
  { name: 'Besisahar', slug: 'besisahar' },
  { name: 'Tatopani', slug: 'tatopani' },
  { name: 'Jumla', slug: 'jumla' },
  { name: 'Surkhet', slug: 'surkhet' },
  { name: 'Dailekh', slug: 'dailekh' },
  { name: 'Darchula', slug: 'darchula' },
  { name: 'Mahendranagar', slug: 'mahendranagar' },
  { name: 'Tikapur', slug: 'tikapur' },
  { name: 'Bhadrapur', slug: 'bhadrapur' },
  { name: 'Birtamod', slug: 'birtamod' },
  { name: 'Inaruwa', slug: 'inaruwa' },
  { name: 'Charikot', slug: 'charikot' },
  { name: 'Bidur', slug: 'bidur' },
  { name: 'Malangwa', slug: 'malangwa' },
  { name: 'Lekhnath', slug: 'lekhnath' },
  { name: 'Waling', slug: 'waling' },
  { name: 'Palpa', slug: 'palpa' },
  { name: 'Kapilvastu', slug: 'kapilvastu' },
  { name: 'Dang', slug: 'dang' },
  { name: 'Bardiya', slug: 'bardiya' },
  { name: 'Solukhumbu', slug: 'solukhumbu' },
];

// ---- Diaspora ---------------------------------------------------------------

export interface DiasporaCity extends City {
  country: string;
  flag: string; // emoji
}

/**
 * Cities abroad with significant Nepali communities. Same shape as City so
 * everything downstream (selectors, validators, /city/<slug> pages, content
 * city columns) treats them uniformly; `country`/`flag` add display context.
 *
 * Curated around where Nepalis actually live and work: the Gulf labor
 * corridor, Malaysia/East Asia, the Gurkha towns in the UK, and the big
 * student/PR destinations in the US/Canada/Australia.
 */
export const DIASPORA_CITIES: DiasporaCity[] = [
  // Gulf
  { name: 'Doha', slug: 'doha', country: 'Qatar', flag: '🇶🇦' },
  { name: 'Dubai', slug: 'dubai', country: 'UAE', flag: '🇦🇪' },
  { name: 'Abu Dhabi', slug: 'abu-dhabi', country: 'UAE', flag: '🇦🇪' },
  { name: 'Riyadh', slug: 'riyadh', country: 'Saudi Arabia', flag: '🇸🇦' },
  { name: 'Jeddah', slug: 'jeddah', country: 'Saudi Arabia', flag: '🇸🇦' },
  { name: 'Kuwait City', slug: 'kuwait-city', country: 'Kuwait', flag: '🇰🇼' },
  { name: 'Muscat', slug: 'muscat', country: 'Oman', flag: '🇴🇲' },
  { name: 'Manama', slug: 'manama', country: 'Bahrain', flag: '🇧🇭' },
  // Asia-Pacific
  { name: 'Kuala Lumpur', slug: 'kuala-lumpur', country: 'Malaysia', flag: '🇲🇾' },
  { name: 'Singapore', slug: 'singapore', country: 'Singapore', flag: '🇸🇬' },
  { name: 'Hong Kong', slug: 'hong-kong', country: 'Hong Kong', flag: '🇭🇰' },
  { name: 'Tokyo', slug: 'tokyo', country: 'Japan', flag: '🇯🇵' },
  { name: 'Seoul', slug: 'seoul', country: 'South Korea', flag: '🇰🇷' },
  { name: 'New Delhi', slug: 'new-delhi', country: 'India', flag: '🇮🇳' },
  // Europe
  { name: 'London', slug: 'london', country: 'UK', flag: '🇬🇧' },
  { name: 'Aldershot', slug: 'aldershot', country: 'UK', flag: '🇬🇧' },
  { name: 'Lisbon', slug: 'lisbon', country: 'Portugal', flag: '🇵🇹' },
  // Americas
  { name: 'New York', slug: 'new-york', country: 'USA', flag: '🇺🇸' },
  { name: 'Boston', slug: 'boston', country: 'USA', flag: '🇺🇸' },
  { name: 'Dallas', slug: 'dallas', country: 'USA', flag: '🇺🇸' },
  { name: 'Toronto', slug: 'toronto', country: 'Canada', flag: '🇨🇦' },
  // Australia
  { name: 'Sydney', slug: 'sydney', country: 'Australia', flag: '🇦🇺' },
  { name: 'Melbourne', slug: 'melbourne', country: 'Australia', flag: '🇦🇺' },
  { name: 'Brisbane', slug: 'brisbane', country: 'Australia', flag: '🇦🇺' },
];

/** Nepal + diaspora, the full allowed-city universe for content + filters. */
export const ALL_CITIES: City[] = [...NEPAL_CITIES, ...DIASPORA_CITIES];

const DIASPORA_BY_NAME = new Map(DIASPORA_CITIES.map((c) => [c.name.toLowerCase(), c]));
const DIASPORA_BY_SLUG = new Map(DIASPORA_CITIES.map((c) => [c.slug, c]));

export function diasporaCityByName(name: string): DiasporaCity | null {
  return DIASPORA_BY_NAME.get(name.toLowerCase()) ?? null;
}

export function diasporaCityBySlug(slug: string): DiasporaCity | null {
  return DIASPORA_BY_SLUG.get(slug) ?? null;
}
