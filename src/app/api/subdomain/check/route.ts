import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { isSubdomainTaken } from '@/lib/db/queries/users';
import { checkSubdomainSchema } from '@/lib/validators/subdomain';

export async function GET(request: NextRequest) {
  const name = request.nextUrl.searchParams.get('name');

  try {
    const validation = checkSubdomainSchema.safeParse({ name });
    if (!validation.success) {
      return NextResponse.json(
        { available: false, error: validation.error.flatten().fieldErrors.name?.[0] || 'Invalid name' },
        { status: 400 }
      );
    }

    const d1 = await getD1Database();
    const db = getDb(d1);

    const taken = await isSubdomainTaken(db, validation.data.name);

    return NextResponse.json({
      available: !taken,
      name: validation.data.name,
    });
  } catch (error) {
    console.error('Subdomain check error:', error);
    // Return available: true on DB errors so users aren't blocked from signing up
    // The actual check will happen again during signup
    return NextResponse.json({ available: true, name, unchecked: true });
  }
}
