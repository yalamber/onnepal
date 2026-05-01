import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getServices, getServicesCount, createService } from '@/lib/db/queries/services';
import { getSession } from '@/lib/auth/session';
import { checkRateLimit, tooManyRequests } from '@/lib/rate-limit';
import { z } from 'zod';

const createServiceSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(2000).nullish(),
  category: z.string().min(1),
  location: z.string().max(100).nullish(),
  priceType: z.enum(['fixed', 'hourly', 'negotiable', 'free']).nullish(),
  price: z.string().max(50).nullish(),
  contactPhone: z.string().max(20).nullish(),
  contactWhatsapp: z.string().max(20).nullish(),
  imageUrls: z.array(z.string().max(500)).max(5).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const category = sp.get('category') || undefined;
    const search = sp.get('search') || undefined;
    const city = sp.get('city') || undefined;
    const page = Math.max(1, parseInt(sp.get('page') || '1', 10));
    const limit = Math.min(48, Math.max(1, parseInt(sp.get('limit') || '12', 10)));

    const d1 = getD1Database();
    const db = getDb(d1);

    const [items, total] = await Promise.all([
      getServices(db, { category, search, city, page, limit }),
      getServicesCount(db, { category, search, city }),
    ]);

    return NextResponse.json({ items, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Services API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const d1 = getD1Database();
    const rl = await checkRateLimit(d1, 'service:create', session.userId, 10, 86400);
    if (!rl.allowed) return tooManyRequests(86400);

    const body = await request.json();
    const validation = createServiceSchema.safeParse(body);
    if (!validation.success) return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten() }, { status: 400 });

    const db = getDb(d1);
    const result = await createService(db, session.userId, {
      ...validation.data,
      imageUrls: validation.data.imageUrls?.join(','),
    });

    return NextResponse.json({ success: true, id: result.id }, { status: 201 });
  } catch (error) {
    console.error('Create service error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
