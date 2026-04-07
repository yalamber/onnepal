import { SignJWT, jwtVerify } from 'jose';

export interface TokenPayload {
  userId: string;
  email: string;
  subdomain: string | null;
}

function getSecretKey(secret: string) {
  return new TextEncoder().encode(secret);
}

export async function generateToken(payload: TokenPayload, secret: string): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .setIssuedAt()
    .sign(getSecretKey(secret));
}

export async function verifyToken(token: string, secret: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(secret));
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      subdomain: (payload.subdomain as string) || null,
    };
  } catch {
    return null;
  }
}
