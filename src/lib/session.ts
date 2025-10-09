import 'server-only';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const secretKey = process.env.SESSION_SECRET;
if (!secretKey) {
  throw new Error('SESSION_SECRET environment variable is not set. Please add it to your .env file.');
}
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('10 min from now')
    .sign(key);
}

export async function decrypt(input: string): Promise<any> {
    try {
      const { payload } = await jwtVerify(input, key, {
        algorithms: ['HS256'],
      });
      return payload;
    } catch (error) {
        // This could be due to an expired token or invalid signature
        console.error("JWT Verification Error:", error);
        return null;
    }
}
