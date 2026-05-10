import Link from 'next/link';
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
  const logoImg = business.logoUrl ? `https://images.onnepal.com/${business.logoUrl}` : undefined;
  return {
    title: business.businessName,
    description: business.description || `${business.businessName} on OnNepal`,
    openGraph: {
      title: business.businessName,
      description: business.description || `${business.businessName} — Business page on OnNepal`,
      url: `https://${subdomain}.onnepal.com`,
      type: 'profile',
      ...(logoImg && { images: [{ url: logoImg, width: 200, height: 200 }] }),
    },
    twitter: {
      card: 'summary',
      title: business.businessName,
      description: business.description || `${business.businessName} on OnNepal`,
      ...(logoImg && { images: [logoImg] }),
    },
    alternates: { canonical: `https://${subdomain}.onnepal.com` },
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
  // Inline empty state instead of notFound() — vinext doesn't unwrap the
  // NEXT_NOT_FOUND digest cleanly, the throw bubbles up as a Cloudflare 1101
  // exception → 500. Returning JSX keeps it a clean 200 with helpful copy.
  if (!business || !business.isPublished) return <SubdomainNotFound subdomain={subdomain} />;

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

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: business.businessName,
    description: business.description || undefined,
    url: `https://${business.subdomain}.onnepal.com`,
    ...(business.phone && { telephone: business.phone }),
    ...(business.address && { address: { '@type': 'PostalAddress', streetAddress: business.address } }),
    ...(business.logoUrl && { image: `https://images.onnepal.com/${business.logoUrl}` }),
    ...(business.businessCategory && { category: business.businessCategory }),
    ...(avgRating && avgRating.count > 0 && {
      aggregateRating: { '@type': 'AggregateRating', ratingValue: avgRating.average.toFixed(1), reviewCount: avgRating.count },
    }),
  };

  return (
    <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
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
    </>
  );
}

function SubdomainNotFound({ subdomain }: { subdomain: string }) {
  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="text-center max-w-lg">
        <p className="t-eyebrow justify-center mb-4"><span className="dot" /> Site not found</p>
        <h1 className="t-display" style={{ fontSize: 44, lineHeight: 1.05 }}>
          <em>{subdomain}.onnepal.com</em><br />isn&rsquo;t a business yet.
        </h1>
        <p className="text-[var(--ink-500)] mt-4">
          The page you&rsquo;re looking for hasn&rsquo;t been claimed, or it&rsquo;s been unpublished.
          Want this subdomain? Sign up and claim it.
        </p>
        <div className="flex gap-3 justify-center mt-8">
          <Link href="https://onnepal.com/signup" className="btn btn-primary">Claim {subdomain}</Link>
          <Link href="https://onnepal.com/directory" className="btn btn-ghost">Browse directory</Link>
        </div>
      </div>
    </main>
  );
}
