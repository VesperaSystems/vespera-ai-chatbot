import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { readFile, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { auth } from '@/app/(auth)/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('path');
    const fileName = searchParams.get('name');

    if (!filePath || !fileName) {
      return NextResponse.json(
        { error: 'Missing file path or name' },
        { status: 400 },
      );
    }

    // Validate that the file path is within the temp directory for security
    const tempDir = tmpdir();
    const fullPath = join(tempDir, filePath);

    if (!fullPath.startsWith(tempDir)) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 });
    }

    // Read the file
    const fileBuffer = await readFile(fullPath);

    // Create response with proper headers for DOCX download
    const response = new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': fileBuffer.length.toString(),
      },
    });

    // Clean up the temporary file after sending
    try {
      await unlink(fullPath);
      console.log('📝 Cleaned up temporary file:', fullPath);
    } catch (cleanupError) {
      console.warn('⚠️ Failed to clean up temporary file:', cleanupError);
    }

    return response;
  } catch (error) {
    console.error('Error serving edited document:', error);
    return NextResponse.json(
      { error: 'Failed to serve edited document' },
      { status: 500 },
    );
  }
}
