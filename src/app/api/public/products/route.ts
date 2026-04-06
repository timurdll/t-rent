import { NextResponse } from 'next/server';
import { readAppData } from '@/src/server/appData';

export const runtime = 'nodejs';

export async function GET() {
  const data = await readAppData();
  return NextResponse.json(data.products);
}

