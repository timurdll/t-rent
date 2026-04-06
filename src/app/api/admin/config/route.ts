import { NextResponse } from 'next/server';
import { isAdminAuthed } from '@/src/server/adminAuth';
import { readAppData, writeAppData, type AppConfig } from '@/src/server/appData';

export const runtime = 'nodejs';

export async function GET() {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const data = await readAppData();
  return NextResponse.json(data.config);
}

export async function PUT(req: Request) {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const patch = (await req.json().catch(() => null)) as Partial<AppConfig> | null;
  if (!patch) return NextResponse.json({ error: 'Bad request' }, { status: 400 });

  const data = await readAppData();
  const next: AppConfig = { ...data.config, ...patch };
  await writeAppData({ ...data, config: next });
  return NextResponse.json(next);
}

