export const ADMIN_EMAILS = [
  'maryandpopper@gmail.com',
  'enriqueespincosme@gmail.com',
] as const;

const ADMIN_EMAIL_SET = new Set<string>(ADMIN_EMAILS);

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAIL_SET.has(email.trim().toLowerCase());
}

export function getAdminNotificationEmails(): string[] {
  return Array.from(ADMIN_EMAIL_SET);
}
