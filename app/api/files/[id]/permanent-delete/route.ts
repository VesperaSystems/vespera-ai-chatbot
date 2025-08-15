import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { db } from '@/lib/db';
import { files, fileShares } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function DELETE(
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

    // Check if user owns the file and it's in trash
    const fileInTrash = await db
      .select()
      .from(files)
      .where(
        and(
          eq(files.id, fileId),
          eq(files.userId, session.user.id),
          eq(files.isDeleted, true),
        ),
      )
      .limit(1);

    if (fileInTrash.length === 0) {
      return NextResponse.json(
        { error: 'File not found in trash or access denied' },
        { status: 404 },
      );
    }

    // Permanently delete the file and all associated shares
    const [deletedFile] = await db
      .delete(files)
      .where(eq(files.id, fileId))
      .returning();

    if (!deletedFile) {
      return NextResponse.json(
        { error: 'Failed to delete file' },
        { status: 500 },
      );
    }

    // Also delete all associated file shares
    await db.delete(fileShares).where(eq(fileShares.fileId, fileId));

    return NextResponse.json({
      success: true,
      message: 'File permanently deleted',
      action: 'permanently_deleted',
    });
  } catch (error) {
    console.error('Error permanently deleting file:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
