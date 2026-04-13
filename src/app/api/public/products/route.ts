import { NextResponse } from 'next/server';
import { prisma } from '@/src/server/prisma';

export const runtime = 'nodejs';

export async function GET() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' }
  });
  return NextResponse.json(products);
}
