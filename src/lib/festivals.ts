/**
 * Nepali festival calendar — drives the festival countdown in the "Today in
 * Nepal" homepage card and (later) /festival/<slug> hub pages.
 *
 * IMPORTANT: Nepali festivals follow the lunar Bikram Sambat calendar, so the
 * Gregorian dates below shift every year and MUST be verified against a proper
 * panchang before each year rolls over. The dates here are best-effort for the
 * 2026 and 2027 cycles. Treat them as data, not gospel — correcting a date is
 * a one-line edit. A future improvement is to source these from an API or a
 * yearly-reviewed JSON file rather than inlining.
 *
 * `date` is the primary/headline day in ISO (YYYY-MM-DD). `endDate` marks
 * multi-day festivals so the card can say "on now" across the span.
 */

export interface Festival {
  slug: string;
  name: string;
  nepaliName: string;       // Devanagari
  emoji: string;
  date: string;             // YYYY-MM-DD — headline day
  endDate?: string;         // YYYY-MM-DD — last day, if multi-day
  blurb: string;            // one line, shown in the card
  /** Search terms to match events/voices to this festival on hub pages later. */
  keywords: string[];
}

// Ordered ascending by date. Keep it that way — helpers assume sorted input.
export const FESTIVALS: Festival[] = [
  {
    slug: 'sithi-nakha',
    name: 'Sithi Nakha',
    nepaliName: 'सिथि नखः',
    emoji: '💧',
    date: '2026-05-26',
    blurb: 'Newar festival honoring Kumar and cleaning the valley’s wells and ponds.',
    keywords: ['sithi', 'nakha', 'kumar', 'well'],
  },
  {
    slug: 'ubhauli',
    name: 'Ubhauli',
    nepaliName: 'उभौली',
    emoji: '🌾',
    date: '2026-05-31',
    blurb: 'Kirat festival welcoming the planting season with the Sakela dance.',
    keywords: ['ubhauli', 'sakela', 'kirat'],
  },
  {
    slug: 'janai-purnima',
    name: 'Janai Purnima',
    nepaliName: 'जनै पूर्णिमा',
    emoji: '🧵',
    date: '2026-08-28',
    blurb: 'Sacred-thread day — Raksha Bandhan, the rakhi, and a dip at Gosaikunda.',
    keywords: ['janai', 'purnima', 'rakhi', 'raksha bandhan', 'gosaikunda'],
  },
  {
    slug: 'gai-jatra',
    name: 'Gai Jatra',
    nepaliName: 'गाई जात्रा',
    emoji: '🐄',
    date: '2026-08-29',
    blurb: 'The cow procession — remembrance, satire, and street theatre in the valley.',
    keywords: ['gai jatra', 'cow', 'procession'],
  },
  {
    slug: 'krishna-janmashtami',
    name: 'Krishna Janmashtami',
    nepaliName: 'कृष्ण जन्माष्टमी',
    emoji: '🪈',
    date: '2026-09-04',
    blurb: 'Krishna’s birthday — night vigils at Patan’s Krishna Mandir.',
    keywords: ['krishna', 'janmashtami'],
  },
  {
    slug: 'teej',
    name: 'Teej',
    nepaliName: 'तीज',
    emoji: '❤️',
    date: '2026-09-14',
    blurb: 'Women’s festival of red saris, fasting, and dance for Shiva.',
    keywords: ['teej', 'haritalika', 'red sari'],
  },
  {
    slug: 'indra-jatra',
    name: 'Indra Jatra',
    nepaliName: 'इन्द्र जात्रा',
    emoji: '🎭',
    date: '2026-09-25',
    endDate: '2026-10-02',
    blurb: 'The living goddess Kumari rides, masked dances fill the old city.',
    keywords: ['indra jatra', 'kumari', 'lakhe', 'pulukisi'],
  },
  {
    slug: 'dashain',
    name: 'Dashain',
    nepaliName: 'दशैं',
    emoji: '🌺',
    date: '2026-10-20',          // Vijaya Dashami (the big tika day)
    endDate: '2026-10-22',
    blurb: 'Nepal’s biggest festival — tika, jamara, kites, and homecomings.',
    keywords: ['dashain', 'vijaya dashami', 'tika', 'jamara'],
  },
  {
    slug: 'tihar',
    name: 'Tihar',
    nepaliName: 'तिहार',
    emoji: '🪔',
    date: '2026-11-08',          // Laxmi Puja
    endDate: '2026-11-11',       // Bhai Tika
    blurb: 'The festival of lights — diyas, rangoli, dogs, crows, and Bhai Tika.',
    keywords: ['tihar', 'deepawali', 'laxmi puja', 'bhai tika', 'deusi bhailo'],
  },
  {
    slug: 'chhath',
    name: 'Chhath',
    nepaliName: 'छठ',
    emoji: '🌅',
    date: '2026-11-15',
    blurb: 'Sun worship on the riverbanks of the Tarai — offerings at dawn and dusk.',
    keywords: ['chhath', 'surya', 'tarai', 'mithila'],
  },
  {
    slug: 'tamu-lhosar',
    name: 'Tamu Lhosar',
    nepaliName: 'तमु ल्होसार',
    emoji: '🏔️',
    date: '2026-12-30',
    blurb: 'Gurung new year — community feasts, song, and the changing of the animal year.',
    keywords: ['tamu lhosar', 'gurung', 'new year'],
  },
  {
    slug: 'maghe-sankranti',
    name: 'Maghe Sankranti',
    nepaliName: 'माघे संक्रान्ति',
    emoji: '🍠',
    date: '2027-01-15',
    blurb: 'Midwinter turning point — til ko laddu, ghee, yam, and a holy dip.',
    keywords: ['maghe sankranti', 'makar', 'til'],
  },
  {
    slug: 'sonam-lhosar',
    name: 'Sonam Lhosar',
    nepaliName: 'सोनाम ल्होसार',
    emoji: '🎉',
    date: '2027-02-07',
    blurb: 'Tamang new year — dance, drums, and the Damphu.',
    keywords: ['sonam lhosar', 'tamang'],
  },
  {
    slug: 'gyalpo-lhosar',
    name: 'Gyalpo Lhosar',
    nepaliName: 'ग्याल्पो ल्होसार',
    emoji: '🏔️',
    date: '2027-02-19',
    blurb: 'Sherpa & Tibetan new year — celebrated in the high Himalaya and Boudha.',
    keywords: ['gyalpo lhosar', 'sherpa', 'tibetan new year'],
  },
  {
    slug: 'holi',
    name: 'Holi',
    nepaliName: 'होली',
    emoji: '🎨',
    date: '2027-03-22',
    blurb: 'Festival of colors — water balloons, powder, and music in the streets.',
    keywords: ['holi', 'fagu purnima', 'colors'],
  },
  {
    slug: 'ghode-jatra',
    name: 'Ghode Jatra',
    nepaliName: 'घोडे जात्रा',
    emoji: '🐎',
    date: '2027-03-28',
    blurb: 'The horse festival — cavalry parade on Tundikhel, Kathmandu.',
    keywords: ['ghode jatra', 'horse', 'tundikhel'],
  },
  {
    slug: 'bisket-jatra',
    name: 'Bisket Jatra',
    nepaliName: 'बिस्केट जात्रा',
    emoji: '🛕',
    date: '2027-04-13',
    endDate: '2027-04-21',
    blurb: 'Bhaktapur’s new-year chariot pull and the great pole raising.',
    keywords: ['bisket jatra', 'bhaktapur', 'chariot', 'new year'],
  },
  {
    slug: 'nepali-new-year',
    name: 'Nepali New Year',
    nepaliName: 'नयाँ वर्ष',
    emoji: '🎆',
    date: '2027-04-14',
    blurb: 'Bikram Sambat new year — the calendar turns over across Nepal.',
    keywords: ['new year', 'naya barsha', 'bikram sambat'],
  },
];

export interface FestivalHint {
  festival: Festival;
  /** Days from `today` to the festival's headline date. 0 = today. */
  daysUntil: number;
  /** True if today falls within [date, endDate] (the festival is happening). */
  isOngoing: boolean;
}

function toUtcDay(iso: string): number {
  // Parse YYYY-MM-DD as a UTC midnight day-number (days since epoch).
  const [y, m, d] = iso.split('-').map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / 86_400_000);
}

/**
 * The civil date in Kathmandu for a given instant, as YYYY-MM-DD.
 * Festival dates are Nepal dates — counting down against the viewer's (or
 * the server's UTC) calendar day is off by one for evening users in the
 * Americas. UTC+5:45 has no DST, but we go through Intl anyway for clarity.
 */
export function kathmanduDayIso(now: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kathmandu',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(now);
}

/**
 * Return the festival to surface today, or null if none is within `windowDays`.
 * Prefers an ongoing festival; otherwise the soonest upcoming one.
 *
 * @param now      A Date (defaults supplied by caller; we avoid Date.now() here
 *                 so the function stays pure and testable).
 * @param windowDays  How far ahead to look. Default 120 — Nepal's calendar has
 *                    quiet stretches (notably June–July), and the big festivals
 *                    (Dashain, Tihar) are travel-planned months ahead, so a
 *                    long-range countdown is a feature, not noise.
 */
export function getFestivalHint(now: Date, windowDays = 120): FestivalHint | null {
  const todayIso = kathmanduDayIso(now);
  const today = toUtcDay(todayIso);

  let best: FestivalHint | null = null;
  for (const f of FESTIVALS) {
    const start = toUtcDay(f.date);
    const end = f.endDate ? toUtcDay(f.endDate) : start;
    const isOngoing = today >= start && today <= end;
    const daysUntil = start - today;

    if (isOngoing) {
      // Ongoing always wins — return immediately (list is date-sorted).
      return { festival: f, daysUntil: Math.max(0, daysUntil), isOngoing: true };
    }
    if (daysUntil >= 0 && daysUntil <= windowDays) {
      if (!best || daysUntil < best.daysUntil) {
        best = { festival: f, daysUntil, isOngoing: false };
      }
    }
  }
  return best;
}

/** Human countdown label, e.g. "Today", "Tomorrow", "in 5 days". */
export function countdownLabel(hint: FestivalHint): string {
  if (hint.isOngoing) return 'Happening now';
  if (hint.daysUntil === 0) return 'Today';
  if (hint.daysUntil === 1) return 'Tomorrow';
  return `in ${hint.daysUntil} days`;
}
