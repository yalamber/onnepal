import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getJobs, getJobsCount, createJob } from '@/lib/db/queries/jobs';
import { getSession } from '@/lib/auth/session';
import { z } from 'zod';
import { checkRateLimit, tooManyRequests } from '@/lib/rate-limit';

const createSchema = z.object({
  title: z.string().min(3).max(200),
  company: z.string().min(1).max(200),
  description: z.string().max(5000).nullish(),
  category: z.string().min(1),
  type: z.enum(['full-time', 'part-time', 'contract', 'freelance', 'internship']),
  location: z.string().max(200).nullish(),
  isRemote: z.boolean().optional(),
  salary: z.string().max(100).nullish(),
  experience: z.string().max(100).nullish(),
  applyUrl: z.string().max(500).nullish(),
  contactEmail: z.string().max(200).nullish(),
  contactPhone: z.string().max(20).nullish(),
  imageUrls: z.array(z.string().max(500)).max(3).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const category = sp.get('category') || undefined;
    const type = sp.get('type') || undefined;
    const search = sp.get('search') || undefined;
    const location = sp.get('location') || undefined;
    const page = Math.max(1, parseInt(sp.get('page') || '1', 10));
    const limit = Math.min(48, Math.max(1, parseInt(sp.get('limit') || '12', 10)));

    const d1 = getD1Database();
    const db = getDb(d1);

    const [items, total] = await Promise.all([
      getJobs(db, { category, type, search, location, page, limit }),
      getJobsCount(db, { category, type, search, location }),
    ]);

    return NextResponse.json({ items, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Jobs API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const d1 = getD1Database();
    const rl = await checkRateLimit(d1, 'job:create', session.userId, 5, 86400);
    if (!rl.allowed) return tooManyRequests(86400);

    const body = await request.json();
    const validation = createSchema.safeParse(body);
    if (!validation.success) return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten() }, { status: 400 });

    if (validation.data.imageUrls) {
      const invalid = validation.data.imageUrls.some((url) => !url.startsWith(session.userId + '/'));
      if (invalid) return NextResponse.json({ error: 'Invalid image' }, { status: 400 });
    }

    const db = getDb(d1);
    const result = await createJob(db, session.userId, {
      ...validation.data,
      description: validation.data.description ?? undefined,
      location: validation.data.location ?? undefined,
      salary: validation.data.salary ?? undefined,
      experience: validation.data.experience ?? undefined,
      applyUrl: validation.data.applyUrl ?? undefined,
      contactEmail: validation.data.contactEmail ?? undefined,
      contactPhone: validation.data.contactPhone ?? undefined,
    });

    return NextResponse.json({ success: true, id: result.id }, { status: 201 });
  } catch (error) {
    console.error('Create job error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
