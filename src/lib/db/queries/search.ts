import { sql } from 'drizzle-orm';
import { classifieds, jobs, events, lostFound, places, businesses } from '../schema';
import type { Database } from '../index';

export interface SearchResult {
  id: string;
  title: string;
  description: string | null;
  type: 'classified' | 'job' | 'event' | 'lost-found' | 'place' | 'directory';
  imageUrl: string | null;
  href: string;
}

export interface SearchResults {
  classifieds: SearchResult[];
  jobs: SearchResult[];
  events: SearchResult[];
  lostFound: SearchResult[];
  places: SearchResult[];
  directory: SearchResult[];
}

function parseFirstImage(imageUrlsJson: string | null): string | null {
  if (!imageUrlsJson) return null;
  try {
    const arr = JSON.parse(imageUrlsJson);
    if (Array.isArray(arr) && arr.length > 0 && typeof arr[0] === 'string') return arr[0];
    return null;
  } catch {
    return null;
  }
}

export async function searchAll(db: Database, query: string, location?: string): Promise<SearchResults> {
  const pattern = `%${query}%`;
  const locPattern = location && location.trim().length > 0 ? `%${location.trim()}%` : null;

  const [
    classifiedRows,
    jobRows,
    eventRows,
    lostFoundRows,
    placeRows,
    directoryRows,
  ] = await Promise.all([
    db
      .select({
        id: classifieds.id,
        title: classifieds.title,
        description: classifieds.description,
        imageUrls: classifieds.imageUrls,
      })
      .from(classifieds)
      .where(
        locPattern
          ? sql`${classifieds.status} = 'active' AND (${classifieds.title} LIKE ${pattern} COLLATE NOCASE OR ${classifieds.description} LIKE ${pattern} COLLATE NOCASE) AND (${classifieds.city} LIKE ${locPattern} COLLATE NOCASE OR ${classifieds.location} LIKE ${locPattern} COLLATE NOCASE)`
          : sql`${classifieds.status} = 'active' AND (${classifieds.title} LIKE ${pattern} COLLATE NOCASE OR ${classifieds.description} LIKE ${pattern} COLLATE NOCASE)`
      )
      .limit(5),

    db
      .select({
        id: jobs.id,
        title: jobs.title,
        description: jobs.description,
        imageUrls: jobs.imageUrls,
      })
      .from(jobs)
      .where(
        locPattern
          ? sql`${jobs.status} = 'open' AND (${jobs.title} LIKE ${pattern} COLLATE NOCASE OR ${jobs.description} LIKE ${pattern} COLLATE NOCASE) AND (${jobs.city} LIKE ${locPattern} COLLATE NOCASE OR ${jobs.location} LIKE ${locPattern} COLLATE NOCASE)`
          : sql`${jobs.status} = 'open' AND (${jobs.title} LIKE ${pattern} COLLATE NOCASE OR ${jobs.description} LIKE ${pattern} COLLATE NOCASE)`
      )
      .limit(5),

    db
      .select({
        id: events.id,
        title: events.title,
        description: events.description,
        imageUrls: events.imageUrls,
      })
      .from(events)
      .where(
        locPattern
          ? sql`${events.status} IN ('upcoming', 'ongoing') AND (${events.title} LIKE ${pattern} COLLATE NOCASE OR ${events.description} LIKE ${pattern} COLLATE NOCASE) AND (${events.city} LIKE ${locPattern} COLLATE NOCASE OR ${events.location} LIKE ${locPattern} COLLATE NOCASE OR ${events.venue} LIKE ${locPattern} COLLATE NOCASE)`
          : sql`${events.status} IN ('upcoming', 'ongoing') AND (${events.title} LIKE ${pattern} COLLATE NOCASE OR ${events.description} LIKE ${pattern} COLLATE NOCASE)`
      )
      .limit(5),

    db
      .select({
        id: lostFound.id,
        title: lostFound.title,
        description: lostFound.description,
        imageUrls: lostFound.imageUrls,
      })
      .from(lostFound)
      .where(
        locPattern
          ? sql`${lostFound.status} = 'open' AND (${lostFound.title} LIKE ${pattern} COLLATE NOCASE OR ${lostFound.description} LIKE ${pattern} COLLATE NOCASE) AND (${lostFound.city} LIKE ${locPattern} COLLATE NOCASE OR ${lostFound.location} LIKE ${locPattern} COLLATE NOCASE)`
          : sql`${lostFound.status} = 'open' AND (${lostFound.title} LIKE ${pattern} COLLATE NOCASE OR ${lostFound.description} LIKE ${pattern} COLLATE NOCASE)`
      )
      .limit(5),

    db
      .select({
        id: places.id,
        title: places.title,
        description: places.description,
        imageUrls: places.imageUrls,
      })
      .from(places)
      .where(
        locPattern
          ? sql`${places.status} = 'active' AND (${places.title} LIKE ${pattern} COLLATE NOCASE OR ${places.description} LIKE ${pattern} COLLATE NOCASE) AND (${places.city} LIKE ${locPattern} COLLATE NOCASE OR ${places.location} LIKE ${locPattern} COLLATE NOCASE)`
          : sql`${places.status} = 'active' AND (${places.title} LIKE ${pattern} COLLATE NOCASE OR ${places.description} LIKE ${pattern} COLLATE NOCASE)`
      )
      .limit(5),

    db
      .select({
        id: businesses.id,
        subdomain: businesses.subdomain,
        businessName: businesses.businessName,
        description: businesses.description,
        logoUrl: businesses.logoUrl,
      })
      .from(businesses)
      .where(
        locPattern
          ? sql`${businesses.isPublished} = 1 AND (${businesses.businessName} LIKE ${pattern} COLLATE NOCASE OR ${businesses.description} LIKE ${pattern} COLLATE NOCASE) AND (${businesses.address} LIKE ${locPattern} COLLATE NOCASE)`
          : sql`${businesses.isPublished} = 1 AND (${businesses.businessName} LIKE ${pattern} COLLATE NOCASE OR ${businesses.description} LIKE ${pattern} COLLATE NOCASE)`
      )
      .limit(5),
  ]);

  return {
    classifieds: classifiedRows.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      type: 'classified' as const,
      imageUrl: parseFirstImage(r.imageUrls),
      href: `/classifieds/post/${r.id}`,
    })),
    jobs: jobRows.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      type: 'job' as const,
      imageUrl: parseFirstImage(r.imageUrls),
      href: `/jobs/${r.id}`,
    })),
    events: eventRows.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      type: 'event' as const,
      imageUrl: parseFirstImage(r.imageUrls),
      href: `/events/${r.id}`,
    })),
    lostFound: lostFoundRows.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      type: 'lost-found' as const,
      imageUrl: parseFirstImage(r.imageUrls),
      href: `/lost-found/post/${r.id}`,
    })),
    places: placeRows.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      type: 'place' as const,
      imageUrl: parseFirstImage(r.imageUrls),
      href: `/places/${r.id}`,
    })),
    directory: directoryRows.map((r) => ({
      id: r.id,
      title: r.businessName,
      description: r.description,
      type: 'directory' as const,
      imageUrl: r.logoUrl || null,
      href: `https://${r.subdomain}.onnepal.com`,
    })),
  };
}
