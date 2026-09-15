/**
 * Nepal's diplomatic missions abroad — embassies and consulates-general.
 *
 * Deliberately minimal per mission: name, city, country, official website.
 * We do NOT store street addresses, phone numbers, or opening hours — those
 * drift constantly and a stale phone number is worse than none. The card UI
 * always points people at the mission's own site for current contact details.
 *
 * Website domains follow MOFA's pattern ({cc}.nepalembassy.gov.np /
 * {code}.nepalconsulate.gov.np) and were each verified live in Sep 2026.
 * Missions without a working official site get `website: null` and the UI
 * falls back to the MOFA directory.
 *
 * Source of truth: Ministry of Foreign Affairs (mofa.gov.np). Re-verify when
 * Nepal opens or closes missions — additions in recent years include Lisbon
 * (2025), and the Dallas + San Francisco consulates-general (2025).
 */

export const MOFA_URL = 'https://mofa.gov.np';

export type MissionType = 'embassy' | 'consulate-general';

export type MissionRegion = 'Gulf & Middle East' | 'Asia-Pacific' | 'Europe' | 'Americas' | 'Africa';

export interface NepalMission {
  id: string;
  type: MissionType;
  /** Display name, e.g. "Embassy of Nepal, Doha" */
  name: string;
  city: string;
  country: string; // matches DiasporaCity.country spelling where the country overlaps
  flag: string;
  region: MissionRegion;
  website: string | null;
  /** Coverage worth surfacing, e.g. non-resident accreditations. */
  note?: string;
}

const E = (
  id: string, city: string, country: string, flag: string, region: MissionRegion,
  website: string | null, note?: string,
): NepalMission => ({
  id, type: 'embassy', name: `Embassy of Nepal, ${city}`, city, country, flag, region, website, ...(note ? { note } : {}),
});

const CG = (
  id: string, city: string, country: string, flag: string, region: MissionRegion,
  website: string | null, note?: string,
): NepalMission => ({
  id, type: 'consulate-general', name: `Consulate General of Nepal, ${city}`, city, country, flag, region, website, ...(note ? { note } : {}),
});

export const NEPAL_MISSIONS: NepalMission[] = [
  // Gulf & Middle East
  E('doha', 'Doha', 'Qatar', '🇶🇦', 'Gulf & Middle East', 'https://qa.nepalembassy.gov.np'),
  E('abu-dhabi', 'Abu Dhabi', 'UAE', '🇦🇪', 'Gulf & Middle East', 'https://ae.nepalembassy.gov.np'),
  CG('cg-dubai', 'Dubai', 'UAE', '🇦🇪', 'Gulf & Middle East', 'https://dxb.nepalconsulate.gov.np', 'Serves Dubai and the northern emirates.'),
  E('riyadh', 'Riyadh', 'Saudi Arabia', '🇸🇦', 'Gulf & Middle East', 'https://sa.nepalembassy.gov.np'),
  CG('cg-jeddah', 'Jeddah', 'Saudi Arabia', '🇸🇦', 'Gulf & Middle East', 'https://jed.nepalconsulate.gov.np', 'Serves the western region of Saudi Arabia.'),
  E('kuwait', 'Kuwait City', 'Kuwait', '🇰🇼', 'Gulf & Middle East', 'https://kw.nepalembassy.gov.np'),
  E('muscat', 'Muscat', 'Oman', '🇴🇲', 'Gulf & Middle East', 'https://om.nepalembassy.gov.np'),
  E('manama', 'Manama', 'Bahrain', '🇧🇭', 'Gulf & Middle East', 'https://bh.nepalembassy.gov.np'),
  E('tel-aviv', 'Tel Aviv', 'Israel', '🇮🇱', 'Gulf & Middle East', 'https://il.nepalembassy.gov.np'),

  // Asia-Pacific
  E('kuala-lumpur', 'Kuala Lumpur', 'Malaysia', '🇲🇾', 'Asia-Pacific', 'https://my.nepalembassy.gov.np'),
  E('bangkok', 'Bangkok', 'Thailand', '🇹🇭', 'Asia-Pacific', 'https://th.nepalembassy.gov.np', 'Also accredited to Singapore, Brunei, Cambodia, and Laos.'),
  E('tokyo', 'Tokyo', 'Japan', '🇯🇵', 'Asia-Pacific', 'https://jp.nepalembassy.gov.np'),
  E('seoul', 'Seoul', 'South Korea', '🇰🇷', 'Asia-Pacific', 'https://kr.nepalembassy.gov.np'),
  E('new-delhi', 'New Delhi', 'India', '🇮🇳', 'Asia-Pacific', 'https://in.nepalembassy.gov.np'),
  CG('cg-kolkata', 'Kolkata', 'India', '🇮🇳', 'Asia-Pacific', null),
  E('dhaka', 'Dhaka', 'Bangladesh', '🇧🇩', 'Asia-Pacific', 'https://bd.nepalembassy.gov.np'),
  E('islamabad', 'Islamabad', 'Pakistan', '🇵🇰', 'Asia-Pacific', 'https://pk.nepalembassy.gov.np'),
  E('colombo', 'Colombo', 'Sri Lanka', '🇱🇰', 'Asia-Pacific', 'https://lk.nepalembassy.gov.np'),
  E('yangon', 'Yangon', 'Myanmar', '🇲🇲', 'Asia-Pacific', 'https://mm.nepalembassy.gov.np'),
  E('beijing', 'Beijing', 'China', '🇨🇳', 'Asia-Pacific', 'https://cn.nepalembassy.gov.np'),
  CG('cg-hong-kong', 'Hong Kong', 'Hong Kong', '🇭🇰', 'Asia-Pacific', 'https://hkg.nepalconsulate.gov.np', 'Serves Hong Kong and Macau.'),
  CG('cg-lhasa', 'Lhasa', 'China', '🇨🇳', 'Asia-Pacific', null),
  CG('cg-chengdu', 'Chengdu', 'China', '🇨🇳', 'Asia-Pacific', null),
  CG('cg-guangzhou', 'Guangzhou', 'China', '🇨🇳', 'Asia-Pacific', null),
  E('canberra', 'Canberra', 'Australia', '🇦🇺', 'Asia-Pacific', 'https://au.nepalembassy.gov.np', 'Honorary consuls serve several state capitals — see the embassy site.'),

  // Europe
  E('london', 'London', 'UK', '🇬🇧', 'Europe', 'https://uk.nepalembassy.gov.np'),
  E('berlin', 'Berlin', 'Germany', '🇩🇪', 'Europe', 'https://de.nepalembassy.gov.np'),
  E('paris', 'Paris', 'France', '🇫🇷', 'Europe', 'https://fr.nepalembassy.gov.np'),
  E('brussels', 'Brussels', 'Belgium', '🇧🇪', 'Europe', 'https://be.nepalembassy.gov.np'),
  E('vienna', 'Vienna', 'Austria', '🇦🇹', 'Europe', 'https://at.nepalembassy.gov.np'),
  E('copenhagen', 'Copenhagen', 'Denmark', '🇩🇰', 'Europe', 'https://dk.nepalembassy.gov.np'),
  E('madrid', 'Madrid', 'Spain', '🇪🇸', 'Europe', null),
  E('lisbon', 'Lisbon', 'Portugal', '🇵🇹', 'Europe', 'https://pt.nepalembassy.gov.np'),
  E('moscow', 'Moscow', 'Russia', '🇷🇺', 'Europe', 'https://ru.nepalembassy.gov.np'),

  // Americas
  E('washington', 'Washington DC', 'USA', '🇺🇸', 'Americas', 'https://us.nepalembassy.gov.np'),
  CG('cg-new-york', 'New York', 'USA', '🇺🇸', 'Americas', 'https://nyc.nepalconsulate.gov.np', 'Serves the northeastern United States.'),
  CG('cg-dallas', 'Dallas', 'USA', '🇺🇸', 'Americas', 'https://dls.nepalconsulate.gov.np', 'Serves Texas and neighboring states.'),
  CG('cg-san-francisco', 'San Francisco', 'USA', '🇺🇸', 'Americas', 'https://sf.nepalconsulate.gov.np', 'Serves the western United States.'),
  E('ottawa', 'Ottawa', 'Canada', '🇨🇦', 'Americas', 'https://ca.nepalembassy.gov.np'),
  E('brasilia', 'Brasília', 'Brazil', '🇧🇷', 'Americas', 'https://br.nepalembassy.gov.np'),

  // Africa
  E('cairo', 'Cairo', 'Egypt', '🇪🇬', 'Africa', 'https://eg.nepalembassy.gov.np'),
  E('pretoria', 'Pretoria', 'South Africa', '🇿🇦', 'Africa', 'https://za.nepalembassy.gov.np'),
];

export const MISSION_REGIONS: MissionRegion[] = [
  'Gulf & Middle East', 'Asia-Pacific', 'Europe', 'Americas', 'Africa',
];

const BY_ID = new Map(NEPAL_MISSIONS.map((m) => [m.id, m]));

/**
 * Which mission(s) serve a given diaspora city, most relevant first.
 * Default is the embassy for the city's country; cities with a local
 * consulate-general (Dubai, Jeddah, New York, Dallas, Hong Kong) lead with
 * it, and cities whose country has no resident mission (Singapore) map to
 * the accredited embassy.
 */
const CITY_MISSIONS: Record<string, string[]> = {
  'doha': ['doha'],
  'dubai': ['cg-dubai', 'abu-dhabi'],
  'abu-dhabi': ['abu-dhabi'],
  'riyadh': ['riyadh'],
  'jeddah': ['cg-jeddah', 'riyadh'],
  'kuwait-city': ['kuwait'],
  'muscat': ['muscat'],
  'manama': ['manama'],
  'kuala-lumpur': ['kuala-lumpur'],
  'singapore': ['bangkok'],
  'hong-kong': ['cg-hong-kong'],
  'tokyo': ['tokyo'],
  'seoul': ['seoul'],
  'new-delhi': ['new-delhi'],
  'london': ['london'],
  'aldershot': ['london'],
  'lisbon': ['lisbon'],
  'new-york': ['cg-new-york', 'washington'],
  'boston': ['cg-new-york', 'washington'],
  'dallas': ['cg-dallas', 'washington'],
  'toronto': ['ottawa'],
  'sydney': ['canberra'],
  'melbourne': ['canberra'],
  'brisbane': ['canberra'],
};

export function missionsForDiasporaCity(slug: string): NepalMission[] {
  const ids = CITY_MISSIONS[slug];
  if (!ids) return [];
  return ids.map((id) => BY_ID.get(id)).filter((m): m is NepalMission => Boolean(m));
}
