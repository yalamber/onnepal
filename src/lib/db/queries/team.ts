import { eq, asc, and } from 'drizzle-orm';
import { teamMembers } from '../schema';
import type { Database } from '../index';
import { generateId } from '@/lib/utils';

export async function getTeamMembers(db: Database, businessId: string) {
  return db
    .select()
    .from(teamMembers)
    .where(eq(teamMembers.businessId, businessId))
    .orderBy(asc(teamMembers.displayOrder));
}

export async function addTeamMember(
  db: Database,
  businessId: string,
  data: {
    name: string;
    role?: string;
    imageKey?: string;
  }
) {
  const id = generateId();
  const now = new Date();
  const existing = await getTeamMembers(db, businessId);

  await db.insert(teamMembers).values({
    id,
    businessId,
    name: data.name,
    role: data.role || null,
    imageKey: data.imageKey || null,
    displayOrder: existing.length,
    createdAt: now,
  });

  return { id };
}

export async function deleteTeamMember(db: Database, id: string, businessId: string) {
  await db
    .delete(teamMembers)
    .where(and(eq(teamMembers.id, id), eq(teamMembers.businessId, businessId)));
}
