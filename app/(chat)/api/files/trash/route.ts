import { NextResponse } from 'next/server';
import { eq, and, desc } from 'drizzle-orm';

import { auth } from '@/app/(auth)/auth';
import { db } from '@/lib/db';
import { files } from '@/lib/db/schema';

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get user's deleted files (files in trash)
    const trashFiles = await db
      .select()
      .from(files)
      .where(
        and(
          eq(files.userId, session.user.id),
          eq(files.isDeleted, true), // Only deleted files
        ),
      )
      .orderBy(desc(files.deletedAt));

    // Transform data to match the file manager interface
    const transformTrashFile = (file: any) => ({
      id: file.id,
      name: file.name,
      type: file.type,
      size: file.size,
      modified: new Date(file.updatedAt).toLocaleDateString(),
      folderPath: file.folder,
      fileLink: file.blobUrl,
      deletedAt: file.deletedAt,
      originalFolder: file.originalFolder,
      daysUntilPermanentDeletion: Math.max(
        0,
        30 -
          Math.floor(
            (Date.now() - new Date(file.deletedAt).getTime()) /
              (1000 * 60 * 60 * 24),
          ),
      ),
      details: [
        { key: 'File type', value: file.type.toUpperCase() },
        { key: 'File size', value: file.size },
        {
          key: 'Deleted date',
          value: new Date(file.deletedAt).toLocaleDateString(),
        },
        { key: 'Original folder', value: file.originalFolder || '/' },
        {
          key: 'Days until permanent deletion',
          value: Math.max(
            0,
            30 -
              Math.floor(
                (Date.now() - new Date(file.deletedAt).getTime()) /
                  (1000 * 60 * 60 * 24),
              ),
          ),
        },
      ],
      admin: { name: 'Current User', avatar: '' },
      assignees: [],
      activities: [],
    });

    const trashStructure = {
      trashFiles: trashFiles.map((file) => transformTrashFile(file)),
    };

    console.log('Trash files count:', trashFiles.length);

    return NextResponse.json(trashStructure);
  } catch (error) {
    console.error('Error fetching trash files:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trash files' },
      { status: 500 },
    );
  }
}
