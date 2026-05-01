import type { Metadata } from 'next';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getUserPublicProfileByUsername, getUserListings } from '@/lib/db/queries/user-profile';
import UserProfile from './user-profile';

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;
  try {
    const db = getDb(getD1Database());
    const user = await getUserPublicProfileByUsername(db, username);
    if (!user) return { title: 'User Not Found' };
    const name = user.displayName || username;
    return {
      title: `${name} (@${username}) on OnNepal`,
      description: user.bio || `View ${name}'s profile, listings, and businesses on OnNepal.`,
      openGraph: {
        title: `${name} on OnNepal`,
        description: user.bio || `View ${name}'s profile on OnNepal.`,
      },
    };
  } catch {
    return { title: 'User Profile' };
  }
}

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  let initialData = null;

  try {
    const db = getDb(getD1Database());
    const user = await getUserPublicProfileByUsername(db, username);

    if (user) {
      const listings = await getUserListings(db, user.id);
      const serializeDate = (d: Date | string) =>
        d instanceof Date ? d.toISOString() : String(d);

      initialData = {
        user: {
          ...user,
          createdAt: serializeDate(user.createdAt),
        },
        businesses: listings.businesses,
        classifieds: listings.classifieds.map((i) => ({ ...i, createdAt: serializeDate(i.createdAt) })),
        jobs: listings.jobs.map((i) => ({ ...i, createdAt: serializeDate(i.createdAt) })),
        events: listings.events.map((i) => ({ ...i, createdAt: serializeDate(i.createdAt) })),
        places: listings.places.map((i) => ({ ...i, createdAt: serializeDate(i.createdAt) })),
      };
    }
  } catch (e) {
    console.error('User profile SSR error:', e);
  }

  const jsonLd = initialData
    ? {
        '@context': 'https://schema.org',
        '@type': 'ProfilePage',
        name: initialData.user.displayName || username,
        url: `https://onnepal.com/profile/${username}`,
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}
      <UserProfile initialData={initialData} />
    </>
  );
}
