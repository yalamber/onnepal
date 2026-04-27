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

export async function generateMetadata({ params }: { params: Promise<{ subdomain: string }> }) {
  const { subdomain } = await params;
  const d1 = getD1Database();
  const db = getDb(d1);
  const business = await getBusinessBySubdomain(db, subdomain);
  if (!business || !business.isPublished) return { title: 'Not Found' };
  return { title: `${business.businessName} | OnNepal`, description: business.description || `${business.businessName} on OnNepal` };
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
  if (!business || !business.isPublished) notFound();

  const [links, announcements, products, ctas, gallery, reviews, menuItems, offers, teamMembers, faqs, avgRating] = await Promise.all([
    getSocialLinks(db, business.id),
    getActiveAnnouncements(db, business.id),
    getAvailableProducts(db, business.id),
    getCtaButtons(db, business.id),
    getGalleryImages(db, business.id),
    getApprovedReviews(db, business.id),
    getAvailableMenuItems(db, business.id),
    getActiveOffers(db, business.id),
    getTeamMembers(db, business.id),
    getFaqs(db, business.id),
    getAverageRating(db, business.id),
  ]);

  recordPageView(db, business.id).catch(() => {});

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
        accentColor: business.accentColor || '#1e293b',
        subdomain: business.subdomain,
        id: business.id,
        enabledModules: business.enabledModules,
      }}
      links={links}
      announcements={announcements}
      products={products.map(p => ({ id: p.id, name: p.name, description: p.description, price: p.price, imageUrl: p.imageUrl }))}
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
