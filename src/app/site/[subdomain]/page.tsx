import { notFound } from 'next/navigation';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getBusinessBySubdomain } from '@/lib/db/queries/businesses';
import { getSocialLinks } from '@/lib/db/queries/links';
import { getActiveAnnouncements } from '@/lib/db/queries/announcements';
import { getAvailableProducts } from '@/lib/db/queries/products';
import { getCtaButtons } from '@/lib/db/queries/ctas';
import { recordPageView } from '@/lib/db/queries/analytics';
import { getGalleryImages } from '@/lib/db/queries/gallery';
import { getApprovedReviews, getAverageRating } from '@/lib/db/queries/reviews';
import { getAvailableMenuItems } from '@/lib/db/queries/menu';
import { getActiveOffers } from '@/lib/db/queries/offers';
import { getTeamMembers } from '@/lib/db/queries/team';
import { getFaqs } from '@/lib/db/queries/faq';
import { BusinessPage } from '@/components/business-page';
import { unstable_cache } from 'next/cache';

export const revalidate = 300;

const getMetaData = unstable_cache(
  async (sub: string) => {
    const d1 = getD1Database();
    const db = getDb(d1);
    const business = await getBusinessBySubdomain(db, sub);
    if (!business || !business.isPublished) return null;
    return { name: business.businessName, desc: business.description };
  },
  ['site-meta'],
  { revalidate: 300 },
);

export async function generateMetadata({ params }: { params: Promise<{ subdomain: string }> }) {
  const { subdomain } = await params;
  const data = await getMetaData(subdomain);
  if (!data) return { title: 'Not Found' };
  return { title: `${data.name} | OnNepal`, description: data.desc || `${data.name} on OnNepal` };
}

export default async function SitePage({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;

  const getPageData = unstable_cache(
    async (sub: string) => {
      const d1 = getD1Database();
      const db = getDb(d1);
      const biz = await getBusinessBySubdomain(db, sub);
      if (!biz || !biz.isPublished) return null;

      const [links, announcements, products, ctas, gallery, reviews, menuItems, offers, teamMembers, faqs, avgRating] = await Promise.all([
        getSocialLinks(db, biz.id),
        getActiveAnnouncements(db, biz.id),
        getAvailableProducts(db, biz.id),
        getCtaButtons(db, biz.id),
        getGalleryImages(db, biz.id),
        getApprovedReviews(db, biz.id),
        getAvailableMenuItems(db, biz.id),
        getActiveOffers(db, biz.id),
        getTeamMembers(db, biz.id),
        getFaqs(db, biz.id),
        getAverageRating(db, biz.id),
      ]);
      return { business: biz, links, announcements, products, ctas, gallery, reviews, menuItems, offers, teamMembers, faqs, avgRating };
    },
    [`site-${subdomain}`],
    { revalidate: 300, tags: [`site:${subdomain}`] },
  );

  const data = await getPageData(subdomain);
  if (!data) notFound();
  const { business, links, announcements, products, ctas, gallery, reviews, menuItems, offers, teamMembers, faqs, avgRating } = data;

  // Fire-and-forget page view (outside cache)
  try {
    const d1 = getD1Database();
    const db = getDb(d1);
    recordPageView(db, business.id).catch(() => {});
  } catch {}

  return (
    <BusinessPage
      business={{
        businessName: business.businessName,
        businessCategory: business.businessCategory,
        description: business.description,
        logoUrl: business.logoUrl,
        coverImageUrl: business.coverImageUrl,
        coverPosition: business.coverPosition,
        phone: business.phone,
        address: business.address,
        businessHours: business.businessHours,
        whatsappNumber: business.whatsappNumber,
        mapAddress: business.mapAddress,
        bookingEnabled: business.bookingEnabled,
        isVerified: business.isVerified,
        primaryColor: business.primaryColor || '#1e293b',
        accentColor: business.accentColor || '#334155',
        subdomain: business.subdomain,
        id: business.id,
        enabledModules: business.enabledModules,
      }}
      links={links}
      announcements={announcements}
      products={products}
      ctas={ctas}
      gallery={gallery}
      reviews={reviews}
      menuItems={menuItems}
      offers={offers}
      teamMembers={teamMembers}
      faqs={faqs}
      averageRating={avgRating}
    />
  );
}
