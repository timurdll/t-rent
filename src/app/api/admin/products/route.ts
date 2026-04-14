import { NextResponse } from 'next/server';
import { isAdminAuthed } from '@/src/server/adminAuth';
import { prisma } from '@/src/server/prisma';
import { del } from '@vercel/blob';

export const runtime = 'nodejs';

export async function GET() {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json() as { name?: string; price?: number; imageUrl?: string };
    const { name, price: priceRaw, imageUrl } = body;

    if (!name || priceRaw === undefined || !imageUrl) {
      return NextResponse.json({ error: 'Missing required fields (name, price, imageUrl)' }, { status: 400 });
    }

    const price = parseFloat(String(priceRaw));
    if (isNaN(price)) {
      return NextResponse.json({ error: 'Invalid price' }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: { name, price, imageUrl },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create product:', error);
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json() as { id?: string; name?: string; price?: number; imageUrl?: string };
    const { id, name, price: priceRaw, imageUrl: newImageUrl } = body;

    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // If a new image URL was provided and it differs from the old one, delete the old blob
    if (newImageUrl && newImageUrl !== existingProduct.imageUrl) {
      if (existingProduct.imageUrl.includes('public.blob.vercel-storage.com')) {
        await del(existingProduct.imageUrl).catch(err => console.error('Failed to delete old blob:', err));
      }
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: name ?? existingProduct.name,
        price: priceRaw !== undefined ? parseFloat(String(priceRaw)) : existingProduct.price,
        imageUrl: newImageUrl ?? existingProduct.imageUrl,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update product:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = (await req.json().catch(() => null)) as { id?: string } | null;
    const id = body?.id;

    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // 1. Delete image from Vercel Blob
    if (product.imageUrl.includes('public.blob.vercel-storage.com')) {
      await del(product.imageUrl).catch(err => console.error('Failed to delete blob on product deletion:', err));
    }

    // 2. Delete from database
    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Failed to delete product:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
