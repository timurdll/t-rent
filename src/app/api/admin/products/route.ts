import { NextResponse } from 'next/server';
import { isAdminAuthed } from '@/src/server/adminAuth';
import { prisma } from '@/src/server/prisma';
import { put, del } from '@vercel/blob';

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
    const formData = await req.formData();
    const name = formData.get('name') as string;
    const priceStr = formData.get('price') as string;
    const imageFile = formData.get('image') as File | null;

    if (!name || !priceStr || !imageFile) {
      return NextResponse.json({ error: 'Missing required fields (name, price, image)' }, { status: 400 });
    }

    const price = parseFloat(priceStr);
    if (isNaN(price)) {
      return NextResponse.json({ error: 'Invalid price' }, { status: 400 });
    }

    // 1. Upload image to Vercel Blob
    const blob = await put(`products/${Date.now()}-${imageFile.name}`, imageFile, {
      access: 'public',
    });

    // 2. Save to database
    const product = await prisma.product.create({
      data: {
        name,
        price,
        imageUrl: blob.url,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create product. Full error:', error);
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const formData = await req.formData();
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const priceStr = formData.get('price') as string;
    const imageFile = formData.get('image') as File | null;

    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    let imageUrl = existingProduct.imageUrl;

    // If new image provided, upload it and delete the old one
    if (imageFile && imageFile.size > 0) {
      // 1. Upload new image
      const blob = await put(`products/${Date.now()}-${imageFile.name}`, imageFile, {
        access: 'public',
      });
      imageUrl = blob.url;

      // 2. Delete old image from Blob if it's a Vercel Blob URL
      if (existingProduct.imageUrl.includes('public.blob.vercel-storage.com')) {
        await del(existingProduct.imageUrl).catch(err => console.error('Failed to delete old blob:', err));
      }
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: name ?? existingProduct.name,
        price: priceStr ? parseFloat(priceStr) : existingProduct.price,
        imageUrl,
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
