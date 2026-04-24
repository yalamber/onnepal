import { NextResponse } from 'next/server';
import { getTeamMembers, addTeamMember } from '@/lib/db/queries/team';
import { getAuthenticatedBusiness } from '@/lib/helpers/business-auth';

export async function GET(request: Request) {
  try {
    const auth = await getAuthenticatedBusiness(request);
    if ('error' in auth) return auth.error;

    const members = await getTeamMembers(auth.db, auth.businessId);

    return NextResponse.json({ team: members });
  } catch (error) {
    console.error('Get team members error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthenticatedBusiness(request);
    if ('error' in auth) return auth.error;

    const body = (await request.json()) as {
      name?: string;
      role?: string;
      imageKey?: string;
    };

    if (!body.name || typeof body.name !== 'string') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const result = await addTeamMember(auth.db, auth.businessId, {
      name: body.name,
      role: body.role || undefined,
      imageKey: body.imageKey || undefined,
    });

    return NextResponse.json({ success: true, id: result.id }, { status: 201 });
  } catch (error) {
    console.error('Add team member error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
