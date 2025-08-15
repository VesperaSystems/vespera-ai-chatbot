import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { db } from '@/lib/db';
import { files } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(
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

    const file = fileInTrash[0];

    // Restore the file to its original location
    const [restoredFile] = await db
      .update(files)
      .set({
        isDeleted: false,
        deletedAt: null,
        folder: file.originalFolder || '/', // Restore to original folder
        originalFolder: null, // Clear the original folder reference
        updatedAt: new Date(),
      })
      .where(eq(files.id, fileId))
      .returning();

    if (!restoredFile) {
      return NextResponse.json(
        { error: 'Failed to restore file' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: 'File restored successfully',
      file: restoredFile,
    });
  } catch (error) {
    console.error('Error restoring file:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
