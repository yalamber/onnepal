/**
 * Fetchers for the "Nepal Numbers" snapshot: NRB forex, Kathmandu AQI +
 * weather (Open-Meteo), and best-effort gold/silver (FENEGOSIDA scrape).
 *
 * Each fetcher is isolated and returns null on any failure — the snapshot
 * stores whatever succeeded, and the UI omits missing tiles. Never let one
 * flaky upstream take down the whole strip.
 */

export interface ForexRate {
  iso3: string;
  name: string;
  unit: number;
  buy: number;
  sell: number;
}

export interface NepalNumbers {
  forex: { date: string; rates: ForexRate[] } | null;
  gold: { fineGoldTola: number; silverTola: number | null } | null;
  kathmandu: { aqi: number; pm25: number; tempC: number; weatherCode: number } | null;
}

const FETCH_TIMEOUT_MS = 8000;

function withTimeout(): { signal: AbortSignal } {
  return { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) };
}

const UA = { 'User-Agent': 'Mozilla/5.0 (compatible; OnNepalBot/1.0; +https://onnepal.com)' };

// Currencies we keep (NRB returns ~20; trim to the ones Nepalis + diaspora
// actually check: US/UK/EU/AU plus the big labor-destination currencies).
const KEEP_CURRENCIES = new Set(['USD', 'EUR', 'GBP', 'AUD', 'INR', 'AED', 'QAR', 'SAR', 'MYR', 'JPY', 'KRW', 'CAD']);

export async function fetchForex(now: Date): Promise<NepalNumbers['forex']> {
  try {
    const day = now.toISOString().slice(0, 10);
    const url = `https://www.nrb.org.np/api/forex/v1/rates?page=1&per_page=10&from=${day}&to=${day}`;
    const res = await fetch(url, withTimeout());
    if (!res.ok) throw new Error(`NRB ${res.status}`);
    const data = (await res.json()) as {
      data?: { payload?: Array<{ date: string; rates: Array<{ currency: { iso3: string; name: string; unit: number }; buy: string; sell: string }> }> };
    };
    let payload = data.data?.payload?.[0];
    if (!payload || !payload.rates?.length) {
      // Weekends/holidays can have no row for "today" — fall back to the
      // latest published day in the last week.
      const weekAgo = new Date(now.getTime() - 7 * 86_400_000).toISOString().slice(0, 10);
      const res2 = await fetch(`https://www.nrb.org.np/api/forex/v1/rates?page=1&per_page=10&from=${weekAgo}&to=${day}`, withTimeout());
      if (!res2.ok) throw new Error(`NRB fallback ${res2.status}`);
      const data2 = (await res2.json()) as typeof data;
      const days = data2.data?.payload ?? [];
      payload = days[days.length - 1];
    }
    if (!payload?.rates?.length) return null;
    const rates = payload.rates
      .filter((r) => KEEP_CURRENCIES.has(r.currency.iso3))
      .map((r) => ({
        iso3: r.currency.iso3,
        name: r.currency.name,
        unit: r.currency.unit,
        buy: Number(r.buy),
        sell: Number(r.sell),
      }))
      .filter((r) => Number.isFinite(r.sell) && r.sell > 0);
    return rates.length ? { date: payload.date, rates } : null;
  } catch (err) {
    console.error('[nepal-data] forex failed', err instanceof Error ? err.message : err);
    return null;
  }
}

export async function fetchGold(): Promise<NepalNumbers['gold']> {
  try {
    const res = await fetch('https://www.fenegosida.org/', { ...withTimeout(), headers: UA });
    if (!res.ok) throw new Error(`fenegosida ${res.status}`);
    const html = await res.text();
    // The homepage embeds Google-Charts data: first arrayToDataTable block is
    // gold [day, perTola, per10g], second is silver. Last row = most recent.
    const blocks = [...html.matchAll(/arrayToDataTable\(\[\s*\[[^\]]*\]\s*,([\s\S]*?)\]\)/g)];
    const lastRow = (blockBody: string): number[] | null => {
      const rows = [...blockBody.matchAll(/\['[^']*',([\d.]+),([\d.]+)\]/g)];
      if (!rows.length) return null;
      const last = rows[rows.length - 1];
      return [Number(last[1]), Number(last[2])];
    };
    const gold = blocks[0] ? lastRow(blocks[0][1]) : null;
    const silver = blocks[1] ? lastRow(blocks[1][1]) : null;
    // Sanity bounds: gold per tola should be 6 digits (Rs 100k–999k for the
    // foreseeable future); reject parses that fall outside.
    if (!gold || gold[0] < 50_000 || gold[0] > 2_000_000) return null;
    return {
      fineGoldTola: gold[0],
      silverTola: silver && silver[0] > 500 && silver[0] < 100_000 ? silver[0] : null,
    };
  } catch (err) {
    console.error('[nepal-data] gold failed', err instanceof Error ? err.message : err);
    return null;
  }
}

export async function fetchKathmanduAir(): Promise<NepalNumbers['kathmandu']> {
  try {
    const [aqiRes, wxRes] = await Promise.all([
      fetch('https://air-quality-api.open-meteo.com/v1/air-quality?latitude=27.7172&longitude=85.3240&current=us_aqi,pm2_5&timezone=Asia%2FKathmandu', withTimeout()),
      fetch('https://api.open-meteo.com/v1/forecast?latitude=27.7172&longitude=85.3240&current=temperature_2m,weather_code&timezone=Asia%2FKathmandu', withTimeout()),
    ]);
    if (!aqiRes.ok || !wxRes.ok) throw new Error(`open-meteo ${aqiRes.status}/${wxRes.status}`);
    const aqi = (await aqiRes.json()) as { current?: { us_aqi?: number; pm2_5?: number } };
    const wx = (await wxRes.json()) as { current?: { temperature_2m?: number; weather_code?: number } };
    if (aqi.current?.us_aqi == null || wx.current?.temperature_2m == null) return null;
    return {
      aqi: Math.round(aqi.current.us_aqi),
      pm25: aqi.current.pm2_5 ?? 0,
      tempC: Math.round(wx.current.temperature_2m * 10) / 10,
      weatherCode: wx.current.weather_code ?? 0,
    };
  } catch (err) {
    console.error('[nepal-data] kathmandu air failed', err instanceof Error ? err.message : err);
    return null;
  }
}

export async function fetchNepalNumbers(now: Date): Promise<NepalNumbers> {
  const [forex, gold, kathmandu] = await Promise.all([
    fetchForex(now),
    fetchGold(),
    fetchKathmanduAir(),
  ]);
  return { forex, gold, kathmandu };
}

/** US-AQI bands → label + tone used by the UI. */
export function aqiLabel(aqi: number): { label: string; tone: 'good' | 'moderate' | 'bad' } {
  if (aqi <= 50) return { label: 'Good', tone: 'good' };
  if (aqi <= 100) return { label: 'Moderate', tone: 'moderate' };
  if (aqi <= 150) return { label: 'Unhealthy (sensitive)', tone: 'bad' };
  if (aqi <= 200) return { label: 'Unhealthy', tone: 'bad' };
  return { label: 'Hazardous', tone: 'bad' };
}
