import { NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

import { auth } from '@/app/(auth)/auth';
import { db } from '@/lib/db';
import { files, fileShares, fileAccessLogs, user } from '@/lib/db/schema';

const ShareRequestSchema = z.object({
  email: z.string().email(),
  permission: z.enum(['read', 'write', 'admin']).default('read'),
  expiresAt: z.string().optional(), // ISO date string
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const fileId = Number.parseInt(id, 10);
    if (Number.isNaN(fileId)) {
      return NextResponse.json({ error: 'Invalid file ID' }, { status: 400 });
    }

    const body = await request.json();
    const validatedBody = ShareRequestSchema.safeParse(body);

    if (!validatedBody.success) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 },
      );
    }

    // Check if file exists and user owns it
    const fileRecord = await db
      .select()
      .from(files)
      .where(and(eq(files.id, fileId), eq(files.userId, session.user.id)))
      .limit(1);

    if (fileRecord.length === 0) {
      return NextResponse.json(
        { error: 'File not found or access denied' },
        { status: 404 },
      );
    }

    const fileOwnerId = fileRecord[0].userId;

    // Find user to share with
    const targetUser = await db
      .select()
      .from(user)
      .where(eq(user.email, validatedBody.data.email))
      .limit(1);

    if (targetUser.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const targetUserId = targetUser[0].id;

    // Check if trying to share with the original file owner
    if (targetUserId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot share a file with yourself' },
        { status: 400 },
      );
    }

    // Check if trying to share with the original file owner (prevent circular sharing)
    if (targetUserId === fileOwnerId) {
      return NextResponse.json(
        { error: 'Cannot share a file back to its original owner' },
        { status: 400 },
      );
    }

    // Check if already shared
    const existingShare = await db
      .select()
      .from(fileShares)
      .where(
        and(
          eq(fileShares.fileId, fileId),
          eq(fileShares.sharedWithUserId, targetUserId),
        ),
      )
      .limit(1);

    if (existingShare.length > 0) {
      return NextResponse.json(
        { error: 'File already shared with this user' },
        { status: 409 },
      );
    }

    // Create share record
    const [shareRecord] = await db
      .insert(fileShares)
      .values({
        fileId,
        sharedByUserId: session.user.id,
        sharedWithUserId: targetUserId,
        permission: validatedBody.data.permission,
        createdAt: new Date(),
        expiresAt: validatedBody.data.expiresAt
          ? new Date(validatedBody.data.expiresAt)
          : null,
      })
      .returning();

    // Log file access for recent files functionality
    await db.insert(fileAccessLogs).values({
      fileId: fileId,
      userId: session.user.id,
      action: 'share',
      ipAddress: null, // Request object doesn't have IP in this context
      userAgent: null, // Request object doesn't have user agent in this context
    });

    return NextResponse.json({
      success: true,
      share: {
        id: shareRecord.id,
        fileId: shareRecord.fileId,
        sharedWith: validatedBody.data.email,
        permission: shareRecord.permission,
        createdAt: shareRecord.createdAt,
        expiresAt: shareRecord.expiresAt,
      },
    });
  } catch (error) {
    console.error('Error sharing file:', error);
    return NextResponse.json(
      { error: 'Failed to share file' },
      { status: 500 },
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const fileId = Number.parseInt(id, 10);
    if (Number.isNaN(fileId)) {
      return NextResponse.json({ error: 'Invalid file ID' }, { status: 400 });
    }

    // Get all shares for this file (only if user owns the file)
    const shares = await db
      .select({
        share: fileShares,
        sharedWithUser: user.email,
      })
      .from(fileShares)
      .innerJoin(user, eq(fileShares.sharedWithUserId, user.id))
      .where(
        and(
          eq(fileShares.fileId, fileId),
          eq(fileShares.sharedByUserId, session.user.id),
        ),
      );

    return NextResponse.json({
      success: true,
      shares: shares.map((item) => ({
        id: item.share.id,
        sharedWith: item.sharedWithUser,
        permission: item.share.permission,
        createdAt: item.share.createdAt,
        expiresAt: item.share.expiresAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching file shares:', error);
    return NextResponse.json(
      { error: 'Failed to fetch file shares' },
      { status: 500 },
    );
  }
}
