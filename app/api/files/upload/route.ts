import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { nanoid } from 'nanoid';

import { auth } from '@/app/(auth)/auth';
import { db } from '@/lib/db';
import { files, fileAccessLogs } from '@/lib/db/schema';

// Use Blob instead of File since File is not available in Node.js environment
const FileSchema = z.object({
  file: z
    .instanceof(Blob)
    .refine((file) => file.size <= 25 * 1024 * 1024, {
      message: 'File size should be less than 25MB',
    })
    // Update the file type based on the kind of files you want to accept
    .refine(
      (file) =>
        [
          'image/jpeg',
          'image/png',
          'image/webp',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
          'application/msword', // .doc
          'text/plain', // .txt
          'application/pdf', // .pdf
          'video/mp4', // .mp4
          'video/avi', // .avi
          'video/mov', // .mov
          'application/zip', // .zip
          'application/x-zip-compressed', // .zip
        ].includes(file.type),
      {
        message: 'File type not supported',
      },
    ),
});

const MetadataSchema = z.object({
  name: z.string().min(1),
  folder: z.string().default('/'),
  description: z.string().optional(),
});

export async function POST(request: Request) {
  console.log('Upload route called');

  const session = await auth();
  console.log('Session:', session ? 'exists' : 'null');
  console.log('User ID:', session?.user?.id);

  if (!session?.user?.id) {
    console.log('User not authenticated');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (request.body === null) {
    console.log('Request body is null');
    return new Response('Request body is empty', { status: 400 });
  }

  try {
    console.log('Parsing form data...');
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const metadata = formData.get('metadata') as string;

    console.log('File received:', file ? 'yes' : 'no');
    console.log('File name:', file?.name);
    console.log('File size:', file?.size);
    console.log('File type:', file?.type);
    console.log('Metadata:', metadata);

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const validatedFile = FileSchema.safeParse({ file });

    if (!validatedFile.success) {
      const errorMessage = validatedFile.error.errors
        .map((error) => error.message)
        .join(', ');

      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    // Parse metadata
    let parsedMetadata: Record<string, any>;
    try {
      parsedMetadata = metadata ? JSON.parse(metadata) : {};
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid metadata format' },
        { status: 400 },
      );
    }

    const validatedMetadata = MetadataSchema.safeParse(parsedMetadata);
    if (!validatedMetadata.success) {
      return NextResponse.json({ error: 'Invalid metadata' }, { status: 400 });
    }

    // Get filename and create unique identifier
    const originalFilename = file.name;
    const fileExtension = originalFilename.split('.').pop() || '';
    const uniqueId = nanoid(16);
    const filename = `${uniqueId}-${originalFilename}`;
    const fileBuffer = await file.arrayBuffer();

    // Upload to Vercel Blob
    const blobData = await put(filename, fileBuffer, {
      access: 'public',
    });

    // Determine file type for display
    const getFileType = (mimeType: string, filename: string): string => {
      if (mimeType.startsWith('image/')) return 'image';
      if (mimeType.startsWith('video/')) return 'video';
      if (mimeType === 'application/pdf') return 'pdf';
      if (mimeType.includes('wordprocessingml') || mimeType.includes('msword'))
        return 'docx';
      if (mimeType === 'text/plain') return 'txt';
      if (mimeType.includes('zip')) return 'zip';

      // Fallback to extension
      const ext = filename.split('.').pop()?.toLowerCase();
      return ext || 'file';
    };

    const fileType = getFileType(file.type, originalFilename);
    const fileSize = formatFileSize(file.size);

    // Store metadata in PostgreSQL
    const [fileRecord] = await db
      .insert(files)
      .values({
        name: validatedMetadata.data.name || originalFilename,
        type: fileType,
        size: fileSize,
        blobUrl: blobData.url,
        folder: validatedMetadata.data.folder || '/',
        userId: session.user.id,
        tenantId: session.user.tenant?.id || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Log file access
    await db.insert(fileAccessLogs).values({
      fileId: fileRecord.id,
      userId: session.user.id,
      action: 'upload',
      accessedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      file: {
        id: fileRecord.id,
        name: fileRecord.name,
        type: fileRecord.type,
        size: fileRecord.size,
        blobUrl: fileRecord.blobUrl,
        folder: fileRecord.folder,
        userId: fileRecord.userId,
        createdAt: fileRecord.createdAt,
      },
      blob: blobData,
    });
  } catch (error) {
    console.error('File upload error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Error details:', {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    });
    return NextResponse.json(
      { error: `Failed to process request: ${errorMessage}` },
      { status: 500 },
    );
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
