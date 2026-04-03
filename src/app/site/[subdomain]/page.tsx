import { notFound } from 'next/navigation';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getUserBySubdomain } from '@/lib/db/queries/users';
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
  const d1 = await getD1Database();
  const db = getDb(d1);
  const user = await getUserBySubdomain(db, subdomain);

  if (!user || !user.isPublished) {
    return { title: 'Not Found' };
  }

  return {
    title: `${user.businessName} | OnNepal`,
    description: user.description || `${user.businessName} on OnNepal`,
  };
}

export default async function SitePage({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;

  const d1 = await getD1Database();
  const db = getDb(d1);

  const user = await getUserBySubdomain(db, subdomain);
  if (!user || !user.isPublished) {
    notFound();
  }

  const [links, announcements, products, ctas] = await Promise.all([
    getSocialLinks(db, user.id),
    getActiveAnnouncements(db, user.id),
    getAvailableProducts(db, user.id),
    getCtaButtons(db, user.id),
  ]);

  // Record page view (fire and forget)
  recordPageView(db, user.id).catch(() => {});

  return (
    <BusinessPage
      business={{
        businessName: user.businessName,
        businessCategory: user.businessCategory,
        description: user.description,
        logoUrl: user.logoUrl,
        coverImageUrl: user.coverImageUrl,
        phone: user.phone,
        address: user.address,
        businessHours: user.businessHours,
        primaryColor: user.primaryColor || '#ea580c',
        accentColor: user.accentColor || '#dc2626',
      }}
      links={links}
      announcements={announcements}
      products={products}
      ctas={ctas}
    />
  );
}
