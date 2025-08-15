import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { db } from '@/lib/db';
import { files, fileAccessLogs, fileShares } from '@/lib/db/schema';
import { eq, and, or } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const fileId = Number.parseInt(id, 10);
    if (Number.isNaN(fileId)) {
      return NextResponse.json({ error: 'Invalid file ID' }, { status: 400 });
    }

    // Check if user owns the file or has access to it via sharing
    const fileWithAccess = await db
      .select({
        file: files,
        hasAccess: fileShares.id,
      })
      .from(files)
      .leftJoin(
        fileShares,
        and(
          eq(fileShares.fileId, files.id),
          eq(fileShares.sharedWithUserId, session.user.id),
        ),
      )
      .where(
        and(
          eq(files.id, fileId),
          or(
            eq(files.userId, session.user.id), // User owns the file
            eq(fileShares.sharedWithUserId, session.user.id), // User has access via sharing
          ),
        ),
      )
      .limit(1);

    if (fileWithAccess.length === 0) {
      return NextResponse.json(
        { error: 'File not found or access denied' },
        { status: 404 },
      );
    }

    const file = fileWithAccess[0].file;

    // Log file access for recent files functionality
    await db.insert(fileAccessLogs).values({
      fileId: fileId,
      userId: session.user.id,
      action: 'download',
      ipAddress: request.headers.get('x-forwarded-for') || null,
      userAgent: request.headers.get('user-agent') || null,
    });

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
