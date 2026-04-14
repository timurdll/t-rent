import { NextResponse } from 'next/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { isAdminAuthed } from '@/src/server/adminAuth';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  if (!(await isAdminAuthed()))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'],
          maximumSizeInBytes: 20 * 1024 * 1024, // 20 MB
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ pathname }),
        };
      },
      onUploadCompleted: async () => {
        // Nothing to do here – the admin page handles saving to DB
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
