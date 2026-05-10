import type { Metadata } from 'next';
import Link from 'next/link';

/**
 * Universal catch-all for URLs that don't match any other route.
 *
 * Background — why this exists:
 *
 * Next App Router's normal "no route matched" path is to render
 * `app/not-found.tsx`. Internally that involves throwing a special
 * `NEXT_NOT_FOUND` error which Next's framework recognises and turns
 * into a 404 response. vinext's translation of that throw into a
 * Workers response is currently broken — the throw escapes as a
 * Cloudflare 1101 worker exception → 500 page → bad UX. (Same
 * problem with `notFound()` from inside a server component.)
 *
 * Until the upstream fix lands, this catch-all renders a friendly
 * "page not found" response with a 200 status. Status code is wrong
 * (should be 404) but the page is usable, indexing implications are
 * minor for surfaces this rarely-hit, and there's no 1101 anywhere.
 * The route is required-catch-all (`[...catchAll]`) not
 * optional-catch-all so the homepage at `app/page.tsx` still wins
 * for `/`.
 *
 * Specific dynamic routes (`/city/[slug]`, `/voices/[slug]`,
 * `/classifieds/[slug]`, etc.) take priority over this catch-all
 * because they're more specific in Next's route-matching tree.
 * Each of those is responsible for its own "not found" empty state.
 */

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: false },
};

export default async function CatchAll() {
  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="text-center max-w-lg">
        <p className="t-eyebrow justify-center mb-4">
          <span className="dot" /> Page not found
        </p>
        <h1 className="t-display" style={{ fontSize: 56, lineHeight: 1.05 }}>
          That page <em>isn&rsquo;t here.</em>
        </h1>
        <p className="text-[var(--ink-500)] mt-4">
          The link you followed may be old, or the page has moved.
          Try one of the surfaces below.
        </p>
        <div className="flex flex-wrap gap-3 justify-center mt-8">
          <Link href="/" className="btn btn-primary">Home</Link>
          <Link href="/directory" className="btn btn-ghost">Directory</Link>
          <Link href="/classifieds" className="btn btn-ghost">Classifieds</Link>
          <Link href="/voices" className="btn btn-ghost">Voices</Link>
          <Link href="/cities" className="btn btn-ghost">Cities</Link>
        </div>
      </div>
    </main>
  );
}
