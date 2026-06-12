/**
 * Nepali news portal RSS feeds we aggregate. Each verified working as of
 * 2026-06. We store/show only title + short excerpt + outbound link — the
 * standard fair-use aggregator model; clicks go to the portal.
 *
 * If a feed dies, the fetcher degrades gracefully (Promise.allSettled) —
 * remove or replace the entry here at leisure.
 */

export interface NewsSource {
  id: string;
  name: string;
  lang: 'en' | 'np';
  feedUrl: string;
  homepage: string;
}

export const NEWS_SOURCES: NewsSource[] = [
  {
    id: 'onlinekhabar-en',
    name: 'OnlineKhabar English',
    lang: 'en',
    feedUrl: 'https://english.onlinekhabar.com/feed',
    homepage: 'https://english.onlinekhabar.com',
  },
  {
    id: 'onlinekhabar-np',
    name: 'अनलाइनखबर',
    lang: 'np',
    feedUrl: 'https://www.onlinekhabar.com/feed',
    homepage: 'https://www.onlinekhabar.com',
  },
  {
    id: 'bbc-nepali',
    name: 'BBC नेपाली',
    lang: 'np',
    feedUrl: 'https://feeds.bbci.co.uk/nepali/rss.xml',
    homepage: 'https://www.bbc.com/nepali',
  },
  {
    id: 'ratopati-np',
    name: 'रातोपाटी',
    lang: 'np',
    feedUrl: 'https://www.ratopati.com/feed',
    homepage: 'https://www.ratopati.com',
  },
  {
    id: 'setopati-np',
    name: 'सेतोपाटी',
    lang: 'np',
    feedUrl: 'https://www.setopati.com/feed',
    homepage: 'https://www.setopati.com',
  },
  {
    id: 'khabarhub-en',
    name: 'Khabarhub',
    lang: 'en',
    feedUrl: 'https://english.khabarhub.com/feed',
    homepage: 'https://english.khabarhub.com',
  },
  {
    id: 'nepalnews-en',
    name: 'NepalNews',
    lang: 'en',
    feedUrl: 'https://www.nepalnews.com/feed',
    homepage: 'https://www.nepalnews.com',
  },
];
