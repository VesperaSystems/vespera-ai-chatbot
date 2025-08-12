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

    const [deletedFile] = await db
      .delete(files)
      .where(and(eq(files.id, fileId), eq(files.userId, session.user.id)))
      .returning();

    if (!deletedFile) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
