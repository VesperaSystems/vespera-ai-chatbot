import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { editDocument } from '@/lib/ai/tools/edit-document';

type LegalAnalysisIssue = {
  id: string;
  type: string;
  original_text: string;
  recommended_text: string;
  comment: string;
};

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { fileUrl, fileName, issue } = body;

    if (!fileUrl || !fileName || !issue) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 },
      );
    }

    // Use the new editDocument function that applies tracked changes
    const result = await editDocument({
      fileUrl,
      fileName,
      issues: [issue], // Pass the single issue as an array
    });

    return NextResponse.json({
      success: true,
      message: 'Document edited successfully with tracked changes',
      downloadUrl: result.downloadUrl,
      downloadFileName: result.downloadFileName,
      issueApplied: issue.id,
    });
  } catch (error) {
    console.error('Error in document edit API:', error);
    return NextResponse.json(
      { error: 'Failed to edit document' },
      { status: 500 },
    );
  }
}
