import { NextResponse } from 'next/server';
import { ADMIN_COOKIE_NAME } from '@/src/server/adminAuth';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { password?: string } | null;
  const password = body?.password ?? '';

  const expected = process.env.ADMIN_PASSWORD ?? '';
  if (!expected) {
    return NextResponse.json(
      { ok: false, error: 'ADMIN_PASSWORD is not set' },
      { status: 500 }
    );
  }

  if (password !== expected) {
    return NextResponse.json({ ok: false, error: 'Invalid password' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE_NAME, '1', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}

