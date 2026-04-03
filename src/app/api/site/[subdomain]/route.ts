import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getUserBySubdomain } from '@/lib/db/queries/users';
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

    const d1 = await getD1Database();
    const db = getDb(d1);

    const user = await getUserBySubdomain(db, subdomain);
    if (!user || !user.isPublished) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Fetch all page data in parallel
    const [links, announcements, products, ctas] = await Promise.all([
      getSocialLinks(db, user.id),
      getActiveAnnouncements(db, user.id),
      getAvailableProducts(db, user.id),
      getCtaButtons(db, user.id),
    ]);

    // Record page view (fire and forget)
    const referrer = request.headers.get('referer') || undefined;
    recordPageView(db, user.id, referrer).catch(() => {});

    return NextResponse.json({
      business: {
        businessName: user.businessName,
        businessCategory: user.businessCategory,
        description: user.description,
        logoUrl: user.logoUrl,
        coverImageUrl: user.coverImageUrl,
        phone: user.phone,
        address: user.address,
        businessHours: user.businessHours,
        primaryColor: user.primaryColor,
        accentColor: user.accentColor,
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
