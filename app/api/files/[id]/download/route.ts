import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { db } from '@/lib/db';
import { files } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const fileId = Number.parseInt(params.id, 10);
    if (Number.isNaN(fileId)) {
      return NextResponse.json({ error: 'Invalid file ID' }, { status: 400 });
    }

    const [file] = await db
      .select()
      .from(files)
      .where(and(eq(files.id, fileId), eq(files.userId, session.user.id)));

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // For now, return a placeholder response
    // In a real implementation, you would fetch the actual file from storage
    // and return it as a blob or stream

    const response = new NextResponse('File content would be here', {
      status: 200,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${file.name}"`,
      },
    });

    return response;
  } catch (error) {
    console.error('Error downloading file:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

