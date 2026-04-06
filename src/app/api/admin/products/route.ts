import { NextResponse } from 'next/server';
import { isAdminAuthed } from '@/src/server/adminAuth';
import { readAppData, writeAppData, newId, type Product } from '@/src/server/appData';

export const runtime = 'nodejs';

export async function GET() {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const data = await readAppData();
  return NextResponse.json(data.products);
}

export async function POST(req: Request) {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = (await req.json().catch(() => null)) as Partial<Product> | null;
  if (!body?.name || typeof body.price !== 'number' || !body.imageUrl) {
    return NextResponse.json({ error: 'Invalid product' }, { status: 400 });
  }

  const data = await readAppData();
  const created: Product = { id: newId(), name: body.name, price: body.price, imageUrl: body.imageUrl };
  const next = { ...data, products: [created, ...data.products] };
  await writeAppData(next);
  return NextResponse.json(created, { status: 201 });
}

export async function PUT(req: Request) {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = (await req.json().catch(() => null)) as Partial<Product> | null;
  if (!body?.id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const data = await readAppData();
  const idx = data.products.findIndex(p => p.id === body.id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const current = data.products[idx];
  const updated: Product = {
    ...current,
    ...(body.name ? { name: body.name } : null),
    ...(typeof body.price === 'number' ? { price: body.price } : null),
    ...(body.imageUrl ? { imageUrl: body.imageUrl } : null),
  };

  const products = [...data.products];
  products[idx] = updated;
  await writeAppData({ ...data, products });
  return NextResponse.json(updated);
}

export async function DELETE(req: Request) {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = (await req.json().catch(() => null)) as { id?: string } | null;
  if (!body?.id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const data = await readAppData();
  const products = data.products.filter(p => p.id !== body.id);
  await writeAppData({ ...data, products });
  return NextResponse.json({ ok: true });
}

