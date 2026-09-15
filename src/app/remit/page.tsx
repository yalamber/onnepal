import type { Metadata } from 'next';
import Link from 'next/link';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getNumbersFresh, type NumbersSnapshot } from '@/lib/db/queries/daily';
import { fetchForexHistory, type ForexHistoryPoint } from '@/lib/nepal-data';

export const metadata: Metadata = {
  title: 'Remittance Rates — NPR Today & 30-Day Trend — OnNepal',
  description:
    'Today\'s official NRB exchange rates for USD, GBP, EUR, AUD, AED, SAR, QAR, MYR, KRW, JPY and more, plus the 30-day USD→NPR trend. Compare before you send money to Nepal.',
};

// NRB publishes one reference rate per day — refetching more often than
// half-hourly buys nothing.
export const revalidate = 1800;

/** Display order for the rate table: the big remittance corridors first. */
const TABLE_ORDER = ['USD', 'GBP', 'EUR', 'AUD', 'CAD', 'AED', 'SAR', 'QAR', 'KRW', 'JPY', 'MYR', 'INR'];

export default async function RemitPage() {
  const now = new Date();
  const db = getDb(getD1Database());

  // getNumbersFresh self-heals a stale snapshot inline (the route revalidates
  // half-hourly, so the refresh cost is rare and amortized).
  const [snap, usdHistory] = await Promise.all([
    getNumbersFresh(db, now).catch((e) => { console.error('[remit] numbers failed', e); return null as NumbersSnapshot | null; }),
    fetchForexHistory('USD', now, 30),
  ]);

  const forex = snap?.numbers.forex ?? null;
  const bySym = forex ? new Map(forex.rates.map((r) => [r.iso3, r])) : null;

  return (
    <main>
      <div className="page-hero">
        <div className="t-eyebrow"><span className="dot" /> Remittance · रेमिट्यान्स</div>
        <h1 className="page-hero-title">Send money home, <em>eyes open.</em></h1>
        <p className="page-hero-sub">
          The official rupee rate today, the trend this month, and how to compare what
          remitters actually offer you against it.
        </p>
        <p className="t-meta mt-4">
          Rates shown are Nepal Rastra Bank <em>reference</em> rates{forex ? ` for ${forex.date}` : ''} — the
          benchmark, not what any one service pays. A remitter quoting far below it deserves a comparison shop.
        </p>
      </div>

      <div className="page-shell pb-24 space-y-16">
        {/* USD headline + 30-day trend */}
        {usdHistory.length >= 2 && (
          <section>
            <h2 className="t-eyebrow mb-4">US Dollar · last 30 days</h2>
            <UsdTrend history={usdHistory} />
          </section>
        )}

        {/* Today's table */}
        {forex && bySym && (
          <section>
            <h2 className="t-eyebrow mb-4">Today&rsquo;s reference rates</h2>
            <div className="overflow-x-auto rounded-[var(--r-md)] border border-[var(--ink-200)]">
              <table className="w-full text-sm" style={{ minWidth: 480 }}>
                <thead>
                  <tr className="text-left border-b border-[var(--ink-200)]">
                    <th className="t-meta font-normal px-4 py-3">Currency</th>
                    <th className="t-meta font-normal px-4 py-3 text-right">Unit</th>
                    <th className="t-meta font-normal px-4 py-3 text-right">NRB buy (रू)</th>
                    <th className="t-meta font-normal px-4 py-3 text-right">NRB sell (रू)</th>
                  </tr>
                </thead>
                <tbody>
                  {TABLE_ORDER.map((sym) => {
                    const r = bySym.get(sym);
                    if (!r) return null;
                    return (
                      <tr key={sym} className="border-b border-[var(--ink-100)] last:border-b-0">
                        <td className="px-4 py-3">
                          <span className="font-medium text-[var(--ink-900)]">{sym}</span>
                          <span className="t-meta ml-2">{r.name}</span>
                        </td>
                        <td className="px-4 py-3 text-right text-[var(--ink-700)]">{r.unit}</td>
                        <td className="px-4 py-3 text-right text-[var(--ink-900)]" style={{ fontVariantNumeric: 'tabular-nums' }}>{r.buy.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right text-[var(--ink-900)]" style={{ fontVariantNumeric: 'tabular-nums' }}>{r.sell.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="t-meta mt-2">
              Source: Nepal Rastra Bank open data · &ldquo;Buy&rdquo; is what banks pay for the
              currency — the side that matters when money comes <em>into</em> Nepal.
            </p>
          </section>
        )}

        {/* How to compare */}
        <section className="rounded-[var(--r-lg)] border border-[var(--ink-200)] p-8">
          <h2 className="t-display" style={{ fontSize: 24 }}>The one rule of sending money</h2>
          <p className="text-[var(--ink-700)] mt-3 max-w-2xl">
            Compare the <strong>rupees that arrive</strong>, not the fee. &ldquo;Zero fee&rdquo;
            services take their cut in the exchange rate instead:
          </p>
          <p className="mt-4 p-4 rounded-[var(--r-md)] bg-[var(--ink-100)] font-mono text-sm text-[var(--ink-900)]" style={{ overflowX: 'auto' }}>
            NPR received = (amount sent − fees) × rate offered
          </p>
          <p className="text-[var(--ink-700)] mt-4 max-w-2xl">
            Run that for your actual amount across two or three services, and check the offered
            rate against the NRB reference above. And whatever the quoted rate —{' '}
            <strong>hundi is never worth it</strong>: it&rsquo;s illegal, with zero recourse when
            money disappears.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Link href="/voices/sending-money-home-comparing-remittance" className="btn btn-primary">
              How to compare your options →
            </Link>
            <Link href="/diaspora" className="btn btn-ghost">Diaspora hub</Link>
          </div>
        </section>
      </div>
    </main>
  );
}

/**
 * Stat tile + 30-day sparkline for USD→NPR, server-rendered SVG (no client
 * JS). Single series in the site accent; start/min/max/end carry direct
 * labels, and the full series is in the SVG title for assistive tech.
 */
function UsdTrend({ history }: { history: ForexHistoryPoint[] }) {
  const values = history.map((p) => p.sell);
  const first = values[0];
  const last = values[values.length - 1];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const delta = last - first;
  const deltaPct = (delta / first) * 100;

  // Geometry: pad the y-range so a flat month doesn't render as a wild swing.
  const W = 640;
  const H = 140;
  const PAD = 8;
  const span = Math.max(max - min, 0.5);
  const x = (i: number) => PAD + (i / (history.length - 1)) * (W - 2 * PAD);
  const y = (v: number) => PAD + (1 - (v - min) / span) * (H - 2 * PAD);
  const path = history.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.sell).toFixed(1)}`).join(' ');

  const fmtDay = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });

  return (
    <div className="rounded-[var(--r-lg)] border border-[var(--ink-200)] p-6 sm:p-8">
      <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
        <div>
          <div className="t-meta">USD 1 → NPR · NRB sell</div>
          <div className="t-display" style={{ fontSize: 40, lineHeight: 1.1 }}>
            रू {last.toFixed(2)}
          </div>
        </div>
        <div className={delta >= 0 ? 'text-[var(--evergreen-600)]' : 'text-[var(--crimson-600)]'} style={{ fontSize: 15 }}>
          {delta >= 0 ? '▲' : '▼'} {Math.abs(delta).toFixed(2)} ({deltaPct >= 0 ? '+' : ''}{deltaPct.toFixed(1)}%) over 30 days
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full mt-5"
        role="img"
        aria-label={`US dollar to Nepali rupee, ${fmtDay(history[0].date)} to ${fmtDay(history[history.length - 1].date)}: from ${first.toFixed(2)} to ${last.toFixed(2)}, low ${min.toFixed(2)}, high ${max.toFixed(2)}`}
        style={{ maxHeight: 160 }}
      >
        <path d={path} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={x(history.length - 1)} cy={y(last)} r="3.5" fill="var(--accent)" />
      </svg>

      <div className="flex justify-between t-meta mt-1">
        <span>{fmtDay(history[0].date)} · रू {first.toFixed(2)}</span>
        <span>low रू {min.toFixed(2)} · high रू {max.toFixed(2)}</span>
        <span>{fmtDay(history[history.length - 1].date)} · रू {last.toFixed(2)}</span>
      </div>

      <details className="mt-4">
        <summary className="t-meta cursor-pointer">Daily values (table)</summary>
        <div className="overflow-x-auto mt-2">
          <table className="text-sm" style={{ minWidth: 280 }}>
            <thead>
              <tr className="text-left border-b border-[var(--ink-200)]">
                <th className="t-meta font-normal py-1.5 pr-6">Date</th>
                <th className="t-meta font-normal py-1.5 text-right">NRB sell (रू)</th>
              </tr>
            </thead>
            <tbody>
              {history.map((p) => (
                <tr key={p.date} className="border-b border-[var(--ink-100)] last:border-b-0">
                  <td className="py-1.5 pr-6 text-[var(--ink-700)]">{fmtDay(p.date)}</td>
                  <td className="py-1.5 text-right text-[var(--ink-900)]" style={{ fontVariantNumeric: 'tabular-nums' }}>{p.sell.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
