import jwt from 'jsonwebtoken';

export interface TokenPayload {
  userId: string;
  email: string;
  subdomain: string | null;
}

export function generateToken(payload: TokenPayload, secret: string): string {
  return jwt.sign(payload, secret, {
    expiresIn: '7d',
  });
}

export function verifyToken(token: string, secret: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, secret) as TokenPayload;
    return decoded;
  } catch {
    return null;
  }
}
