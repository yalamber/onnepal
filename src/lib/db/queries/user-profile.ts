import { eq, and, desc, sql } from 'drizzle-orm';
import { users, classifieds, jobs, events, places, businesses } from '../schema';
import type { Database } from '../index';

export async function getUserPublicProfile(db: Database, userId: string) {
  const result = await db
    .select({
      id: users.id,
      displayName: users.displayName,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return result[0] || null;
}

export async function getUserListings(db: Database, userId: string) {
  const [classifiedRows, jobRows, eventRows, placeRows, businessRows] = await Promise.all([
    db
      .select({
        id: classifieds.id,
        title: classifieds.title,
        description: classifieds.description,
        price: classifieds.price,
        category: classifieds.category,
        location: classifieds.location,
        imageUrls: classifieds.imageUrls,
        createdAt: classifieds.createdAt,
      })
      .from(classifieds)
      .where(and(eq(classifieds.userId, userId), eq(classifieds.status, 'active')))
      .orderBy(desc(classifieds.createdAt))
      .limit(10),

    db
      .select({
        id: jobs.id,
        title: jobs.title,
        company: jobs.company,
        category: jobs.category,
        location: jobs.location,
        salary: jobs.salary,
        type: jobs.type,
        createdAt: jobs.createdAt,
      })
      .from(jobs)
      .where(and(eq(jobs.userId, userId), eq(jobs.status, 'open')))
      .orderBy(desc(jobs.createdAt))
      .limit(10),

    db
      .select({
        id: events.id,
        title: events.title,
        category: events.category,
        startDate: events.startDate,
        location: events.location,
        venue: events.venue,
        imageUrls: events.imageUrls,
        createdAt: events.createdAt,
      })
      .from(events)
      .where(
        and(
          eq(events.userId, userId),
          sql`${events.status} IN ('upcoming', 'ongoing')`
        )
      )
      .orderBy(events.startDate)
      .limit(10),

    db
      .select({
        id: places.id,
        title: places.title,
        category: places.category,
        location: places.location,
        imageUrls: places.imageUrls,
        createdAt: places.createdAt,
      })
      .from(places)
      .where(and(eq(places.userId, userId), eq(places.status, 'active')))
      .orderBy(desc(places.createdAt))
      .limit(10),

    db
      .select({
        id: businesses.id,
        subdomain: businesses.subdomain,
        businessName: businesses.businessName,
        businessCategory: businesses.businessCategory,
        logoUrl: businesses.logoUrl,
      })
      .from(businesses)
      .where(and(eq(businesses.userId, userId), eq(businesses.isPublished, true)))
      .limit(10),
  ]);

  return {
    classifieds: classifiedRows,
    jobs: jobRows,
    events: eventRows,
    places: placeRows,
    businesses: businessRows,
  };
}
