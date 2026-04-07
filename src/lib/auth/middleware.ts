import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './jwt';
import { getJwtSecret } from '@/lib/cloudflare';

export interface RequestWithSession extends NextRequest {
  session?: {
    userId: string;
    email: string;
    subdomain: string | null;
  };
}

export function requireAuth(
  handler: (req: RequestWithSession, context?: Record<string, unknown>) => Promise<NextResponse>
) {
  return async (req: NextRequest, context?: Record<string, unknown>) => {
    const authCookie = req.cookies.get('auth_token')?.value;

    if (!authCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await verifyToken(authCookie, getJwtSecret());

    if (!session) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const reqWithSession = req as RequestWithSession;
    reqWithSession.session = session;

    return handler(reqWithSession, context);
  };
}
