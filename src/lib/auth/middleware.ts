import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './jwt';

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

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const session = verifyToken(authCookie, jwtSecret);

    if (!session) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const reqWithSession = req as RequestWithSession;
    reqWithSession.session = session;

    return handler(reqWithSession, context);
  };
}
