import { NextResponse } from 'next/server';
import { getAppConfig } from '@/src/server/appData';

export const runtime = 'nodejs';

export async function GET() {
  const config = await getAppConfig();
  return NextResponse.json(config);
}
