import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { db } from '@/lib/db';
import { files, fileAccessLogs, fileShares } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

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

    const [file] = await db
      .select()
      .from(files)
      .where(and(eq(files.id, fileId), eq(files.userId, session.user.id)));

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Log file access for recent files functionality
    await db.insert(fileAccessLogs).values({
      fileId: fileId,
      userId: session.user.id,
      action: 'view',
      ipAddress: request.headers.get('x-forwarded-for') || null,
      userAgent: request.headers.get('user-agent') || null,
    });

    return NextResponse.json(file);
  } catch (error) {
    console.error('Error fetching file:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function PUT(
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

    const body = await request.json();
    const { name, folder } = body;

    const [updatedFile] = await db
      .update(files)
      .set({
        name: name || undefined,
        folder: folder || undefined,
        updatedAt: new Date(),
      })
      .where(and(eq(files.id, fileId), eq(files.userId, session.user.id)))
      .returning();

    if (!updatedFile) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    return NextResponse.json(updatedFile);
  } catch (error) {
    console.error('Error updating file:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

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

    console.log(
      'Delete request for file ID:',
      fileId,
      'by user:',
      session.user.id,
    );

    // Check if user owns the file
    const fileWithAccess = await db
      .select({
        file: files,
        isOwner: eq(files.userId, session.user.id),
      })
      .from(files)
      .where(eq(files.id, fileId))
      .limit(1);

    if (fileWithAccess.length === 0) {
      console.log('File not found in database:', fileId);
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const { file, isOwner } = fileWithAccess[0];
    const isAdmin = session.user.isAdmin;
    console.log('File found:', {
      fileId,
      isOwner,
      isAdmin,
      fileName: file.name,
    });

    // Industry standard deletion rules:
    // 1. File owner can always delete their files
    // 2. Admin users can delete any file (if admin privileges are enabled)
    // 3. Shared file recipients cannot delete the actual file, only their access

    if (!isOwner && !isAdmin) {
      // User doesn't own the file and isn't admin
      // Check if they have shared access and want to remove their access
      const sharedAccess = await db
        .select()
        .from(fileShares)
        .where(
          and(
            eq(fileShares.fileId, fileId),
            eq(fileShares.sharedWithUserId, session.user.id),
          ),
        )
        .limit(1);

      if (sharedAccess.length > 0) {
        // User has shared access - remove their access instead of deleting the file
        await db
          .delete(fileShares)
          .where(
            and(
              eq(fileShares.fileId, fileId),
              eq(fileShares.sharedWithUserId, session.user.id),
            ),
          );

        return NextResponse.json({
          success: true,
          message: 'File access removed successfully',
          action: 'removed_access',
        });
      } else {
        return NextResponse.json(
          { error: 'Access denied. Only file owners can delete files.' },
          { status: 403 },
        );
      }
    }

    // User owns the file or is admin - proceed with logical deletion (move to trash)
    const [movedToTrash] = await db
      .update(files)
      .set({
        isDeleted: true,
        deletedAt: new Date(),
        originalFolder: file.folder, // Store original folder
        folder: '/trash', // Move to trash folder
        updatedAt: new Date(),
      })
      .where(eq(files.id, fileId))
      .returning();

    if (!movedToTrash) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Also move all associated file shares to trash (logical deletion)
    await db
      .update(fileShares)
      .set({
        // We could add a similar isDeleted field to fileShares if needed
        // For now, we'll keep the shares but they won't be accessible
      })
      .where(eq(fileShares.fileId, fileId));

    const response = {
      success: true,
      message: 'File moved to trash successfully',
      action: 'moved_to_trash',
    };
    console.log('Sending response:', response);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
