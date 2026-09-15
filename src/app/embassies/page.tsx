import type { Metadata } from 'next';
import Link from 'next/link';
import { ExternalLink, Landmark } from 'lucide-react';
import { NEPAL_MISSIONS, MISSION_REGIONS, MOFA_URL, type NepalMission } from '@/lib/embassies';

export const metadata: Metadata = {
  title: 'Nepali Embassies & Consulates Abroad — OnNepal',
  description:
    'Every Embassy of Nepal and Consulate General abroad with official website links — Doha, Abu Dhabi, Dubai, Riyadh, Kuala Lumpur, Tokyo, London, Washington DC, New York, Sydney and more. For passports, police clearance, and consular services.',
};

export default function EmbassiesPage() {
  const embassies = NEPAL_MISSIONS.filter((m) => m.type === 'embassy').length;
  const consulates = NEPAL_MISSIONS.length - embassies;

  return (
    <main>
      <div className="page-hero">
        <div className="t-eyebrow"><span className="dot" /> {embassies} embassies · {consulates} consulates general</div>
        <h1 className="page-hero-title">Nepal&rsquo;s missions, <em>wherever you are.</em></h1>
        <p className="page-hero-sub">
          Passport renewals, citizenship copies, attestations, travel documents — they all go
          through your embassy or consulate. Every official website, in one list.
        </p>
        <p className="t-meta mt-4">
          Addresses, fees, and hours change — always check the mission&rsquo;s own site before
          visiting. Full directory at{' '}
          <a href={MOFA_URL} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">mofa.gov.np</a>.
        </p>
      </div>

      <div className="page-shell pb-24 space-y-12">
        {MISSION_REGIONS.map((region) => {
          const missions = NEPAL_MISSIONS.filter((m) => m.region === region);
          if (!missions.length) return null;
          return (
            <section key={region}>
              <h2 className="t-eyebrow mb-4">{region}</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {missions.map((m) => <MissionCard key={m.id} mission={m} />)}
              </ul>
            </section>
          );
        })}

        <section className="rounded-[var(--r-lg)] border border-[var(--ink-200)] p-8">
          <div className="flex items-start gap-4">
            <Landmark className="h-6 w-6 text-[var(--ink-300)] shrink-0 mt-1" />
            <div>
              <h2 className="t-display" style={{ fontSize: 22 }}>No mission in your country?</h2>
              <p className="text-[var(--ink-500)] mt-1 max-w-2xl">
                Many countries are covered by a Nepali embassy in a neighboring country — for
                example, Singapore is served from Bangkok, and several European countries route
                through Berlin or Brussels. Check the accreditation list at{' '}
                <a href={MOFA_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] underline underline-offset-4">mofa.gov.np</a>{' '}
                to find which mission covers you.
              </p>
              <p className="text-[var(--ink-500)] mt-3">
                Doing paperwork from abroad? Start with our{' '}
                <Link href="/diaspora" className="text-[var(--accent)] underline underline-offset-4">diaspora hub</Link>{' '}
                and its step-by-step consular guides.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function MissionCard({ mission }: { mission: NepalMission }) {
  const href = mission.website ?? MOFA_URL;
  return (
    <li>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-start justify-between gap-3 p-4 h-full rounded-[var(--r-md)] border border-[var(--ink-200)] bg-[var(--paper)] hover:border-[var(--ink-900)] transition-colors group"
      >
        <div>
          <div className="t-meta">{mission.flag} {mission.country}{mission.type === 'consulate-general' ? ' · Consulate General' : ''}</div>
          <div className="t-display mt-1" style={{ fontSize: 18, lineHeight: 1.25 }}>{mission.name}</div>
          {mission.note && <p className="t-meta mt-1.5">{mission.note}</p>}
          {!mission.website && <p className="t-meta mt-1.5">No official site — details via mofa.gov.np.</p>}
        </div>
        <ExternalLink className="h-4 w-4 text-[var(--ink-300)] group-hover:text-[var(--accent)] shrink-0 mt-1 transition-colors" />
      </a>
    </li>
  );
}
