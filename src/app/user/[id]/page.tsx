import type { Metadata } from 'next';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getUserPublicProfile, getUserListings } from '@/lib/db/queries/user-profile';
import UserProfile from './user-profile';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const db = getDb(getD1Database());
    const user = await getUserPublicProfile(db, id);
    if (!user) return { title: 'User Not Found' };
    const name = user.displayName || 'User';
    return {
      title: `${name} on OnNepal`,
      description: `View ${name}'s profile, listings, and businesses on OnNepal.`,
      openGraph: {
        title: `${name} on OnNepal`,
        description: `View ${name}'s profile on OnNepal.`,
      },
    };
  } catch {
    return { title: 'User Profile' };
  }
}

export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let initialData = null;

  try {
    const db = getDb(getD1Database());
    const [user, listings] = await Promise.all([
      getUserPublicProfile(db, id),
      getUserListings(db, id),
    ]);

    if (user) {
      const serializeDate = (d: Date | string) =>
        d instanceof Date ? d.toISOString() : String(d);

      initialData = {
        user: {
          ...user,
          createdAt: serializeDate(user.createdAt),
        },
        businesses: listings.businesses,
        classifieds: listings.classifieds.map((i) => ({
          ...i,
          createdAt: serializeDate(i.createdAt),
        })),
        jobs: listings.jobs.map((i) => ({
          ...i,
          createdAt: serializeDate(i.createdAt),
        })),
        events: listings.events.map((i) => ({
          ...i,
          createdAt: serializeDate(i.createdAt),
        })),
        places: listings.places.map((i) => ({
          ...i,
          createdAt: serializeDate(i.createdAt),
        })),
      };
    }
  } catch (e) {
    console.error('User profile SSR error:', e);
  }

  const jsonLd = initialData
    ? {
        '@context': 'https://schema.org',
        '@type': 'ProfilePage',
        name: initialData.user.displayName || 'User',
        url: `https://onnepal.com/user/${id}`,
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <UserProfile initialData={initialData} />
    </>
  );
}
