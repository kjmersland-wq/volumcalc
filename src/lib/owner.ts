/** Accounts that run VolumCalc while the site is closed. Safe to import on client and server. */
export const OWNER_EMAILS = ["kjmersland@gmail.com"];

export function isOwnerEmail(email: string | null | undefined): boolean {
  return Boolean(email && OWNER_EMAILS.includes(email.toLowerCase()));
}
