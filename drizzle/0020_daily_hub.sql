-- Daily hub: aggregated news headlines (RSS) + cached external data snapshots
-- (forex, gold, AQI/weather). Both tables are caches — safe to truncate.

-- News items aggregated from Nepali news portal RSS feeds. We store only
-- title + short excerpt + link (fair-use aggregation; clicks go to the
-- source portal). `link` is the natural unique key across re-fetches.
CREATE TABLE IF NOT EXISTS news_items (
  link TEXT PRIMARY KEY,
  source TEXT NOT NULL,           -- source id, e.g. 'onlinekhabar-en'
  source_name TEXT NOT NULL,      -- display name, e.g. 'OnlineKhabar'
  lang TEXT NOT NULL,             -- 'en' | 'np'
  title TEXT NOT NULL,
  excerpt TEXT,                   -- plain text, truncated
  category TEXT,
  published_at INTEGER NOT NULL,  -- unix seconds
  fetched_at INTEGER NOT NULL     -- unix seconds
);
CREATE INDEX IF NOT EXISTS news_items_published_idx ON news_items (published_at DESC);
CREATE INDEX IF NOT EXISTS news_items_source_idx ON news_items (source);
CREATE INDEX IF NOT EXISTS news_items_lang_idx ON news_items (lang);

-- Generic JSON snapshot cache for external data (key: 'nepal-now').
CREATE TABLE IF NOT EXISTS data_snapshots (
  key TEXT PRIMARY KEY,
  payload TEXT NOT NULL,          -- JSON
  fetched_at INTEGER NOT NULL     -- unix seconds
);
