import { NextResponse } from 'next/server';
import { getMenuItems, createMenuItem } from '@/lib/db/queries/menu';
import { getAuthenticatedBusiness } from '@/lib/helpers/business-auth';

export async function GET(request: Request) {
  try {
    const auth = await getAuthenticatedBusiness(request);
    if ('error' in auth) return auth.error;

    const items = await getMenuItems(auth.db, auth.businessId);

    return NextResponse.json({ menuItems: items });
  } catch (error) {
    console.error('Get menu items error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthenticatedBusiness(request);
    if ('error' in auth) return auth.error;

    const body = (await request.json()) as {
      name?: string;
      description?: string;
      price?: string;
      category?: string;
      imageKey?: string;
    };

    if (!body.name || typeof body.name !== 'string') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const result = await createMenuItem(auth.db, auth.businessId, {
      name: body.name,
      description: body.description || undefined,
      price: body.price || undefined,
      category: body.category || undefined,
      imageKey: body.imageKey || undefined,
    });

    return NextResponse.json({ success: true, id: result.id }, { status: 201 });
  } catch (error) {
    console.error('Create menu item error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
