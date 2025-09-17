
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

  // Next.js automatically loads .env.local files.
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.error('ERROR: Admin credentials not found in environment variables. Check your .env.local file and restart the server.');
    return { success: false, error: 'Error de configuración del servidor. Las credenciales de administrador no están configuradas.' };
  }

  if (email === adminEmail && password === adminPassword) {
    return { success: true };
  }

  return { success: false, error: 'Email o contraseña incorrectos.' };
}
