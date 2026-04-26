import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getJobById, deleteJob, updateJob } from '@/lib/db/queries/jobs';
import { z } from 'zod';

const updateSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  company: z.string().max(200).optional(),
  description: z.string().max(5000).nullish(),
  category: z.string().optional(),
  type: z.enum(['full-time', 'part-time', 'contract', 'freelance', 'internship']).optional(),
  location: z.string().max(200).nullish(),
  isRemote: z.boolean().optional(),
  salary: z.string().max(100).nullish(),
  experience: z.string().max(100).nullish(),
  applyUrl: z.string().max(500).nullish(),
  contactEmail: z.string().max(200).nullish(),
  contactPhone: z.string().max(20).nullish(),
  status: z.enum(['open', 'closed']).optional(),
});
import { getSession, isAdmin } from '@/lib/auth/session';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const d1 = await getD1Database();
    const db = getDb(d1);
    const item = await getJobById(db, id);
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ item });
  } catch (error) {
    console.error('Get job error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const body = await request.json();
    const validation = updateSchema.safeParse(body);
    if (!validation.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    const d1 = await getD1Database();
    const db = getDb(d1);
    const admin = await isAdmin(session.userId);
    const item = admin ? await getJobById(db, id) : null;
    await updateJob(db, id, admin && item ? item.userId : session.userId, validation.data);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update job error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const d1 = await getD1Database();
    const db = getDb(d1);
    const admin = await isAdmin(session.userId);
    const item = admin ? await getJobById(db, id) : null;
    await deleteJob(db, id, admin && item ? item.userId : session.userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete job error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
