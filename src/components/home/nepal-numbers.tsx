import type { NumbersSnapshot } from '@/lib/db/queries/daily';
import type { BsToday } from '@/lib/bs-date';
import { aqiLabel } from '@/lib/nepal-data';

/**
 * The "Nepal Numbers" strip — the daily-check row: BS date, key forex rates,
 * gold, Kathmandu AQI + temperature. Server-rendered from the cached
 * snapshot; every chip is optional and omitted when its upstream is down.
 */

const STRIP_CURRENCIES = ['USD', 'GBP', 'EUR', 'AUD', 'AED', 'MYR'];

function formatNpr(n: number): string {
  return n.toLocaleString('en-IN'); // 2,92,000 lakh-style grouping feels native
}

export function NepalNumbers({ snapshot, bs }: { snapshot: NumbersSnapshot | null; bs: BsToday | null }) {
  const numbers = snapshot?.numbers;
  const chips: React.ReactNode[] = [];

  if (bs) {
    chips.push(
      <div key="bs" className="nn-chip nn-chip-date" title={bs.en}>
        <span className="nn-chip-label">आज</span>
        <span className="nn-chip-value t-deva">{bs.np}</span>
      </div>,
    );
  }

  if (numbers?.forex) {
    const bySym = new Map(numbers.forex.rates.map((r) => [r.iso3, r]));
    for (const sym of STRIP_CURRENCIES) {
      const r = bySym.get(sym);
      if (!r) continue;
      chips.push(
        <div key={sym} className="nn-chip" title={`${r.name} — NRB buy ${r.buy} / sell ${r.sell} (per ${r.unit})`}>
          <span className="nn-chip-label">{sym}{r.unit > 1 ? ` ${r.unit}` : ''}</span>
          <span className="nn-chip-value">रू {r.sell.toFixed(2)}</span>
        </div>,
      );
    }
  }

  if (numbers?.gold) {
    chips.push(
      <div key="gold" className="nn-chip" title="Fine gold (छापावाल) per tola — FENEGOSIDA">
        <span className="nn-chip-label">Gold · tola</span>
        <span className="nn-chip-value">रू {formatNpr(numbers.gold.fineGoldTola)}</span>
      </div>,
    );
    if (numbers.gold.silverTola) {
      chips.push(
        <div key="silver" className="nn-chip" title="Silver per tola — FENEGOSIDA">
          <span className="nn-chip-label">Silver · tola</span>
          <span className="nn-chip-value">रू {formatNpr(numbers.gold.silverTola)}</span>
        </div>,
      );
    }
  }

  if (numbers?.kathmandu) {
    const k = numbers.kathmandu;
    const a = aqiLabel(k.aqi);
    chips.push(
      <div key="aqi" className={`nn-chip nn-aqi-${a.tone}`} title={`Kathmandu US AQI ${k.aqi} (PM2.5 ${k.pm25} µg/m³) — Open-Meteo`}>
        <span className="nn-chip-label">KTM AQI</span>
        <span className="nn-chip-value">{k.aqi} · {a.label}</span>
      </div>,
      <div key="temp" className="nn-chip" title="Kathmandu temperature — Open-Meteo">
        <span className="nn-chip-label">KTM</span>
        <span className="nn-chip-value">{k.tempC}°C</span>
      </div>,
    );
  }

  if (chips.length === 0) return null;

  return (
    <div className="nn-strip" role="list" aria-label="Today's numbers for Nepal">
      {chips}
    </div>
  );
}
