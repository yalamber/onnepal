import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getD1Database, getCloudflareEnv } from '@/lib/cloudflare';
import { createUser, getUserByEmail, getUserByUsername } from '@/lib/db/queries/users';
import { hashPassword } from '@/lib/auth/password';
import { generateToken } from '@/lib/auth/jwt';
import { setAuthCookie } from '@/lib/auth/session';
import { signupSchema } from '@/lib/validators/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = signupSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { email, username, password, displayName } = validation.data;

    // Get database
    const d1 = await getD1Database();
    const db = getDb(d1);

    // Check if email already exists
    const existingEmail = await getUserByEmail(db, email);
    if (existingEmail) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
    }

    // Check if username already exists
    const existingUsername = await getUserByUsername(db, username);
    if (existingUsername) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const userId = await createUser(db, {
      email,
      username,
      passwordHash,
      displayName,
    });

    // Generate JWT token
    const env = await getCloudflareEnv();
    const token = generateToken(
      {
        userId,
        email,
        username,
        role: 'user',
      },
      env.JWT_SECRET
    );

    // Set auth cookie
    await setAuthCookie(token);

    return NextResponse.json(
      {
        success: true,
        user: {
          id: userId,
          email,
          username,
          displayName: displayName || username,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
