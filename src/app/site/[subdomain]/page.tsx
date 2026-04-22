import { notFound } from 'next/navigation';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getBusinessBySubdomain } from '@/lib/db/queries/businesses';
import { getSocialLinks } from '@/lib/db/queries/links';
import { getActiveAnnouncements } from '@/lib/db/queries/announcements';
import { getAvailableProducts } from '@/lib/db/queries/products';
import { getCtaButtons } from '@/lib/db/queries/ctas';
import { recordPageView } from '@/lib/db/queries/analytics';
import { BusinessPage } from '@/components/business-page';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  const d1 = getD1Database();
  const db = getDb(d1);
  const business = await getBusinessBySubdomain(db, subdomain);

  if (!business || !business.isPublished) {
    return { title: 'Not Found' };
  }

  return {
    title: `${business.businessName} | OnNepal`,
    description: business.description || `${business.businessName} on OnNepal`,
  };
}

export default async function SitePage({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;

  const d1 = getD1Database();
  const db = getDb(d1);

  const business = await getBusinessBySubdomain(db, subdomain);
  if (!business || !business.isPublished) {
    notFound();
  }

  const [links, announcements, products, ctas] = await Promise.all([
    getSocialLinks(db, business.id),
    getActiveAnnouncements(db, business.id),
    getAvailableProducts(db, business.id),
    getCtaButtons(db, business.id),
  ]);

  // Record page view (fire and forget)
  recordPageView(db, business.id).catch(() => {});

  return (
    <BusinessPage
      business={{
        businessName: business.businessName,
        businessCategory: business.businessCategory,
        description: business.description,
        logoUrl: business.logoUrl,
        coverImageUrl: business.coverImageUrl,
        phone: business.phone,
        address: business.address,
        businessHours: business.businessHours,
        primaryColor: business.primaryColor || '#ea580c',
        accentColor: business.accentColor || '#dc2626',
      }}
      links={links}
      announcements={announcements}
      products={products}
      ctas={ctas}
    />
  );
}
