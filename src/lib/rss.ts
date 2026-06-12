/**
 * Minimal RSS 2.0 / Atom parser for Cloudflare Workers.
 *
 * workerd has no DOMParser for XML, and pulling in a full XML parser is
 * overkill for well-formed feed XML from WordPress/BBC/standard CMSes.
 * This is a string/regex extractor that handles the constructs that
 * actually appear in our verified source feeds: <item>/<entry> blocks,
 * CDATA, HTML entities, and HTML-laden <description> bodies.
 *
 * Not a general XML parser — don't reuse for arbitrary XML.
 */

export interface FeedItem {
  title: string;
  link: string;
  excerpt: string | null;
  category: string | null;
  publishedAt: Date | null;
}

function block(xml: string, tag: string): string | null {
  // <tag ...>content</tag> — non-greedy, dotall via [\s\S]
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'));
  return m ? m[1] : null;
}

function stripCdata(s: string): string {
  return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
}

function decodeEntities(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

/** Strip HTML tags + boilerplate, collapse whitespace, truncate. */
export function toExcerpt(html: string, maxLen = 220): string | null {
  let text = decodeEntities(stripCdata(html))
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  // WordPress feeds append "The post X appeared first on Y." — drop it.
  text = text.replace(/The post .{0,160} appeared first on .{0,80}\.?\s*$/i, '').trim();
  if (!text) return null;
  if (text.length <= maxLen) return text;
  // Cut on a word boundary, append ellipsis.
  const cut = text.slice(0, maxLen);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(' '), maxLen - 20))}…`;
}

function cleanText(s: string | null): string {
  if (!s) return '';
  return decodeEntities(stripCdata(s)).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

function parseDate(s: string | null): Date | null {
  if (!s) return null;
  const d = new Date(cleanText(s));
  return isNaN(d.getTime()) ? null : d;
}

export function parseFeed(xml: string): FeedItem[] {
  const items: FeedItem[] = [];

  // RSS 2.0 <item> blocks; Atom <entry> blocks as fallback.
  const blocks = xml.match(/<item[\s>][\s\S]*?<\/item>/gi)
    ?? xml.match(/<entry[\s>][\s\S]*?<\/entry>/gi)
    ?? [];

  for (const b of blocks) {
    const title = cleanText(block(b, 'title'));

    // RSS: <link>url</link>. Atom: <link href="url"/>.
    let link = cleanText(block(b, 'link'));
    if (!link) {
      const m = b.match(/<link[^>]*href="([^"]+)"/i);
      link = m ? decodeEntities(m[1]) : '';
    }

    if (!title || !link || !/^https?:\/\//.test(link)) continue;

    const desc = block(b, 'description') ?? block(b, 'summary') ?? block(b, 'content');
    const publishedAt = parseDate(block(b, 'pubDate') ?? block(b, 'published') ?? block(b, 'updated') ?? block(b, 'dc:date'));
    const category = cleanText(block(b, 'category')) || null;

    items.push({
      title,
      link,
      excerpt: desc ? toExcerpt(desc) : null,
      category,
      publishedAt,
    });
  }
  return items;
}
