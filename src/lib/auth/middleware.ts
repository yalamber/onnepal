import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './jwt';

interface RequestWithSession extends NextRequest {
  session?: {
    userId: string;
    email: string;
    username: string;
    role: string;
  };
}

export function requireAuth(
  handler: (req: RequestWithSession, context?: Record<string, unknown>) => Promise<NextResponse>,
  requiredRole?: 'moderator' | 'admin'
) {
  return async (req: NextRequest, context?: Record<string, unknown>) => {
    const authCookie = req.cookies.get('auth_token')?.value;

    if (!authCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get JWT_SECRET from env
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const session = verifyToken(authCookie, jwtSecret);

    if (!session) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check role if required
    if (requiredRole) {
      if (requiredRole === 'admin' && session.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
      }
      if (requiredRole === 'moderator' && session.role !== 'moderator' && session.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden - Moderator only' }, { status: 403 });
      }
    }

    // Attach session to request
    const reqWithSession = req as RequestWithSession;
    reqWithSession.session = session;

    return handler(reqWithSession, context);
  };
}
