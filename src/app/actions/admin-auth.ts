
'use server';

import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function adminLoginAction(credentials: z.infer<typeof loginSchema>): Promise<{ success: boolean, error?: string }> {
  const parsedCredentials = loginSchema.safeParse(credentials);

  if (!parsedCredentials.success) {
    return { success: false, error: 'Invalid credentials format.' };
  }
  
  const { email, password } = parsedCredentials.data;

  // Next.js automatically loads .env files. No need for dotenv.
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.error('Admin credentials are not set in environment variables.');
    return { success: false, error: 'Server configuration error.' };
  }

  if (email === adminEmail && password === adminPassword) {
    return { success: true };
  }

  return { success: false, error: 'Invalid email or password.' };
}
