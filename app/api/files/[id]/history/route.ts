import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { db } from '@/lib/db';
import { files, fileAccessLogs, document } from '@/lib/db/schema';
import { eq, and, desc, like } from 'drizzle-orm';

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

    // Get the file details
    const [file] = await db
      .select()
      .from(files)
      .where(and(eq(files.id, fileId), eq(files.userId, session.user.id)));

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Get file access history
    const accessHistory = await db
      .select()
      .from(fileAccessLogs)
      .where(eq(fileAccessLogs.fileId, fileId))
      .orderBy(desc(fileAccessLogs.accessedAt))
      .limit(50);

    // Check if there are any document versions associated with this file
    // We'll look for documents that might be related to this file by name or content
    const documentVersions = await db
      .select()
      .from(document)
      .where(
        and(
          eq(document.userId, session.user.id),
          like(document.title, `%${file.name}%`),
        ),
      )
      .orderBy(desc(document.createdAt));

    // Get tracked changes for each document version
    const versionsWithChanges = await Promise.all(
      documentVersions.map(async (doc, index) => {
        try {
          // Try to fetch tracked changes for this document
          const trackedChangesResponse = await fetch(
            `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/document/tracked-changes?documentId=${doc.id}`,
            {
              headers: {
                Cookie: request.headers.get('cookie') || '',
              },
            },
          );

          let trackedChanges = [];
          if (trackedChangesResponse.ok) {
            const trackedChangesData = await trackedChangesResponse.json();
            trackedChanges = trackedChangesData.changes || [];
          }

          return {
            id: doc.id,
            version: `${2 + index}.0`,
            createdAt: doc.createdAt,
            updatedAt: doc.createdAt, // Documents don't have updatedAt, use createdAt
            description: `Document version ${index + 1}`,
            type: 'document',
            content: doc.content,
            changes: trackedChanges,
          };
        } catch (error) {
          console.error(
            'Error fetching tracked changes for document:',
            doc.id,
            error,
          );
          return {
            id: doc.id,
            version: `${2 + index}.0`,
            createdAt: doc.createdAt,
            updatedAt: doc.createdAt,
            description: `Document version ${index + 1}`,
            type: 'document',
            content: doc.content,
            changes: [],
          };
        }
      }),
    );

    // Create version history
    const versions = [
      {
        id: 'file-original',
        version: '1.0',
        createdAt: file.createdAt,
        updatedAt: file.updatedAt,
        description: 'Original uploaded file',
        type: 'file',
        changes: [],
      },
      ...versionsWithChanges,
    ];

    // Aggregate all tracked changes from all versions
    const allTrackedChanges = versionsWithChanges.flatMap(
      (version) => version.changes,
    );

    const fileHistory = {
      file: {
        id: file.id,
        name: file.name,
        type: file.type,
        size: file.size,
        createdAt: file.createdAt,
        updatedAt: file.updatedAt,
        blobUrl: file.blobUrl,
      },
      accessHistory: accessHistory.map((log) => ({
        id: log.id,
        action: log.action,
        accessedAt: log.accessedAt,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
      })),
      versions,
      trackedChanges: allTrackedChanges,
      hasDocumentVersions: documentVersions.length > 0,
    };

    return NextResponse.json(fileHistory);
  } catch (error) {
    console.error('Error fetching file history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
