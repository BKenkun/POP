
// IMPORTANT: This file is designed to be used in both Edge and Node.js runtimes.
// Do not import any server-only or client-only modules here.

import { SignJWT, jwtVerify } from 'jose';

// The secret key is read from environment variables.
// It's crucial that this is set in your deployment environment.
const secretKey = process.env.JWT_SECRET_KEY || 'super-secret-key-for-jwt-that-is-long-enough';
const key = new TextEncoder().encode(secretKey);

// This is the session payload that will be stored in the cookie.
interface AdminSessionPayload {
  email: string;
  isAdmin: true;
  expires: Date;
}

/**
 * Encrypts a session payload into a JWT.
 * This can be used in server-side environments (like Server Actions).
 * @param payload The session data to encrypt.
 * @returns A signed JWT string.
 */
export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h') // Session expires in 1 hour
    .sign(key);
}

/**
 * Decrypts a JWT session token.
 * This is safe to use in Edge environments (like Middleware).
 * @param input The JWT string to decrypt.
 * @returns The session payload if the token is valid, otherwise null.
 */
export async function decrypt(input: string): Promise<AdminSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ['HS256'],
    });
    return payload as AdminSessionPayload;
  } catch (error) {
    // This will happen if the token is expired or invalid.
    // In a production environment, you might want to log this error.
    console.log('Failed to verify token');
    return null;
  }
}
