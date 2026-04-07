import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getD1Database, getJwtSecret } from '@/lib/cloudflare';
import { createUser, getUserByEmail, isSubdomainTaken } from '@/lib/db/queries/users';
import { hashPassword } from '@/lib/auth/password';
import { generateToken } from '@/lib/auth/jwt';
import { setAuthCookie } from '@/lib/auth/session';
import { signupWithSubdomainSchema } from '@/lib/validators/business';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = signupWithSubdomainSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { email, password, businessName, subdomain } = validation.data;

    const d1 = await getD1Database();
    const db = getDb(d1);

    const existingEmail = await getUserByEmail(db, email);
    if (existingEmail) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
    }

    const subdomainTaken = await isSubdomainTaken(db, subdomain);
    if (subdomainTaken) {
      return NextResponse.json({ error: 'This name is already taken' }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);

    const user = await createUser(db, {
      email,
      passwordHash,
      businessName,
      subdomain,
    });

    const token = await generateToken(
      {
        userId: user.id,
        email,
        subdomain: user.subdomain,
      },
      getJwtSecret()
    );

    await setAuthCookie(token);

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email,
          businessName,
          subdomain: user.subdomain,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
