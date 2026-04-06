import { cookies } from 'next/headers';

const COOKIE_NAME = 't_rent_admin';

export const ADMIN_COOKIE_NAME = COOKIE_NAME;

export async function isAdminAuthed(): Promise<boolean> {
  const jar = await cookies();
  return jar.get(COOKIE_NAME)?.value === '1';
}

