import { NextResponse } from 'next/server';
import { eq, and, desc, sql } from 'drizzle-orm';

import { auth } from '@/app/(auth)/auth';
import { db } from '@/lib/db';
import { files, fileShares, user } from '@/lib/db/schema';

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('Session user ID:', session.user.id);

  try {
    // Get user's own files (excluding deleted files)
    const userFiles = await db
      .select()
      .from(files)
      .where(
        and(
          eq(files.userId, session.user.id),
          eq(files.isDeleted, false), // Exclude deleted files
        ),
      )
      .orderBy(desc(files.createdAt));

    console.log('User files from DB:', userFiles);

    // Get files shared with the user (excluding deleted files)
    const sharedWithUser = await db
      .select({
        file: files,
        sharedBy: user.email,
        permission: fileShares.permission,
        sharedAt: fileShares.createdAt,
      })
      .from(fileShares)
      .innerJoin(files, eq(fileShares.fileId, files.id))
      .innerJoin(user, eq(fileShares.sharedByUserId, user.id))
      .where(
        and(
          eq(fileShares.sharedWithUserId, session.user.id),
          eq(files.isDeleted, false), // Exclude deleted files
        ),
      );

    console.log('Shared files from DB:', sharedWithUser);

    // Get recent files (last 10 uploaded files, excluding deleted files)
    const recentFiles = await db
      .select({
        file: files,
        lastAccessed: files.createdAt, // Use creation date as last accessed
        accessCount: sql<number>`1`, // Default access count of 1
      })
      .from(files)
      .where(
        and(
          eq(files.userId, session.user.id),
          eq(files.isDeleted, false), // Exclude deleted files
        ),
      )
      .orderBy(desc(files.createdAt))
      .limit(10);

    console.log('Recent files from DB:', recentFiles);

    // Transform data to match the file manager interface
    const transformFile = (file: any, additionalData: any = {}) => ({
      id: file.id,
      name: file.name,
      type: file.type,
      size: file.size,
      modified: new Date(file.updatedAt).toLocaleDateString(),
      folderPath: file.folder,
      fileLink: file.blobUrl,
      details: [
        { key: 'File type', value: file.type.toUpperCase() },
        { key: 'File size', value: file.size },
        {
          key: 'Created date',
          value: new Date(file.createdAt).toLocaleDateString(),
        },
        {
          key: 'Modified date',
          value: new Date(file.updatedAt).toLocaleDateString(),
        },
      ],
      admin: { name: 'Current User', avatar: '' },
      assignees: [],
      activities: [],
      ...additionalData,
    });

    // Organize files by folder structure
    const fileStructure = {
      userFiles: userFiles.map((file) => transformFile(file)),
      sharedWithMe: sharedWithUser.map((item) =>
        transformFile(item.file, {
          sharedBy: item.sharedBy,
          permission: item.permission,
          sharedAt: item.sharedAt,
        }),
      ),
      recentFiles: recentFiles.map((item) =>
        transformFile(item.file, {
          lastAccessed: item.lastAccessed,
          accessCount: item.accessCount,
        }),
      ),
    };

    console.log('Final API response structure:', fileStructure);
    console.log('userFiles count:', fileStructure.userFiles.length);
    console.log('sharedWithMe count:', fileStructure.sharedWithMe.length);
    console.log('recentFiles count:', fileStructure.recentFiles.length);

    return NextResponse.json(fileStructure);
  } catch (error) {
    console.error('Error fetching file structure:', error);
    return NextResponse.json(
      { error: 'Failed to fetch file structure' },
      { status: 500 },
    );
  }
}
