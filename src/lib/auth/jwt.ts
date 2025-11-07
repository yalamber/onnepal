import jwt from 'jsonwebtoken';

export interface TokenPayload {
  userId: string;
  email: string;
  username: string;
  role: 'user' | 'moderator' | 'admin';
}

export function generateToken(payload: TokenPayload, secret: string): string {
  return jwt.sign(payload, secret, {
    expiresIn: '7d', // Token expires in 7 days
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
