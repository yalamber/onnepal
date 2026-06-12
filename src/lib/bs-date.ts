import NepaliDate from 'nepali-date-converter';

/**
 * Bikram Sambat "today" for Nepal, regardless of where the worker runs.
 *
 * Two steps:
 *  1. Resolve the current civil date in Asia/Kathmandu (UTC+5:45) via Intl —
 *     workerd ships full ICU so the named timezone works.
 *  2. Convert that AD date to BS via nepali-date-converter (lookup-table
 *     based; verified against the panchang for the 2083 cycle).
 */

export interface BsToday {
  year: number;        // e.g. 2083
  monthIndex: number;  // 0-based (0 = Baisakh)
  day: number;
  /** "जेठ २९, २०८३" */
  np: string;
  /** "Jestha 29, 2083" */
  en: string;
}

const NP_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];

function toNpDigits(n: number): string {
  return String(n).split('').map((c) => (/\d/.test(c) ? NP_DIGITS[Number(c)] : c)).join('');
}

const BS_MONTHS_EN = ['Baisakh', 'Jestha', 'Ashadh', 'Shrawan', 'Bhadra', 'Ashwin', 'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'];
const BS_MONTHS_NP = ['वैशाख', 'जेठ', 'असार', 'साउन', 'भदौ', 'असोज', 'कात्तिक', 'मंसिर', 'पुस', 'माघ', 'फागुन', 'चैत'];

function kathmanduDateParts(now: Date): { y: number; m: number; d: number } {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kathmandu',
    year: 'numeric', month: '2-digit', day: '2-digit',
  });
  const [y, m, d] = fmt.format(now).split('-').map(Number);
  return { y, m, d };
}

export function bsToday(now: Date): BsToday | null {
  try {
    const { y, m, d } = kathmanduDateParts(now);
    // NepaliDate AD constructor takes a JS Date; build one at UTC noon for the
    // KTM civil date so no timezone math can shift the day.
    const nd = new NepaliDate(new Date(Date.UTC(y, m - 1, d, 12)));
    const year = nd.getYear();
    const monthIndex = nd.getMonth();
    const day = nd.getDate();
    return {
      year,
      monthIndex,
      day,
      np: `${BS_MONTHS_NP[monthIndex]} ${toNpDigits(day)}, ${toNpDigits(year)}`,
      en: `${BS_MONTHS_EN[monthIndex]} ${day}, ${year}`,
    };
  } catch (err) {
    // Out-of-range years (the converter's table ends around 2090 BS) or any
    // ICU hiccup — the UI just omits the BS date.
    console.error('[bs-date] conversion failed', err);
    return null;
  }
}
