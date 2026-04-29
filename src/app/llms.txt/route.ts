import { NextResponse } from 'next/server';

const LLMS_TXT = `# OnNepal

> Nepal's local platform — business directory, classifieds, jobs, events, and lost & found. Everything local, one place.

OnNepal combines a business directory with vanity subdomain sites (yourname.onnepal.com), a classifieds marketplace, job board, event calendar, and lost & found section. Businesses get a free single-page site with products, menu, gallery, reviews, team, FAQ, bookings, and custom themes.

## Sections

- [Business Directory](https://onnepal.com/directory): Browse and search local businesses by category and location
- [Classifieds](https://onnepal.com/classifieds): Buy, sell, rent — Nepal's free classifieds marketplace
- [Jobs](https://onnepal.com/jobs): Find or post jobs across all industries in Nepal
- [Events](https://onnepal.com/events): Discover festivals, workshops, sports, and community events
- [Lost & Found](https://onnepal.com/lost-found): Help reunite lost items and pets with their owners

## Business Pages

- [Create Business](https://onnepal.com/create-business): Claim your free subdomain at yourname.onnepal.com
- [Sign Up](https://onnepal.com/signup): Create an account to list your business or post ads

Each business page includes: social links, products & pricing, restaurant menu, photo gallery, announcements, special offers, team members, FAQ, reviews, and booking inquiries. Businesses choose from 10 curated color themes.

## API

- [Classifieds API](https://onnepal.com/api/classifieds): GET listings with ?search, ?category, ?location, ?page, ?limit
- [Jobs API](https://onnepal.com/api/jobs): GET job postings with ?search, ?category, ?page, ?limit
- [Events API](https://onnepal.com/api/events): GET events with ?search, ?category, ?page, ?limit
- [Lost & Found API](https://onnepal.com/api/lost-found): GET items with ?search, ?category, ?page, ?limit
- [Directory API](https://onnepal.com/api/directory): GET businesses with ?search, ?category, ?location, ?page, ?limit

## Optional

- [Sitemap](https://onnepal.com/sitemap.xml): XML sitemap of all pages
- [Robots](https://onnepal.com/robots.txt): Crawling rules
`;

export async function GET() {
  return new NextResponse(LLMS_TXT, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=86400' },
  });
}
