import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { db } from '@/lib/db';
import { document } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export interface TrackedChange {
  id: string;
  type: 'insertion' | 'deletion' | 'comment' | 'suggestion';
  originalText?: string;
  newText?: string;
  comment?: string;
  position: {
    start: number;
    end: number;
  };
  status: 'pending' | 'accepted' | 'rejected';
  suggestionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentWithTrackedChanges {
  documentId: string;
  content: string;
  changes: TrackedChange[];
  metadata?: {
    fileName?: string;
    title?: string;
    author?: string;
    createdDate?: string;
  };
}

// GET - Retrieve tracked changes for a document
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('documentId');

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 },
      );
    }

    // Get the document and its tracked changes
    const documents = await db
      .select()
      .from(document)
      .where(
        and(eq(document.id, documentId), eq(document.userId, session.user.id)),
      )
      .orderBy(desc(document.createdAt));

    if (documents.length === 0) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 },
      );
    }

    const latestDocument = documents[0];

    // For now, we'll return a basic structure
    // In a real implementation, you'd have a separate table for tracked changes
    const trackedChanges: TrackedChange[] = [];

    // If this is a document created from legal analysis, we can infer some changes
    if (latestDocument.content && documents.length > 1) {
      // Compare with previous version to detect changes
      const previousDocument = documents[1];
      const changes = detectChanges(
        previousDocument.content || '',
        latestDocument.content || '',
      );
      trackedChanges.push(...changes);
    }

    const result: DocumentWithTrackedChanges = {
      documentId: latestDocument.id,
      content: latestDocument.content || '',
      changes: trackedChanges,
      metadata: {
        title: latestDocument.title,
        author: session.user.email || 'Unknown',
        createdDate: latestDocument.createdAt.toISOString(),
      },
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching tracked changes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// POST - Save tracked changes for a document
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { documentId, changes, content } = body;

    if (!documentId || !changes || !Array.isArray(changes)) {
      return NextResponse.json(
        { error: 'Document ID and changes array are required' },
        { status: 400 },
      );
    }

    // Save the new version of the document with tracked changes
    const [newDocument] = await db
      .insert(document)
      .values({
        id: documentId,
        title: `Document with ${changes.length} tracked changes`,
        content: content,
        kind: 'text',
        userId: session.user.id,
        createdAt: new Date(),
      })
      .returning();

    // In a real implementation, you'd also save the tracked changes to a separate table
    // For now, we'll return success with the changes

    return NextResponse.json({
      success: true,
      document: newDocument,
      changes: changes,
      message: `Saved ${changes.length} tracked changes`,
    });
  } catch (error) {
    console.error('Error saving tracked changes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// Helper function to detect changes between two versions of content
function detectChanges(
  oldContent: string,
  newContent: string,
): TrackedChange[] {
  const changes: TrackedChange[] = [];

  // Simple diff algorithm - in a real implementation, you'd use a more sophisticated diff
  if (oldContent !== newContent) {
    // For now, we'll create a single change representing the entire difference
    changes.push({
      id: `change-${Date.now()}`,
      type: 'suggestion',
      originalText: oldContent,
      newText: newContent,
      comment: 'Document content was modified',
      position: {
        start: 0,
        end: Math.max(oldContent.length, newContent.length),
      },
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  return changes;
}
