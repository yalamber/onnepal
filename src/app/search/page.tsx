import type { Metadata } from 'next';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { searchAll, type SearchResults } from '@/lib/db/queries/search';
import { resolveCity } from '@/lib/helpers/city';
import SearchClient from './search-client';

export const metadata: Metadata = {
  title: 'Search — OnNepal',
  description: 'Search across classifieds, jobs, events, lost & found, places, and businesses on OnNepal.',
};

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string; loc?: string }> }) {
  const { q, loc } = await searchParams;
  // ?loc= overrides cookie. If neither, stay empty (no implicit filter the
  // user can't see).
  const effectiveLoc = (loc?.trim()) || (await resolveCity(null, undefined)) || '';

  let initialResults: SearchResults | undefined;
  if (q && q.trim().length >= 2) {
    try {
      const db = getDb(getD1Database());
      initialResults = await searchAll(db, q.trim(), effectiveLoc || undefined);
    } catch (e) {
      console.error('Search SSR error:', e);
    }
  }

  return <SearchClient initialQuery={q} initialLocation={effectiveLoc} initialResults={initialResults} />;
}
