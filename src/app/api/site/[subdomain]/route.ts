import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getBusinessBySubdomain } from '@/lib/db/queries/businesses';
import { getSocialLinks } from '@/lib/db/queries/links';
import { getActiveAnnouncements } from '@/lib/db/queries/announcements';
import { getAvailableProducts } from '@/lib/db/queries/products';
import { getCtaButtons } from '@/lib/db/queries/ctas';
import { recordPageView } from '@/lib/db/queries/analytics';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const { subdomain } = await params;

    const d1 = getD1Database();
    const db = getDb(d1);

    const business = await getBusinessBySubdomain(db, subdomain);
    if (!business || !business.isPublished) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Fetch all page data in parallel
    const [links, announcements, products, ctas] = await Promise.all([
      getSocialLinks(db, business.id),
      getActiveAnnouncements(db, business.id),
      getAvailableProducts(db, business.id),
      getCtaButtons(db, business.id),
    ]);

    // Record page view (fire and forget)
    const referrer = request.headers.get('referer') || undefined;
    recordPageView(db, business.id, referrer).catch(() => {});

    return NextResponse.json({
      business: {
        businessName: business.businessName,
        businessCategory: business.businessCategory,
        description: business.description,
        logoUrl: business.logoUrl,
        coverImageUrl: business.coverImageUrl,
        phone: business.phone,
        address: business.address,
        businessHours: business.businessHours,
        primaryColor: business.primaryColor,
        accentColor: business.accentColor,
      },
      links,
      announcements,
      products,
      ctas,
    });
  } catch (error) {
    console.error('Get site data error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
