import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { db } from '@/lib/db';
import { files } from '@/lib/db/schema';
import { eq, } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder') || '/';
    const search = searchParams.get('search') || '';

    // Get files for the current user
    let query = db
      .select()
      .from(files)
      .where(eq(files.userId, session.user.id));

    // Filter by folder if specified
    if (folder !== '/') {
      query = query.where(eq(files.folder, folder));
    }

    const userFiles = await query;

    // Filter by search term if provided
    const filteredFiles = search
      ? userFiles.filter(
          (file) =>
            file.name.toLowerCase().includes(search.toLowerCase()) ||
            file.type.toLowerCase().includes(search.toLowerCase()),
        )
      : userFiles;

    // Transform to match the File interface
    const transformedFiles = filteredFiles.map((file) => ({
      id: file.id,
      name: file.name,
      type: file.type,
      size: file.size,
      img: file.thumbnailUrl,
      video: file.videoUrl,
      thumb: file.thumbnailUrl,
      pdf: file.pdfUrl,
      itemCount: file.itemCount,
      modified: file.updatedAt
        ? new Date(file.updatedAt).toLocaleDateString()
        : new Date().toLocaleDateString(),
      details: [
        { key: 'File type', value: file.type },
        { key: 'File size', value: file.size || 'Unknown' },
        {
          key: 'Created date',
          value: file.createdAt
            ? new Date(file.createdAt).toLocaleDateString()
            : 'Unknown',
        },
        {
          key: 'Last modified',
          value: file.updatedAt
            ? new Date(file.updatedAt).toLocaleDateString()
            : 'Unknown',
        },
      ],
      admin: {
        name: session.user.name || 'Unknown',
        avatar: session.user.image || '',
      },
      assignees: [],
      fileLink: file.folder || '/',
      activities: [],
      blobUrl: file.blobUrl,
      userId: file.userId,
      tenantId: file.tenantId,
    }));

    return NextResponse.json(transformedFiles);
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const metadata = formData.get('metadata') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Parse metadata
    const fileMetadata = metadata ? JSON.parse(metadata) : {};

    // Generate a unique filename
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;

    // Store file in database
    const [newFile] = await db
      .insert(files)
      .values({
        name: file.name,
        type: file.type,
        size: file.size.toString(),
        blobUrl: `/api/files/${fileName}`,
        folder: fileMetadata.folder || '/',
        userId: session.user.id,
        tenantId: session.user.tenantId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json({
      id: newFile.id,
      name: newFile.name,
      type: newFile.type,
      size: newFile.size,
      blobUrl: newFile.blobUrl,
      folder: newFile.folder,
      userId: newFile.userId,
      tenantId: newFile.tenantId,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
