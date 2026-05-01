'use client';

import Link from 'next/link';
import { User, ArrowLeft, Briefcase, Calendar, MapPin, Store } from 'lucide-react';
import { imageUrl } from '@/components/image-upload';
import { timeAgo } from '@/lib/time-ago';

interface UserData {
  id: string;
  username: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

interface Business {
  id: string; subdomain: string; businessName: string;
  businessCategory: string | null; logoUrl: string | null;
}
interface Classified {
  id: string; title: string; price: string | null;
  category: string; location: string | null; createdAt: string;
}
interface Job {
  id: string; title: string; company: string; category: string;
  location: string | null; salary: string | null; type: string; createdAt: string;
}
interface Event {
  id: string; title: string; category: string; startDate: string;
  location: string | null; venue: string | null; createdAt: string;
}
interface Place {
  id: string; title: string; category: string;
  location: string | null; createdAt: string;
}

interface ProfileData {
  user: UserData;
  businesses: Business[];
  classifieds: Classified[];
  jobs: Job[];
  events: Event[];
  places: Place[];
}

function formatMemberSince(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export default function UserProfile({ initialData }: { initialData: ProfileData | null }) {
  if (!initialData) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <User className="h-10 w-10 text-gray-300 mx-auto mb-4" />
        <p className="text-sm text-gray-500 mb-4">User not found</p>
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-950 transition-colors">Go home</Link>
      </div>
    );
  }

  const { user, businesses, classifieds, jobs, events, places } = initialData;
  const displayName = user.displayName || 'Anonymous';
  const avatar = user.avatarUrl ? imageUrl(user.avatarUrl) : null;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/" className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-950 transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" /> Home
        </Link>

        {/* Header */}
        <div className="flex items-start gap-4 mb-8">
          {avatar ? (
            <img src={avatar} alt={displayName} className="w-16 h-16 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
              <span className="text-xl font-bold text-gray-400">{displayName.charAt(0).toUpperCase()}</span>
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-gray-950">{displayName}</h1>
            <p className="text-sm text-gray-400">@{user.username} &middot; Member since {formatMemberSince(user.createdAt)}</p>
            {user.bio && (
              <p className="text-sm text-gray-600 mt-2 leading-relaxed whitespace-pre-wrap">{user.bio}</p>
            )}
          </div>
        </div>

        {/* Business pages */}
        {businesses.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm font-semibold text-gray-950 mb-3 flex items-center gap-2">
              <Store className="h-4 w-4 text-gray-400" /> Business Pages
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {businesses.map((b) => (
                <a key={b.id} href={`https://${b.subdomain}.onnepal.com`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors group">
                  {b.logoUrl ? (
                    <img src={imageUrl(b.logoUrl)!} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 text-gray-400 text-sm font-bold">
                      {b.businessName.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-950 group-hover:text-gray-700 truncate">{b.businessName}</p>
                    {b.businessCategory && <p className="text-xs text-gray-400 truncate">{b.businessCategory}</p>}
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {classifieds.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm font-semibold text-gray-950 mb-3">Classifieds</h2>
            <div className="space-y-1">
              {classifieds.map((c) => (
                <Link key={c.id} href={`/classifieds/post/${c.id}`}
                  className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors group">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-950 group-hover:text-gray-700 truncate">{c.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{c.location && <>{c.location} &middot; </>}{timeAgo(c.createdAt)}</p>
                  </div>
                  {c.price && <span className="text-sm font-semibold text-gray-950 flex-shrink-0">Rs. {c.price}</span>}
                </Link>
              ))}
            </div>
          </section>
        )}

        {jobs.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm font-semibold text-gray-950 mb-3 flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-gray-400" /> Jobs
            </h2>
            <div className="space-y-1">
              {jobs.map((j) => (
                <Link key={j.id} href={`/jobs/${j.id}`}
                  className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors group">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-950 group-hover:text-gray-700 truncate">{j.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{j.company}{j.location && <> &middot; {j.location}</>}</p>
                  </div>
                  {j.salary && <span className="text-xs text-gray-500 flex-shrink-0">{j.salary}</span>}
                </Link>
              ))}
            </div>
          </section>
        )}

        {events.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm font-semibold text-gray-950 mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" /> Events
            </h2>
            <div className="space-y-1">
              {events.map((e) => (
                <Link key={e.id} href={`/events/${e.id}`}
                  className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors group">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-950 group-hover:text-gray-700 truncate">{e.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{e.startDate}{e.venue && <> &middot; {e.venue}</>}{e.location && <> &middot; {e.location}</>}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {places.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm font-semibold text-gray-950 mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-400" /> Places
            </h2>
            <div className="space-y-1">
              {places.map((p) => (
                <Link key={p.id} href={`/places/${p.id}`}
                  className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors group">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-950 group-hover:text-gray-700 truncate">{p.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{p.location && <>{p.location} &middot; </>}{p.category}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {businesses.length === 0 && classifieds.length === 0 && jobs.length === 0 && events.length === 0 && places.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
            <User className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-950">No public listings</p>
            <p className="text-sm text-gray-400 mt-1">This user hasn&apos;t posted anything yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
